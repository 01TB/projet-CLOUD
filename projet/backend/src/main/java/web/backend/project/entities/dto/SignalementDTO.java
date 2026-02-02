package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour la synchronisation de Signalement
 */
public class SignalementDTO implements FirebaseSerializable {

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

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.dateCreation = FirebaseSerializable.extractString(data, "date_creation");
        this.surface = FirebaseSerializable.extractDouble(data, "surface");
        this.budget = FirebaseSerializable.extractInteger(data, "budget");
        this.localisationWkt = FirebaseSerializable.extractString(data, "localisation");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.utilisateurCreateurId = FirebaseSerializable.extractInteger(data, "utilisateur_createur_id");
        this.entrepriseId = FirebaseSerializable.extractInteger(data, "entreprise_id");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("date_creation", dateCreation);
        map.put("surface", surface);
        map.put("budget", budget);
        map.put("localisation", localisationWkt);
        map.put("synchro", synchro);
        map.put("utilisateur_createur_id", utilisateurCreateurId);
        map.put("entreprise_id", entrepriseId);
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
