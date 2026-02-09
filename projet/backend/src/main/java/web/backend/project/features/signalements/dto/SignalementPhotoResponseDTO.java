package web.backend.project.features.signalements.dto;

public class SignalementPhotoResponseDTO {

    private Integer id;
    private String pathPhoto;
    private Boolean synchro;
    private String dateCreation;
    private Integer idSignalement;

    // Constructeurs
    public SignalementPhotoResponseDTO() {
    }

    public SignalementPhotoResponseDTO(Integer id, String pathPhoto, Boolean synchro,
            String dateCreation, Integer idSignalement) {
        this.id = id;
        this.pathPhoto = pathPhoto;
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
