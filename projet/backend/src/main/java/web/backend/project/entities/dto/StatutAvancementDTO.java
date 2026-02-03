package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour la synchronisation de StatutAvancement
 */
public class StatutAvancementDTO implements FirebaseSerializable {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("nom")
    private String nom;

    @JsonProperty("valeur")
    private Integer valeur;

    @JsonProperty("synchro")
    private Boolean synchro = true;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified;

    // Constructeurs
    public StatutAvancementDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.nom = FirebaseSerializable.extractString(data, "nom");
        this.valeur = FirebaseSerializable.extractInteger(data, "valeur");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("nom", nom);
        map.put("valeur", valeur);
        map.put("synchro", synchro);
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

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Integer getValeur() {
        return valeur;
    }

    public void setValeur(Integer valeur) {
        this.valeur = valeur;
    }

    @Override
    public Boolean getSynchro() {
        return synchro;
    }

    @Override
    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    @Override
    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }
}
