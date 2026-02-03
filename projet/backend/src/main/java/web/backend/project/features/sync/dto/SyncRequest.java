package web.backend.project.features.sync.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * DTO pour les requêtes de synchronisation
 */
public class SyncRequest {
    
    @JsonProperty("entityTypes")
    private List<String> entityTypes; // Types d'entités à synchroniser (ex: ["Signalement", "StatutAvancement"])
    
    @JsonProperty("direction")
    private SyncDirection direction; // PUSH, PULL, ou BIDIRECTIONAL
    
    @JsonProperty("forceSync")
    private Boolean forceSync = false; // Forcer la synchro même si synchro=true
    
    public enum SyncDirection {
        PUSH,    // Backend → Firebase
        PULL,    // Firebase → Backend
        BIDIRECTIONAL // Les deux directions
    }

    // Constructeurs
    public SyncRequest() {}

    public SyncRequest(List<String> entityTypes, SyncDirection direction) {
        this.entityTypes = entityTypes;
        this.direction = direction;
    }

    // Getters et Setters
    public List<String> getEntityTypes() {
        return entityTypes;
    }

    public void setEntityTypes(List<String> entityTypes) {
        this.entityTypes = entityTypes;
    }

    public SyncDirection getDirection() {
        return direction;
    }

    public void setDirection(SyncDirection direction) {
        this.direction = direction;
    }

    public Boolean getForceSync() {
        return forceSync;
    }

    public void setForceSync(Boolean forceSync) {
        this.forceSync = forceSync;
    }
}
