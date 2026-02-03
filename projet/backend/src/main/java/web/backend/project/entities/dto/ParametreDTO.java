package web.backend.project.entities.dto;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ParametreDTO implements FirebaseSerializable {
    @JsonProperty("id")
    Integer id;

    @JsonProperty("nb_tentatives_connexion")
    Integer nbTentativesConnexion;

    @JsonProperty("duree_session")
    Integer dureeSession;

    @JsonProperty("synchro")
    Boolean synchro;

    public ParametreDTO() {
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
        this.nbTentativesConnexion = FirebaseSerializable.extractInteger(data, "nb_tentatives_connexion");
        this.dureeSession = FirebaseSerializable.extractInteger(data, "duree_session");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", id);
        map.put("nb_tentatives_connexion", nbTentativesConnexion);
        map.put("duree_session", dureeSession);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        return map;
    }

    public Integer getNbTentativesConnexion() {
        return nbTentativesConnexion;
    }

    public void setNbTentativesConnexion(Integer nbTentativesConnexion) {
        this.nbTentativesConnexion = nbTentativesConnexion;
    }

    public Integer getDureeSession() {
        return dureeSession;
    }

    public void setDureeSession(Integer dureeSession) {
        this.dureeSession = dureeSession;
    }

}
