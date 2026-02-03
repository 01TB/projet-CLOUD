package web.backend.project.entities;

import jakarta.persistence.*;
import web.backend.project.entities.dto.ParametreDTO;

import java.util.Objects;

@Entity
@Table(name = "parametres")
public class Parametre implements SyncableEntity<ParametreDTO> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nb_tentatives_connexion", nullable = false)
    private Integer nbTentativesConnexion;

    @Column(name = "duree_session", nullable = false)
    private Integer dureeSession;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    // Constructeurs
    public Parametre() {
    }

    public Parametre(Integer nbTentativesConnexion, Integer dureeSession, Boolean synchro) {
        this.nbTentativesConnexion = nbTentativesConnexion;
        this.dureeSession = dureeSession;
        this.synchro = synchro;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Parametre parametre = (Parametre) o;
        return Objects.equals(id, parametre.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public ParametreDTO toDTO() {
        ParametreDTO dto = new ParametreDTO();
        dto.setId(this.id);
        dto.setNbTentativesConnexion(this.nbTentativesConnexion);
        dto.setDureeSession(this.dureeSession);
        dto.setSynchro(this.synchro);
        return dto;
    }

    @Override
    public void updateFromDTO(ParametreDTO dto) {
        this.nbTentativesConnexion = dto.getNbTentativesConnexion();
        this.dureeSession = dto.getDureeSession();
        this.synchro = dto.getSynchro();
    }
}