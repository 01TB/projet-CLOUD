package web.backend.project.entities;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Geometry;
import java.util.Objects;

@Entity
@Table(name = "signalement")
public class Signalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "date_creation", nullable = false, length = 50)
    private String dateCreation;

    @Column(name = "surface", nullable = false)
    private Double surface;

    @Column(name = "budget", nullable = false)
    private Integer budget;

    @Column(name = "localisation", nullable = false, columnDefinition = "geography")
    private Geometry localisation;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_createur", nullable = false)
    private Utilisateur utilisateurCreateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entreprise", nullable = false)
    private Entreprise entreprise;

    // Constructeurs
    public Signalement() {}

    public Signalement(String dateCreation, Double surface, Integer budget, 
                      Geometry localisation, Boolean synchro, 
                      Utilisateur utilisateurCreateur, Entreprise entreprise) {
        this.dateCreation = dateCreation;
        this.surface = surface;
        this.budget = budget;
        this.localisation = localisation;
        this.synchro = synchro;
        this.utilisateurCreateur = utilisateurCreateur;
        this.entreprise = entreprise;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Double getSurface() {
        return surface;
    }

    public void setSurface(Double surface) {
        this.surface = surface;
    }

    public Integer getBudget() {
        return budget;
    }

    public void setBudget(Integer budget) {
        this.budget = budget;
    }

    public Geometry getLocalisation() {
        return localisation;
    }

    public void setLocalisation(Geometry localisation) {
        this.localisation = localisation;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Utilisateur getUtilisateurCreateur() {
        return utilisateurCreateur;
    }

    public void setUtilisateurCreateur(Utilisateur utilisateurCreateur) {
        this.utilisateurCreateur = utilisateurCreateur;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }
    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Signalement that = (Signalement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
