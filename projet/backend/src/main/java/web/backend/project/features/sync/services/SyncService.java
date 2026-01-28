package web.backend.project.features.sync.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import web.backend.project.entities.Syncable;
import web.backend.project.entities.dto.SyncableDTO;
import web.backend.project.features.sync.dto.SyncRequest;
import web.backend.project.features.sync.dto.SyncResponse;
import web.backend.project.features.sync.dto.SyncResponse.EntitySyncResult;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service principal d'orchestration de la synchronisation
 * Amélioration: Meilleure gestion des types génériques
 */
@Service
public class SyncService {

    private static final Logger logger = LoggerFactory.getLogger(SyncService.class);

    private final FirebaseSyncService firebaseSyncService;
    private final EntitySyncHandler entitySyncHandler;
    private final Map<String, JpaRepository<?, Integer>> repositories;

    public SyncService(FirebaseSyncService firebaseSyncService,
            EntitySyncHandler entitySyncHandler) {
        this.firebaseSyncService = firebaseSyncService;
        this.entitySyncHandler = entitySyncHandler;
        this.repositories = new HashMap<>();
    }

    /**
     * Enregistre un repository pour un type d'entité
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
     * Amélioration: Meilleure gestion des types génériques avec Syncable
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    private EntitySyncResult performPush(String entityType, Boolean forceSync) {
        EntitySyncResult result = new EntitySyncResult();

        try {
            // Cast vers JpaRepository avec contrainte Syncable
            JpaRepository<? extends Syncable<?>, Integer> repository = (JpaRepository<? extends Syncable<?>, Integer>) repositories
                    .get(entityType);

            if (repository == null) {
                logger.warn("No repository found for entity type: {}", entityType);
                result.incrementFailed();
                return result;
            }

            // Récupère les entités non synchronisées
            List<? extends Syncable<?>> unsyncedEntities = entitySyncHandler.getUnsyncedEntities(
                    (JpaRepository) repository);

            if (unsyncedEntities.isEmpty()) {
                logger.info("No unsynced entities found for {}", entityType);
                return result;
            }

            // AMÉLIORATION MAJEURE: Conversion directe sans passer entityType
            // Utilise la méthode toDTO() de l'interface Syncable
            List<SyncableDTO> dtos = entitySyncHandler.convertEntitiesToSyncableDTOs(unsyncedEntities);

            // Pousse vers Firebase
            String collectionName = entityType.toLowerCase();
            int pushed = firebaseSyncService.pushToFirebase(collectionName, dtos);

            // Marque comme synchronisé
            entitySyncHandler.markAsSynced((List) unsyncedEntities, (JpaRepository) repository);

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
     */
    @SuppressWarnings("unchecked")
    private EntitySyncResult performPull(String entityType) {
        SyncResponse.EntitySyncResult result = new SyncResponse.EntitySyncResult();

        try {
            JpaRepository<Object, Integer> repository = (JpaRepository<Object, Integer>) repositories.get(entityType);

            if (repository == null) {
                logger.warn("No repository found for entity type: {}", entityType);
                result.incrementFailed();
                return result;
            }

            // Récupère depuis Firebase
            String collectionName = entityType.toLowerCase();
            List<Map<String, Object>> firebaseData = firebaseSyncService.pullFromFirebase(collectionName);

            if (firebaseData.isEmpty()) {
                logger.info("No data found in Firebase for {}", entityType);
                return result;
            }

            // Met à jour ou crée les entités
            for (Map<String, Object> data : firebaseData) {
                try {
                    entitySyncHandler.updateOrCreateEntity(data, repository, entityType);
                    result.incrementPulled();
                } catch (Exception e) {
                    logger.error("Failed to pull entity", e);
                    result.incrementFailed();
                }
            }

            logger.info("Pulled {} entities of type {} from Firebase", result.getPulled(), entityType);

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
     * Vérifie si un repository est enregistré
     */
    public boolean isRepositoryRegistered(String entityType) {
        return repositories.containsKey(entityType);
    }
}