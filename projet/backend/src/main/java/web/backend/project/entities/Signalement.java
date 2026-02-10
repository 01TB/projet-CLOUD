package web.backend.project.entities;

import jakarta.persistence.*;
import web.backend.project.entities.dto.SignalementDTO;
import web.backend.project.utils.GeometryUtils;

import org.locationtech.jts.geom.Geometry;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "signalements")
public class Signalement implements SyncableEntity<SignalementDTO> {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "date_creation", nullable = false, length = 50)
    private String dateCreation;

    @Column(name = "surface", nullable = false)
    private Double surface;

    @Column(name = "budget", nullable = false)
    private Float budget = 0f;

    @Column(name = "localisation", nullable = false, columnDefinition = "geography")
    private Geometry localisation;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro;

    @Column(name = "niveaux")
    private Integer niveaux;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_createur", nullable = false)
    private Utilisateur utilisateurCreateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entreprise")
    private Entreprise entreprise;

    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvancementSignalement> avancements = new ArrayList<>();

    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SignalementPhoto> photos = new ArrayList<>();

    // Constructeurs
    public Signalement() {
    }

    public Signalement(String dateCreation, Double surface, Float budget,
            Geometry localisation, Boolean synchro,
            Utilisateur utilisateurCreateur, Entreprise entreprise, Integer niveaux) {
        this.dateCreation = dateCreation;
        this.surface = surface;
        this.budget = budget != null ? budget : 0f;
        this.localisation = localisation;
        this.synchro = synchro;
        this.utilisateurCreateur = utilisateurCreateur;
        this.entreprise = entreprise;
        this.niveaux = niveaux;
    }

    @Override
    public SignalementDTO toDTO() {
        SignalementDTO s = new SignalementDTO();
        s.setId(this.id);
        s.setDateCreation(this.dateCreation);
        s.setSurface(this.surface);
        s.setBudget(this.budget);
        s.setLocalisationWkt(GeometryUtils.geometryToWKT(this.localisation));
        s.setSynchro(this.synchro);
        s.setUtilisateurCreateurId(this.utilisateurCreateur != null ? this.utilisateurCreateur.getId() : null);
        s.setEntrepriseId(this.entreprise != null ? this.entreprise.getId() : null);
        s.setNiveaux(this.niveaux);
        s.setLastModified(LocalDateTime.now());
        return s;
    }

    @Override
    public void updateFromDTO(SignalementDTO dto) {
        if (dto == null)
            return;

        this.dateCreation = dto.getDateCreation();
        this.surface = dto.getSurface();
        this.budget = dto.getBudget() != null ? dto.getBudget() : 0f;
        this.synchro = dto.getSynchro();
        this.niveaux = dto.getNiveaux();

        // Conversion WKT → Geometry
        if (dto.getLocalisationWkt() != null) {
            this.localisation = GeometryUtils.wktToGeometry(dto.getLocalisationWkt());
        }

        // Note: Les relations (utilisateurCreateur, entreprise) sont résolues
        // séparément via RelationResolver
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

    public Float getBudget() {
        return budget;
    }

    public void setBudget(Float budget) {
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

    public Integer getNiveaux() {
        return niveaux;
    }

    public void setNiveaux(Integer niveaux) {
        this.niveaux = niveaux;
    }

    public List<AvancementSignalement> getAvancements() {
        return avancements;
    }

    public void setAvancements(List<AvancementSignalement> avancements) {
        this.avancements = avancements;
    }

    public List<SignalementPhoto> getPhotos() {
        return photos;
    }

    public void setPhotos(List<SignalementPhoto> photos) {
        this.photos = photos;
    }

    // Helper method to add a photo
    public void addPhoto(SignalementPhoto photo) {
        photos.add(photo);
        photo.setSignalement(this);
    }

    // Helper method to remove a photo
    public void removePhoto(SignalementPhoto photo) {
        photos.remove(photo);
        photo.setSignalement(null);
    }

    // Helper method to add an avancement
    public void addAvancement(AvancementSignalement avancement) {
        avancements.add(avancement);
        avancement.setSignalement(this);
    }

    // Helper method to remove an avancement
    public void removeAvancement(AvancementSignalement avancement) {
        avancements.remove(avancement);
        avancement.setSignalement(null);
    }

    // Equals et HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Signalement that = (Signalement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}
