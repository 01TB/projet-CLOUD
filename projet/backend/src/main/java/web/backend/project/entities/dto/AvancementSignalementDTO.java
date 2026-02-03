package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour la synchronisation de AvancementSignalement
 */
public class AvancementSignalementDTO implements FirebaseSerializable {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("date_modification")
    private LocalDateTime dateModification;

    @JsonProperty("synchro")
    private Boolean synchro;

    @JsonProperty("id_utilisateur")
    private Integer utilisateurId;

    @JsonProperty("id_statut_avancement")
    private Integer statutAvancementId;

    @JsonProperty("id_signalement")
    private Integer signalementId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified = LocalDateTime.now();

    // Constructeurs
    public AvancementSignalementDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.dateModification = FirebaseSerializable.extractLocalDateTime(data, "date_modification");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.utilisateurId = FirebaseSerializable.extractInteger(data, "id_utilisateur");
        this.statutAvancementId = FirebaseSerializable.extractInteger(data, "id_statut_avancement");
        this.signalementId = FirebaseSerializable.extractInteger(data, "id_signalement");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("date_modification", dateModification != null ? dateModification.toString() : null);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        map.put("id_utilisateur", utilisateurId);
        map.put("id_statut_avancement", statutAvancementId);
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

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    @Override
    public Boolean getSynchro() {
        return synchro;
    }

    @Override
    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Integer getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Integer utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public Integer getStatutAvancementId() {
        return statutAvancementId;
    }

    public void setStatutAvancementId(Integer statutAvancementId) {
        this.statutAvancementId = statutAvancementId;
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
}
