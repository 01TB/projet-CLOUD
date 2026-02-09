package web.backend.project.features.signalements.dto;

public class SignalementPhotoResponseDTO {

    private Integer id;
    private String firebaseUrl;
    private Boolean synchro;
    private String dateCreation;
    private Integer idSignalement;

    // Constructeurs
    public SignalementPhotoResponseDTO() {
    }

    public SignalementPhotoResponseDTO(Integer id, String firebaseUrl, Boolean synchro,
            String dateCreation, Integer idSignalement) {
        this.id = id;
        this.firebaseUrl = firebaseUrl;
        this.synchro = synchro;
        this.dateCreation = dateCreation;
        this.idSignalement = idSignalement;
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

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Integer getIdSignalement() {
        return idSignalement;
    }

    public void setIdSignalement(Integer idSignalement) {
        this.idSignalement = idSignalement;
    }
}
