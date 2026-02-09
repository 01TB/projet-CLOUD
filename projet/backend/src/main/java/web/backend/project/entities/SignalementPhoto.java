package web.backend.project.entities;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.*;
import web.backend.project.entities.dto.SignalementPhotoDTO;

@Entity
@Table(name = "signalements_photos")
public class SignalementPhoto implements SyncableEntity<SignalementPhotoDTO> {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "path_photo", nullable = false, unique = true, length = 255)
    private String pathPhoto;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_signalement", nullable = false)
    private Signalement signalement;

    /**
     * Champ transitoire (non persisté en base) pour conserver le base64 de la photo
     * durant le cycle pull → push-back vers Firebase.
     */
    @Transient
    private String photoBase64;

    // Constructeurs
    public SignalementPhoto() {
    }

    public SignalementPhoto(String pathPhoto, Boolean synchro, LocalDateTime dateCreation, Signalement signalement) {
        this.pathPhoto = pathPhoto;
        this.synchro = synchro;
        this.dateCreation = dateCreation != null ? dateCreation : LocalDateTime.now();
        this.signalement = signalement;
    }

    @Override
    public SignalementPhotoDTO toDTO() {
        SignalementPhotoDTO dto = new SignalementPhotoDTO();
        dto.setId(this.id);
        dto.setPathPhoto(this.pathPhoto);
        dto.setSynchro(this.synchro);
        dto.setDateCreation(this.dateCreation != null ? this.dateCreation : LocalDateTime.now());
        dto.setSignalementId(this.signalement != null ? this.signalement.getId() : null);
        dto.setLastModified(this.dateCreation != null ? this.dateCreation : LocalDateTime.now());
        // Propager le base64 pour le push-back vers Firebase
        dto.setPhotoBase64(this.photoBase64);
        return dto;
    }

    @Override
    public void updateFromDTO(SignalementPhotoDTO dto) {
        if (dto == null)
            return;

        // Ne pas écraser pathPhoto avec null quand la donnée vient de Firebase (base64)
        // Le path sera défini après décodage par Base64ImageStorageService
        if (dto.getPathPhoto() != null) {
            this.pathPhoto = dto.getPathPhoto();
        }
        this.synchro = dto.getSynchro();
        this.dateCreation = dto.getDateCreation();

        // Note: La relation signalement est résolue séparément via RelationResolver
        // Note: Le décodage base64 → fichier est géré dans le RelationResolver
        // (SyncRepositoryConfig)
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPathPhoto() {
        return pathPhoto;
    }

    public void setPathPhoto(String pathPhoto) {
        this.pathPhoto = pathPhoto;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Signalement getSignalement() {
        return signalement;
    }

    public void setSignalement(Signalement signalement) {
        this.signalement = signalement;
    }

    public String getPhotoBase64() {
        return photoBase64;
    }

    public void setPhotoBase64(String photoBase64) {
        this.photoBase64 = photoBase64;
    }

    // equals et hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        SignalementPhoto that = (SignalementPhoto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(pathPhoto, that.pathPhoto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, pathPhoto);
    }

    @Override
    public String toString() {
        return "SignalementPhoto{" +
                "id=" + id +
                ", pathPhoto='" + pathPhoto + '\'' +
                ", synchro=" + synchro +
                ", dateCreation=" + dateCreation +
                ", signalementId=" + (signalement != null ? signalement.getId() : null) +
                '}';
    }
}
