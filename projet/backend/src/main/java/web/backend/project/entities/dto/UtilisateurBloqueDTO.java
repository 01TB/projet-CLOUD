package web.backend.project.entities.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UtilisateurBloqueDTO implements SyncableDTO {

    @JsonProperty("id")
    Integer id;

    @JsonProperty("date_blocage")
    LocalDateTime dateBlocage;

    @JsonProperty("synchro")
    Boolean synchro;

    @JsonProperty("utilisateur_id")
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

}
