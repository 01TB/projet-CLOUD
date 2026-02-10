package web.backend.project.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;

/**
 * Entité représentant l'historique des prix de signalements (mouvements de
 * prix).
 * Le dernier enregistrement (par date_creation DESC) représente le prix actuel.
 */
@Entity
@Table(name = "mvt_prix_signalements")
public class MvtPrixSignalement {

    @Id
    @GeneratedValue(generator = "use-existing-or-generate")
    @GenericGenerator(name = "use-existing-or-generate", type = UseExistingOrGenerateId.class)
    @Column(name = "id")
    private Integer id;

    @Column(name = "date_creation", nullable = false)
    private LocalDate dateCreation;

    @Column(name = "montant", nullable = false)
    private Double montant;

    // Constructeurs
    public MvtPrixSignalement() {
    }

    public MvtPrixSignalement(LocalDate dateCreation, Double montant) {
        this.dateCreation = dateCreation;
        this.montant = montant;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }
}
