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

@Entity
@Table(name = "avancement_signalement")
public class AvancementSignalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro;

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
    public AvancementSignalement() {}

    public AvancementSignalement(LocalDateTime dateModification, Boolean synchro, 
                                Utilisateur utilisateur, StatutAvancement statutAvancement, 
                                Signalement signalement) {
        this.dateModification = dateModification;
        this.synchro = synchro;
        this.utilisateur = utilisateur;
        this.statutAvancement = statutAvancement;
        this.signalement = signalement;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AvancementSignalement that = (AvancementSignalement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
