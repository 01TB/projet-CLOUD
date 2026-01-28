package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO pour la synchronisation de AvancementSignalement
 */
public class AvancementSignalementDTO implements SyncableDTO {

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
