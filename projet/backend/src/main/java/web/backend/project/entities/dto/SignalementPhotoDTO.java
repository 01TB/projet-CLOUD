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

    @JsonProperty("path_photo")
    private String pathPhoto;

    @JsonProperty("synchro")
    private Boolean synchro;

    @JsonProperty("date_ajout")
    private LocalDateTime dateCreation;

    @JsonProperty("id_signalement")
    private Integer signalementId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified = LocalDateTime.now();

    /**
     * Champ transitoire pour stocker le contenu base64 de la photo reçu depuis
     * Firebase.
     * N'est PAS persisté en base — il est décodé en fichier image par
     * Base64ImageStorageService.
     */
    @JsonProperty("photo")
    private String photoBase64;

    // Constructeurs
    public SignalementPhotoDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.dateCreation = FirebaseSerializable.extractLocalDateTime(data, "date_ajout");
        this.signalementId = FirebaseSerializable.extractInteger(data, "id_signalement");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");

        // La photo arrive en base64 depuis Firebase dans le champ "photo"
        this.photoBase64 = FirebaseSerializable.extractString(data, "photo");
        // pathPhoto sera défini après décodage du base64 par Base64ImageStorageService
        this.pathPhoto = null;
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("firebase_url", pathPhoto);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        map.put("date_ajout", dateCreation != null ? dateCreation.toString() : null);
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

    public String getPathPhoto() {
        return pathPhoto;
    }

    public void setPathPhoto(String pathPhoto) {
        this.pathPhoto = pathPhoto;
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

    public String getPhotoBase64() {
        return photoBase64;
    }

    public void setPhotoBase64(String photoBase64) {
        this.photoBase64 = photoBase64;
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
                ", pathPhoto='" + pathPhoto + '\'' +
                ", photoBase64=" + (photoBase64 != null ? "[" + photoBase64.length() + " chars]" : "null") +
                ", synchro=" + synchro +
                ", dateCreation=" + dateCreation +
                ", signalementId=" + signalementId +
                ", lastModified=" + lastModified +
                '}';
    }
}
