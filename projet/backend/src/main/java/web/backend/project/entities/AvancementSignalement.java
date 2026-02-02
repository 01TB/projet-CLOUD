package web.backend.project.entities;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import web.backend.project.entities.dto.AvancementSignalementDTO;

@Entity
@Table(name = "avancements_signalement")
public class AvancementSignalement implements SyncableEntity<AvancementSignalementDTO> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_statut_avancement", nullable = false)
    private StatutAvancement statutAvancement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_signalement", nullable = false)
    private Signalement signalement;

    // Constructeurs
    public AvancementSignalement() {
    }

    public AvancementSignalement(LocalDateTime dateModification, Boolean synchro,
            Utilisateur utilisateur, StatutAvancement statutAvancement,
            Signalement signalement) {
        this.dateModification = dateModification;
        this.synchro = synchro;
        this.utilisateur = utilisateur;
        this.statutAvancement = statutAvancement;
        this.signalement = signalement;
    }

    @Override
    public AvancementSignalementDTO toDTO() {
        AvancementSignalementDTO dto = new AvancementSignalementDTO();
        dto.setId(this.id);
        dto.setDateModification(this.dateModification);
        dto.setSynchro(this.synchro);
        dto.setUtilisateurId(this.utilisateur != null ? this.utilisateur.getId() : null);
        dto.setStatutAvancementId(this.statutAvancement != null ? this.statutAvancement.getId() : null);
        dto.setSignalementId(this.signalement != null ? this.signalement.getId() : null);
        dto.setLastModified(this.dateModification);
        return dto;
    }

    @Override
    public void updateFromDTO(AvancementSignalementDTO dto) {
        if (dto == null)
            return;

        this.dateModification = dto.getDateModification();
        this.synchro = dto.getSynchro();

        // Note: Les relations (utilisateur, statutAvancement, signalement) sont
        // résolues séparément via RelationResolver
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
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

    public StatutAvancement getStatutAvancement() {
        return statutAvancement;
    }

    public void setStatutAvancement(StatutAvancement statutAvancement) {
        this.statutAvancement = statutAvancement;
    }

    public Signalement getSignalement() {
        return signalement;
    }

    public void setSignalement(Signalement signalement) {
        this.signalement = signalement;
    }

    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        AvancementSignalement that = (AvancementSignalement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
