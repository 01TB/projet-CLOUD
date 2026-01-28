package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO pour la synchronisation de Signalement
 */
public class SignalementDTO implements SyncableDTO {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("date_creation")
    private String dateCreation;

    @JsonProperty("surface")
    private Double surface;

    @JsonProperty("budget")
    private Integer budget;

    @JsonProperty("localisation")
    private String localisationWkt; // Format WKT pour la géométrie

    @JsonProperty("synchro")
    private Boolean synchro;

    @JsonProperty("utilisateur_createur_id")
    private Integer utilisateurCreateurId;

    @JsonProperty("entreprise_id")
    private Integer entrepriseId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified;

    // Constructeurs
    public SignalementDTO() {
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

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Double getSurface() {
        return surface;
    }

    public void setSurface(Double surface) {
        this.surface = surface;
    }

    public Integer getBudget() {
        return budget;
    }

    public void setBudget(Integer budget) {
        this.budget = budget;
    }

    public String getLocalisationWkt() {
        return localisationWkt;
    }

    public void setLocalisationWkt(String localisationWkt) {
        this.localisationWkt = localisationWkt;
    }

    @Override
    public Boolean getSynchro() {
        return synchro;
    }

    @Override
    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Integer getUtilisateurCreateurId() {
        return utilisateurCreateurId;
    }

    public void setUtilisateurCreateurId(Integer utilisateurCreateurId) {
        this.utilisateurCreateurId = utilisateurCreateurId;
    }

    public Integer getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Integer entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    @Override
    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }
}
