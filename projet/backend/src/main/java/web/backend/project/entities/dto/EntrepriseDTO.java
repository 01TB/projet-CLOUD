package web.backend.project.entities.dto;

import java.time.LocalDateTime;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

public class EntrepriseDTO implements FirebaseSerializable {

    @JsonProperty("id")
    Integer id;

    @JsonProperty("nom")
    String nom;

    @JsonProperty("synchro")
    Boolean synchro;

    public EntrepriseDTO() {
    }

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id = id;
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
        return LocalDateTime.now();
    }

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.nom = FirebaseSerializable.extractString(data, "nom");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", id);
        map.put("nom", nom);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        return map;
    }


    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

}
