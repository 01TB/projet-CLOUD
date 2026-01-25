package web.backend.project.entities;


import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "statut_avancement", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nom"}),
    @UniqueConstraint(columnNames = {"valeur"})
})
public class StatutAvancement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nom", nullable = false, length = 50)
    private String nom;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro;

    // Constructeurs
    public StatutAvancement() {}

    public StatutAvancement(String nom, Integer valeur, Boolean synchro) {
        this.nom = nom;
        this.valeur = valeur;
        this.synchro = synchro;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Integer getValeur() {
        return valeur;
    }

    public void setValeur(Integer valeur) {
        this.valeur = valeur;
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
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StatutAvancement that = (StatutAvancement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
