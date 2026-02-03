package web.backend.project.features.sync.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.backend.project.entities.SyncableEntity;
import web.backend.project.entities.dto.FirebaseSerializable;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler simplifié pour gérer la synchronisation des entités
 * Utilise EntitySyncRegistry pour une logique 100% générique
 */
@Service
public class EntitySyncHandler {

    private final EntitySyncRegistry syncRegistry;

    public EntitySyncHandler(EntitySyncRegistry syncRegistry) {
        this.syncRegistry = syncRegistry;
    }

    /**
     * Récupère les entités non synchronisées pour un type donné
     */
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> List<E> getUnsyncedEntities(
            String entityType) {
        return syncRegistry.getUnsyncedEntities(entityType);
    }

    /**
     * Marque les entités comme synchronisées
     */
    @Transactional
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> void markAsSynced(
            String entityType, List<E> entities) {
        System.out.println("Marking entities as synced for type " + entityType + ": " + entities);
        syncRegistry.markAsSynced(entityType, entities);
    }

    /**
     * Convertit les entités en DTOs
     */
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> List<D> convertEntitiesToDTOs(
            List<E> entities) {
        return entities.stream()
                .map(SyncableEntity::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertit les DTOs en SyncableDTO (pour compatibilité)
     */
    public List<FirebaseSerializable> convertEntitiesToSyncableDTOs(List<? extends SyncableEntity<?>> entities) {
        return entities.stream()
                .map(SyncableEntity::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour ou crée une entité depuis les données Firebase (générique)
     */
    @Transactional
    public <E extends SyncableEntity<D>, D extends FirebaseSerializable> E updateOrCreateFromFirebase(
            String entityType, Map<String, Object> firebaseData) {
            System.out.println("Updating or creating entity of type " + entityType + " from Firebase data: " + firebaseData);
            try {
                return syncRegistry.updateOrCreateFromFirebase(entityType, firebaseData);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to update or create entity of type " + entityType, e);
            }
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