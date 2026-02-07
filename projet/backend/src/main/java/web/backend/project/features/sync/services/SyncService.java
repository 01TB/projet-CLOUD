package web.backend.project.features.sync.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import web.backend.project.entities.SyncableEntity;
import web.backend.project.entities.dto.FirebaseSerializable;
import web.backend.project.features.sync.dto.SyncRequest;
import web.backend.project.features.sync.dto.SyncResponse;
import web.backend.project.features.sync.dto.SyncResponse.EntitySyncResult;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service principal d'orchestration de la synchronisation
 * Utilise EntitySyncRegistry pour une gestion générique des entités
 */
@Service
public class SyncService {

    private static final Logger logger = LoggerFactory.getLogger(SyncService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    private final FirebaseSyncService firebaseSyncService;
    private final EntitySyncHandler entitySyncHandler;
    private final EntitySyncRegistry syncRegistry;

    @PersistenceContext
    private EntityManager entityManager;

    // Ancien système pour rétro-compatibilité
    private final Map<String, JpaRepository<?, Integer>> repositories;

    public SyncService(FirebaseSyncService firebaseSyncService,
            EntitySyncHandler entitySyncHandler,
            EntitySyncRegistry syncRegistry) {
        this.firebaseSyncService = firebaseSyncService;
        this.entitySyncHandler = entitySyncHandler;
        this.syncRegistry = syncRegistry;
        this.repositories = new HashMap<>();
    }

    /**
     * Enregistre un repository pour un type d'entité (rétro-compatibilité)
     */
    public void registerRepository(String entityType, JpaRepository<?, Integer> repository) {
        repositories.put(entityType, repository);
        logger.info("Repository registered for entity type: {}", entityType);
    }

    /**
     * Point d'entrée principal pour la synchronisation
     */
    @Transactional
    public SyncResponse synchronize(SyncRequest request) {
        System.out.println("Starting synchronization with request: " + request);
        SyncResponse response = new SyncResponse(true, "Synchronization completed");

        try {
            for (String entityType : request.getEntityTypes()) {
                logger.info("Starting sync for entity type: {}", entityType);

                SyncResponse.EntitySyncResult result = new SyncResponse.EntitySyncResult();

                switch (request.getDirection()) {
                    case PUSH:
                        result = performPush(entityType, request.getForceSync());
                        break;
                    case PULL:
                        result = performPull(entityType);
                        break;
                    case BIDIRECTIONAL:
                        SyncResponse.EntitySyncResult pushResult = performPush(entityType, request.getForceSync());
                        SyncResponse.EntitySyncResult pullResult = performPull(entityType);
                        result = mergeSyncResults(pushResult, pullResult);
                        break;
                }

                response.getResults().put(entityType, result);
                logger.info("Sync completed for {}: pushed={}, pulled={}, failed={}",
                        entityType, result.getPushed(), result.getPulled(), result.getFailed());
            }
        } catch (Exception e) {
            logger.error("Synchronization failed", e);
            response.setSuccess(false);
            response.setMessage("Synchronization failed: " + e.getMessage());
            response.addError(e.getMessage());
        }

        return response;
    }

    /**
     * Effectue un push Backend → Firebase
     * Utilise le système générique via EntitySyncRegistry
     */
    @SuppressWarnings("unchecked")
    private <E extends SyncableEntity<D>, D extends FirebaseSerializable> EntitySyncResult performPush(
            String entityType, Boolean forceSync) {
        EntitySyncResult result = new EntitySyncResult();

        try {
            // Vérifie si le handler est enregistré
            if (!syncRegistry.isRegistered(entityType)) {
                logger.warn("No handler registered for entity type: {}", entityType);
                result.incrementFailed();
                return result;
            }

            // Récupère les entités non synchronisées via le nouveau système
            List<E> unsyncedEntities = entitySyncHandler.getUnsyncedEntities(entityType);

            if (unsyncedEntities.isEmpty()) {
                logger.info("No unsynced entities found for {}", entityType);
                return result;
            }

            // Conversion directe via l'interface SyncableEntity
            List<D> dtos = entitySyncHandler.convertEntitiesToDTOs(unsyncedEntities);

            // Convertit en FirebaseSerializable pour Firebase
            List<FirebaseSerializable> syncableDTOs = (List<FirebaseSerializable>) (List<?>) dtos;

            // Pousse vers Firebase (entityType est déjà en snake_case)
            int pushed = firebaseSyncService.pushToFirebase(entityType, syncableDTOs);

            // Marque comme synchronisé via le nouveau système
            entitySyncHandler.markAsSynced(entityType, unsyncedEntities);

            result.setPushed(pushed);
            logger.info("Pushed {} entities of type {} to Firebase", pushed, entityType);

        } catch (Exception e) {
            logger.error("Push failed for entity type: {}", entityType, e);
            result.incrementFailed();
        }

        return result;
    }

    /**
     * Effectue un pull Firebase → Backend
     * Après traitement, repousse les entités vers Firebase avec synchro=true
     */
    @SuppressWarnings("unchecked")
    private EntitySyncResult performPull(String entityType) {
        SyncResponse.EntitySyncResult result = new SyncResponse.EntitySyncResult();

        try {
            // Vérifie si le handler est enregistré
            if (!syncRegistry.isRegistered(entityType)) {
                logger.warn("No handler registered for entity type: {}", entityType);
                result.incrementFailed();
                return result;
            }

            // Récupère depuis Firebase (entityType est déjà en snake_case)
            List<Map<String, Object>> firebaseData = firebaseSyncService.pullFromFirebase(entityType);

            // Log détaillé de la réponse Firebase (JSON prettifié) pour debug
            if (logger.isDebugEnabled()) {
                try {
                    String pretty = OBJECT_MAPPER.writeValueAsString(firebaseData);
                    logger.debug("Full Firebase response for {} ({} items):\n{}", entityType, firebaseData.size(),
                            pretty);
                } catch (JsonProcessingException e) {
                    logger.debug("Firebase response for {}: size={} data={}", entityType, firebaseData.size(),
                            firebaseData);
                }
            }

            if (firebaseData.isEmpty()) {
                logger.info("No data found in Firebase for {}", entityType);
                return result;
            }

            // Met à jour ou crée les entités via le système générique
            // Collecte les entités traitées pour les repousser vers Firebase
            List<SyncableEntity<?>> processedEntities = new ArrayList<>();

            for (Map<String, Object> data : firebaseData) {
                try {
                    SyncableEntity<?> savedEntity = entitySyncHandler.updateOrCreateFromFirebase(entityType, data);
                    processedEntities.add(savedEntity);
                    result.incrementPulled();
                } catch (Exception e) {
                    logger.error("Failed to pull entity of type {} for data {}: {}", entityType, data, e.getMessage());
                    logger.debug("Stacktrace for failed entity update:", e);
                    result.incrementFailed();
                }
            }

            logger.info("Pulled {} entities of type {} from Firebase", result.getPulled(), entityType);

            // Après traitement, repousse les entités vers Firebase avec synchro=true
            if (!processedEntities.isEmpty()) {
                try {
                    List<FirebaseSerializable> dtos = processedEntities.stream()
                            .map(entity -> {
                                FirebaseSerializable dto = ((SyncableEntity<FirebaseSerializable>) entity).toDTO();
                                dto.setSynchro(true);
                                return dto;
                            })
                            .collect(Collectors.toList());

                    int pushed = firebaseSyncService.pushToFirebase(entityType, dtos);
                    result.setPushed(pushed);
                    logger.info("Pushed back {} entities of type {} to Firebase after pull (synchro=true)",
                            pushed, entityType);
                } catch (Exception e) {
                    logger.error("Failed to push back entities to Firebase after pull for type {}: {}",
                            entityType, e.getMessage());
                    logger.debug("Push-back stacktrace:", e);
                }
            }

        } catch (Exception e) {
            logger.error("Pull failed for entity type: {}", entityType, e);
            result.incrementFailed();
        }

        return result;
    }

    /**
     * Fusionne les résultats de push et pull
     */
    private EntitySyncResult mergeSyncResults(
            SyncResponse.EntitySyncResult pushResult,
            SyncResponse.EntitySyncResult pullResult) {

        SyncResponse.EntitySyncResult merged = new SyncResponse.EntitySyncResult();
        merged.setPushed(pushResult.getPushed() + pullResult.getPushed());
        merged.setPulled(pushResult.getPulled() + pullResult.getPulled());
        merged.setFailed(pushResult.getFailed() + pullResult.getFailed());
        merged.setConflicts(pushResult.getConflicts() + pullResult.getConflicts());

        return merged;
    }

    /**
     * Vérifie si un type d'entité est enregistré
     */
    public boolean isEntityTypeRegistered(String entityType) {
        return syncRegistry.isRegistered(entityType);
    }

    /**
     * Liste tous les types d'entités enregistrés
     */
    public List<String> getRegisteredEntityTypes() {
        return syncRegistry.getRegisteredTypes();
    }
}