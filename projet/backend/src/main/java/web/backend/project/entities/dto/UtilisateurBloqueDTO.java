package web.backend.project.entities.dto;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UtilisateurBloqueDTO implements FirebaseSerializable {

    @JsonProperty("id")
    Integer id;

    @JsonProperty("date_blocage")
    LocalDateTime dateBlocage;

    @JsonProperty("synchro")
    Boolean synchro;

    @JsonProperty("id_utilisateur")
    Integer utilisateurId;

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
        return dateBlocage;
    }

    public LocalDateTime getDateBlocage() {
        return dateBlocage;
    }

    public void setDateBlocage(LocalDateTime dateBlocage) {
        this.dateBlocage = dateBlocage;
    }

    public Integer getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Integer utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.dateBlocage = FirebaseSerializable.extractLocalDateTime(data, "date_blocage");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.utilisateurId = FirebaseSerializable.extractInteger(data, "id_utilisateur");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", id);
        map.put("date_blocage", dateBlocage != null ? dateBlocage.toString() : null);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        map.put("id_utilisateur", utilisateurId);
        return map;
    }

}
