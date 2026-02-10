package web.backend.project.entities.dto;

import java.time.LocalDateTime;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SignalementNiveauxDTO implements FirebaseSerializable {

    @JsonProperty("id")
    Integer id;

    @JsonProperty("libelles")
    String libelles;

    @JsonProperty("prix_m2")
    Float prixM2;

    @JsonProperty("synchro")
    Boolean synchro;

    LocalDateTime lastModified;

    public SignalementNiveauxDTO() {
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
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.libelles = FirebaseSerializable.extractString(data, "libelles");
        this.prixM2 = FirebaseSerializable.extractFloat(data, "prix_m2");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", id);
        map.put("libelles", libelles);
        map.put("prix_m2", prixM2);
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        return map;
    }

    public String getLibelles() {
        return libelles;
    }

    public void setLibelles(String libelles) {
        this.libelles = libelles;
    }

    public Float getPrixM2() {
        return prixM2;
    }

    public void setPrixM2(Float prixM2) {
        this.prixM2 = prixM2;
    }
}
