package web.backend.project.features.sync.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import web.backend.project.entities.SyncableEntity;
import web.backend.project.entities.dto.FirebaseSerializable;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Registre central pour tous les handlers d'entités synchronisables
 * Permet une gestion générique sans switch/case
 */
@Component
public class EntitySyncRegistry {

    private static final Logger logger = LoggerFactory.getLogger(EntitySyncRegistry.class);

    private final Map<String, EntityTypeHandler<?, ?>> handlers = new HashMap<>();

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Enregistre un handler pour un type d'entité
     */
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> void register(
            EntityTypeHandler<E, D> handler) {
        handlers.put(handler.getEntityType(), handler);
        logger.info("Registered sync handler for entity type: {}", handler.getEntityType());
    }

    /**
     * Récupère un handler par type d'entité (typé)
     */
    @SuppressWarnings("unchecked")
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> Optional<EntityTypeHandler<E, D>> getHandler(
            String entityType) {
        return Optional.ofNullable((EntityTypeHandler<E, D>) handlers.get(entityType));
    }

    /**
     * Récupère un handler par type d'entité (non typé, pour usage générique)
     */
    public Optional<EntityTypeHandler<?, ?>> getHandlerRaw(String entityType) {
        return Optional.ofNullable(handlers.get(entityType));
    }

    /**
     * Vérifie si un type d'entité est enregistré
     */
    public boolean isRegistered(String entityType) {
        return handlers.containsKey(entityType);
    }

    /**
     * Liste tous les types d'entités enregistrés
     */
    public List<String> getRegisteredTypes() {
        return List.copyOf(handlers.keySet());
    }

    /**
     * Récupère les entités non synchronisées pour un type donné
     */
    @SuppressWarnings("unchecked")
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> List<E> getUnsyncedEntities(
            String entityType) {
        EntityTypeHandler<E, D> handler = (EntityTypeHandler<E, D>) handlers.get(entityType);
        if (handler == null) {
            throw new IllegalArgumentException("No handler registered for: " + entityType);
        }

        return handler.getRepository().findAll().stream()
                .filter(entity -> entity.getSynchro() != null && !entity.getSynchro())
                .collect(Collectors.toList());
    }

    /**
     * Convertit les entités en DTOs
     */
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> List<D> convertToDTOs(List<E> entities) {
        return entities.stream()
                .map(SyncableEntity::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marque les entités comme synchronisées
     */
    @SuppressWarnings("unchecked")
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> void markAsSynced(
            String entityType, List<E> entities) {
        EntityTypeHandler<E, D> handler = (EntityTypeHandler<E, D>) handlers.get(entityType);
        if (handler == null) {
            throw new IllegalArgumentException("No handler registered for: " + entityType);
        }

        entities.forEach(entity -> entity.setSynchro(true));
        handler.getRepository().saveAll(entities);
    }

    /**
     * Met à jour ou crée une entité depuis les données Firebase
     * Clears the persistence context on failure to prevent dirty session state
     */
    @SuppressWarnings("unchecked")
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> E updateOrCreateFromFirebase(
            String entityType, Map<String, Object> firebaseData) {
        EntityTypeHandler<E, D> handler = (EntityTypeHandler<E, D>) handlers.get(entityType);
        if (handler == null) {
            throw new IllegalArgumentException("No handler registered for: " + entityType);
        }

        try {
            return handler.updateOrCreate(firebaseData, entityManager);
        } catch (Exception e) {
            // Clear the persistence context to prevent dirty session state
            // This ensures subsequent operations aren't affected by this failure
            entityManager.clear();
            throw e;
        }
    }
}
