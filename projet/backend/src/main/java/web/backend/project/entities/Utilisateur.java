package web.backend.project.entities;

import jakarta.persistence.*;
import web.backend.project.entities.dto.UtilisateurDTO;

import java.util.Objects;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur implements Syncable<UtilisateurDTO> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;

    // Constructeurs
    public Utilisateur() {
    }

    public Utilisateur(String email, String password, Boolean synchro, Role role) {
        this.email = email;
        this.password = password;
        this.synchro = synchro;
        this.role = role;
    }

    @Override
    public UtilisateurDTO toDTO() {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(this.id);
        dto.setEmail(this.email);
        dto.setPassword(this.password);
        dto.setSynchro(this.synchro);
        dto.setRoleId(this.role != null ? this.role.getId() : null);
        return dto;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Utilisateur that = (Utilisateur) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}