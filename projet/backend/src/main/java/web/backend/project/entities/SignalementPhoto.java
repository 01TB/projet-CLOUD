package web.backend.project.entities;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.*;
import web.backend.project.entities.dto.SignalementPhotoDTO;

@Entity
@Table(name = "signalements_photos")
public class SignalementPhoto implements SyncableEntity<SignalementPhotoDTO> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "firebase_url", nullable = false, unique = true, length = 255)
    private String firebaseUrl;

    @Column(name = "synchro", nullable = false)
    private Boolean synchro = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_signalement", nullable = false)
    private Signalement signalement;

    // Constructeurs
    public SignalementPhoto() {
    }

    public SignalementPhoto(String firebaseUrl, Boolean synchro, LocalDateTime dateCreation, Signalement signalement) {
        this.firebaseUrl = firebaseUrl;
        this.synchro = synchro;
        this.dateCreation = dateCreation != null ? dateCreation : LocalDateTime.now();
        this.signalement = signalement;
    }

    @Override
    public SignalementPhotoDTO toDTO() {
        SignalementPhotoDTO dto = new SignalementPhotoDTO();
        dto.setId(this.id);
        dto.setFirebaseUrl(this.firebaseUrl);
        dto.setSynchro(this.synchro);
        dto.setDateCreation(this.dateCreation != null ? this.dateCreation : LocalDateTime.now());
        dto.setSignalementId(this.signalement != null ? this.signalement.getId() : null);
        dto.setLastModified(this.dateCreation != null ? this.dateCreation : LocalDateTime.now());
        return dto;
    }

    @Override
    public void updateFromDTO(SignalementPhotoDTO dto) {
        if (dto == null)
            return;

        this.firebaseUrl = dto.getFirebaseUrl();
        this.synchro = dto.getSynchro();
        this.dateCreation = dto.getDateCreation();

        // Note: La relation signalement est résolue séparément via RelationResolver
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirebaseUrl() {
        return firebaseUrl;
    }

    public void setFirebaseUrl(String firebaseUrl) {
        this.firebaseUrl = firebaseUrl;
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

    // equals et hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        SignalementPhoto that = (SignalementPhoto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(firebaseUrl, that.firebaseUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, firebaseUrl);
    }

    @Override
    public String toString() {
        return "SignalementPhoto{" +
                "id=" + id +
                ", firebaseUrl='" + firebaseUrl + '\'' +
                ", synchro=" + synchro +
                ", dateCreation=" + dateCreation +
                ", signalementId=" + (signalement != null ? signalement.getId() : null) +
                '}';
    }
}
