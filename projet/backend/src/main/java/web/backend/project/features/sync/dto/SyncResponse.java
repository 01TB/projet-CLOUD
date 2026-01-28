package web.backend.project.features.sync.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO pour les réponses de synchronisation
 */
public class SyncResponse {
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("syncTimestamp")
    private LocalDateTime syncTimestamp;
    
    @JsonProperty("results")
    private Map<String, EntitySyncResult> results; // Résultats par type d'entité
    
    @JsonProperty("errors")
    private List<String> errors;

    // Constructeurs
    public SyncResponse() {
        this.syncTimestamp = LocalDateTime.now();
        this.results = new HashMap<>();
        this.errors = new ArrayList<>();
    }

    public SyncResponse(Boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }

    // Classe interne pour les résultats par entité
    public static class EntitySyncResult {
        @JsonProperty("pushed")
        private Integer pushed = 0;
        
        @JsonProperty("pulled")
        private Integer pulled = 0;
        
        @JsonProperty("failed")
        private Integer failed = 0;
        
        @JsonProperty("conflicts")
        private Integer conflicts = 0;

        public EntitySyncResult() {}

        // Getters et Setters
        public Integer getPushed() {
            return pushed;
        }

        public void setPushed(Integer pushed) {
            this.pushed = pushed;
        }

        public Integer getPulled() {
            return pulled;
        }

        public void setPulled(Integer pulled) {
            this.pulled = pulled;
        }

        public Integer getFailed() {
            return failed;
        }

        public void setFailed(Integer failed) {
            this.failed = failed;
        }

        public Integer getConflicts() {
            return conflicts;
        }

        public void setConflicts(Integer conflicts) {
            this.conflicts = conflicts;
        }

        public void incrementPushed() {
            this.pushed++;
        }

        public void incrementPulled() {
            this.pulled++;
        }

        public void incrementFailed() {
            this.failed++;
        }

        public void incrementConflicts() {
            this.conflicts++;
        }
    }

    // Getters et Setters
    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSyncTimestamp() {
        return syncTimestamp;
    }

    public void setSyncTimestamp(LocalDateTime syncTimestamp) {
        this.syncTimestamp = syncTimestamp;
    }

    public Map<String, EntitySyncResult> getResults() {
        return results;
    }

    public void setResults(Map<String, EntitySyncResult> results) {
        this.results = results;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public void addError(String error) {
        this.errors.add(error);
    }
}
