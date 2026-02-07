package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import web.backend.project.entities.Role;

public class UtilisateurResponseDTO {
    
    @JsonProperty("id")
    private Integer id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("role")
    private Role role;

    @JsonProperty("dateCreation")
    private String dateCreation;

    @JsonProperty("estBloque")
    private Boolean estBloque;

    @JsonProperty("dateBlocage")
    private String dateBlocage;

    // Constructeurs
    public UtilisateurResponseDTO() {
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Boolean getEstBloque() {
        return estBloque;
    }

    public void setEstBloque(Boolean estBloque) {
        this.estBloque = estBloque;
    }

    public String getDateBlocage() {
        return dateBlocage;
    }

    public void setDateBlocage(String dateBlocage) {
        this.dateBlocage = dateBlocage;
    }
}
