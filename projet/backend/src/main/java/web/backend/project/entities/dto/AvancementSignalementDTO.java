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

    @JsonProperty("utilisateur_id")
    private Integer utilisateurId;

    @JsonProperty("statut_avancement_id")
    private Integer statutAvancementId;

    @JsonProperty("signalement_id")
    private Integer signalementId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified;

    // Constructeurs
    public AvancementSignalementDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.dateModification = FirebaseSerializable.extractLocalDateTime(data, "dateModification");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.utilisateurId = FirebaseSerializable.extractInteger(data, "utilisateurId");
        this.statutAvancementId = FirebaseSerializable.extractInteger(data, "statutAvancementId");
        this.signalementId = FirebaseSerializable.extractInteger(data, "signalementId");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "lastModified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("dateModification", dateModification != null ? dateModification.toString() : null);
        map.put("synchro", synchro);
        map.put("utilisateurId", utilisateurId);
        map.put("statutAvancementId", statutAvancementId);
        map.put("signalementId", signalementId);
        map.put("lastModified", lastModified != null ? lastModified.toString() : null);
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
