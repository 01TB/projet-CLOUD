package web.backend.project.features.sync.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.Syncable;
import web.backend.project.entities.dto.AvancementSignalementDTO;
import web.backend.project.entities.dto.SignalementDTO;
import web.backend.project.entities.dto.StatutAvancementDTO;
import web.backend.project.entities.dto.SyncableDTO;
import web.backend.project.mappers.SyncMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Handler pour gérer la synchronisation d'une entité spécifique
 */
@Service
public class EntitySyncHandler {

    private final SyncMapper mapper;

    public EntitySyncHandler(SyncMapper mapper) {
        this.mapper = mapper;
    }

    /**
     * Récupère les entités non synchronisées pour le push
     * Amélioration: Utilise un type générique avec contrainte Syncable
     */
    public <E extends Syncable<D>, D extends SyncableDTO> List<E> getUnsyncedEntities(
            JpaRepository<E, Integer> repository) {
        List<E> allEntities = repository.findAll();

        // Filtre les entités avec synchro = false
        return allEntities.stream()
                .filter(entity -> {
                    try {
                        java.lang.reflect.Method getSynchro = entity.getClass().getMethod("getSynchro");
                        Boolean synchro = (Boolean) getSynchro.invoke(entity);
                        return synchro != null && !synchro;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Marque les entités comme synchronisées
     * Amélioration: Utilise un type générique avec contrainte Syncable
     */
    @Transactional
    public <E extends Syncable<?>> void markAsSynced(
            List<E> entities,
            JpaRepository<E, Integer> repository) {
        for (E entity : entities) {
            try {
                java.lang.reflect.Method setSynchro = entity.getClass().getMethod("setSynchro", Boolean.class);
                setSynchro.invoke(entity, true);
            } catch (Exception e) {
                throw new RuntimeException("Failed to mark entity as synced", e);
            }
        }
        repository.saveAll(entities);
    }

    /**
     * Convertit une liste d'entités en DTOs
     * Amélioration majeure: Utilise directement l'interface Syncable pour la
     * conversion
     * Plus besoin de switch/case ou de mapper manuel
     */
    public <E extends Syncable<D>, D extends SyncableDTO> List<D> convertEntitiesToDTOs(
            List<E> entities) {
        return entities.stream()
                .map(Syncable::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Variante qui retourne une liste de SyncableDTO (pour compatibilité)
     */
    public List<SyncableDTO> convertEntitiesToSyncableDTOs(List<? extends Syncable<?>> entities) {
        return entities.stream()
                .map(Syncable::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour ou crée une entité depuis Firebase
     */
    @Transactional
    public <T> T updateOrCreateEntity(
            Map<String, Object> firebaseData,
            JpaRepository<T, Integer> repository,
            String entityType) {
        Integer id = extractId(firebaseData);
        Optional<T> existingEntity = id != null ? repository.findById(id) : Optional.empty();

        if (existingEntity.isPresent()) {
            // Update l'entité existante
            T entity = existingEntity.get();
            updateEntityFromFirebaseData(entity, firebaseData, entityType);
            return repository.save(entity);
        } else {
            // Crée une nouvelle entité
            T newEntity = createEntityFromFirebaseData(firebaseData, entityType);
            return repository.save(newEntity);
        }
    }

    /**
     * Extrait l'ID depuis les données Firebase
     */
    private Integer extractId(Map<String, Object> data) {
        Object idObj = data.get("id");
        if (idObj == null)
            return null;

        if (idObj instanceof Integer) {
            return (Integer) idObj;
        } else if (idObj instanceof String) {
            try {
                return Integer.parseInt((String) idObj);
            } catch (NumberFormatException e) {
                return null;
            }
        } else if (idObj instanceof Long) {
            return ((Long) idObj).intValue();
        } else if (idObj instanceof Double) {
            return ((Double) idObj).intValue();
        }
        return null;
    }

    /**
     * Met à jour une entité depuis les données Firebase
     */
    private <T> void updateEntityFromFirebaseData(T entity, Map<String, Object> data, String entityType) {
        switch (entityType) {
            case "Signalement":
                SignalementDTO signalementDTO = mapToSignalementDTO(data);
                mapper.updateEntityFromDTO(signalementDTO, (Signalement) entity);
                break;
            case "StatutAvancement":
                StatutAvancementDTO statutDTO = mapToStatutAvancementDTO(data);
                mapper.updateEntityFromDTO(statutDTO, (StatutAvancement) entity);
                break;
            case "AvancementSignalement":
                AvancementSignalementDTO avancementDTO = mapToAvancementSignalementDTO(data);
                mapper.updateEntityFromDTO(avancementDTO, (AvancementSignalement) entity);
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    /**
     * Crée une nouvelle entité depuis les données Firebase
     */
    @SuppressWarnings("unchecked")
    private <T> T createEntityFromFirebaseData(Map<String, Object> data, String entityType) {
        switch (entityType) {
            case "Signalement":
                Signalement signalement = new Signalement();
                SignalementDTO signalementDTO = mapToSignalementDTO(data);
                mapper.updateEntityFromDTO(signalementDTO, signalement);
                return (T) signalement;
            case "StatutAvancement":
                StatutAvancement statut = new StatutAvancement();
                StatutAvancementDTO statutDTO = mapToStatutAvancementDTO(data);
                mapper.updateEntityFromDTO(statutDTO, statut);
                return (T) statut;
            case "AvancementSignalement":
                AvancementSignalement avancement = new AvancementSignalement();
                AvancementSignalementDTO avancementDTO = mapToAvancementSignalementDTO(data);
                mapper.updateEntityFromDTO(avancementDTO, avancement);
                return (T) avancement;
            default:
                throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    // ========== Méthodes de mapping Map → DTO ==========

    private SignalementDTO mapToSignalementDTO(Map<String, Object> data) {
        SignalementDTO dto = new SignalementDTO();
        dto.setId(extractId(data));
        dto.setDateCreation((String) data.get("dateCreation"));
        dto.setSurface(getDouble(data, "surface"));
        dto.setBudget(getInteger(data, "budget"));
        dto.setLocalisationWkt((String) data.get("localisationWkt"));
        dto.setSynchro(getBoolean(data, "synchro"));
        dto.setUtilisateurCreateurId(getInteger(data, "utilisateurCreateurId"));
        dto.setEntrepriseId(getInteger(data, "entrepriseId"));
        return dto;
    }

    private StatutAvancementDTO mapToStatutAvancementDTO(Map<String, Object> data) {
        StatutAvancementDTO dto = new StatutAvancementDTO();
        dto.setId(extractId(data));
        dto.setNom((String) data.get("nom"));
        dto.setValeur(getInteger(data, "valeur"));
        dto.setSynchro(getBoolean(data, "synchro"));
        return dto;
    }

    private AvancementSignalementDTO mapToAvancementSignalementDTO(Map<String, Object> data) {
        AvancementSignalementDTO dto = new AvancementSignalementDTO();
        dto.setId(extractId(data));
        dto.setSynchro(getBoolean(data, "synchro"));
        dto.setUtilisateurId(getInteger(data, "utilisateurId"));
        dto.setStatutAvancementId(getInteger(data, "statutAvancementId"));
        dto.setSignalementId(getInteger(data, "signalementId"));
        return dto;
    }

    // Helpers
    private Double getDouble(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return null;
    }

    private Integer getInteger(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }

    private Boolean getBoolean(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return false;
    }
}