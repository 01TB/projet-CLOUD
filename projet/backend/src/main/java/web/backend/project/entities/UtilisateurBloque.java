package web.backend.project.entities;

import jakarta.persistence.*;
import web.backend.project.entities.dto.UtilisateurBloqueDTO;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "utilisateurs_bloques")
public class UtilisateurBloque implements SyncableEntity<UtilisateurBloqueDTO> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "date_blocage", nullable = false)
    private LocalDateTime dateBlocage;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // Constructeurs
    public UtilisateurBloque() {
    }

    public UtilisateurBloque(LocalDateTime dateBlocage, Boolean synchro, Utilisateur utilisateur) {
        this.dateBlocage = dateBlocage;
        this.synchro = synchro;
        this.utilisateur = utilisateur;
    }

    @Override
    public UtilisateurBloqueDTO toDTO() {
        UtilisateurBloqueDTO dto = new UtilisateurBloqueDTO();
        dto.setId(this.id);
        dto.setDateBlocage(this.dateBlocage);
        dto.setSynchro(this.synchro);
        dto.setUtilisateurId(this.utilisateur != null ? this.utilisateur.getId() : null);
        return dto;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getDateBlocage() {
        return dateBlocage;
    }

    public void setDateBlocage(LocalDateTime dateBlocage) {
        this.dateBlocage = dateBlocage;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UtilisateurBloque that = (UtilisateurBloque) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public void updateFromDTO(UtilisateurBloqueDTO dto) {
        if (dto == null) {
            return;
        } else if (dto.getId() != null) {
            this.id = dto.getId();
        }
        this.synchro = dto.getSynchro();
        this.dateBlocage = dto.getDateBlocage();
    }

}
