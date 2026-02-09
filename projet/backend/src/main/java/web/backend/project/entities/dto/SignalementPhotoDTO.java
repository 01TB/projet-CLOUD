package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour la synchronisation de SignalementPhoto
 */
public class SignalementPhotoDTO implements FirebaseSerializable {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("firebase_url")
    private String firebaseUrl;

    @JsonProperty("synchro")
    private Boolean synchro;

    @JsonProperty("date_creation")
    private LocalDateTime dateCreation;

    @JsonProperty("id_signalement")
    private Integer signalementId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified = LocalDateTime.now();

    // Constructeurs
    public SignalementPhotoDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.firebaseUrl = FirebaseSerializable.extractString(data, "firebase_url");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.dateCreation = FirebaseSerializable.extractLocalDateTime(data, "date_creation");
        this.signalementId = FirebaseSerializable.extractInteger(data, "id_signalement");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("firebase_url", firebaseUrl);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        map.put("date_creation", dateCreation != null ? dateCreation.toString() : null);
        map.put("id_signalement", signalementId);
        map.put("last_modified", lastModified != null ? lastModified.toString() : null);
        return map;
    }

    // Getters et Setters
    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirebaseUrl() {
        return firebaseUrl;
    }

    public void setFirebaseUrl(String firebaseUrl) {
        this.firebaseUrl = firebaseUrl;
    }

    @Override
    public Boolean getSynchro() {
        return synchro;
    }

    @Override
    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Integer getSignalementId() {
        return signalementId;
    }

    public void setSignalementId(Integer signalementId) {
        this.signalementId = signalementId;
    }

    @Override
    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    @Override
    public String toString() {
        return "SignalementPhotoDTO{" +
                "id=" + id +
                ", firebaseUrl='" + firebaseUrl + '\'' +
                ", synchro=" + synchro +
                ", dateCreation=" + dateCreation +
                ", signalementId=" + signalementId +
                ", lastModified=" + lastModified +
                '}';
    }
}
