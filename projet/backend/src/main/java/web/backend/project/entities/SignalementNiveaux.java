package web.backend.project.entities;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import web.backend.project.entities.dto.SignalementNiveauxDTO;

@Entity
@Table(name = "signalements_niveaux")
public class SignalementNiveaux implements SyncableEntity<SignalementNiveauxDTO> {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "libelles", length = 20)
    private String libelles;

    @Column(name = "prix_m2", nullable = false)
    private Float prixM2 = 0.0f;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    // Constructeurs
    public SignalementNiveaux() {
    }

    public SignalementNiveaux(String libelles, Float prixM2, Boolean synchro) {
        this.libelles = libelles;
        this.prixM2 = prixM2;
        this.synchro = synchro;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
        SignalementNiveaux that = (SignalementNiveaux) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public SignalementNiveauxDTO toDTO() {
        SignalementNiveauxDTO dto = new SignalementNiveauxDTO();
        dto.setId(this.id);
        dto.setLibelles(this.libelles);
        dto.setPrixM2(this.prixM2);
        dto.setSynchro(this.synchro);
        dto.setLastModified(LocalDateTime.now());
        return dto;
    }

    @Override
    public void updateFromDTO(SignalementNiveauxDTO dto) {
        if (dto == null)
            return;

        this.libelles = dto.getLibelles();
        this.prixM2 = dto.getPrixM2();
        this.synchro = dto.getSynchro();
    }
}
