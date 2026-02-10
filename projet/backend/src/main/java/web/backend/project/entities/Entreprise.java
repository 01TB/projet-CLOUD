package web.backend.project.entities;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.GenericGenerator;
import web.backend.project.entities.dto.EntrepriseDTO;

@Entity
@Table(name = "entreprises", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "nom" })
})
public class Entreprise implements SyncableEntity<EntrepriseDTO> {
    @Id
    @GeneratedValue(generator = "use-existing-or-generate")
    @GenericGenerator(name = "use-existing-or-generate", type = UseExistingOrGenerateId.class)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nom", nullable = false, length = 255)
    private String nom;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    // Constructeurs
    public Entreprise() {
    }

    public Entreprise(String nom, Boolean synchro) {
        this.nom = nom;
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
        Entreprise that = (Entreprise) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public EntrepriseDTO toDTO() {
        EntrepriseDTO dto = new EntrepriseDTO();
        dto.setId(this.id);
        dto.setNom(this.nom);
        dto.setSynchro(this.synchro);
        return dto;
    }

    @Override
    public void updateFromDTO(EntrepriseDTO dto) {
        this.nom = dto.getNom();
        this.synchro = dto.getSynchro();
    }

}