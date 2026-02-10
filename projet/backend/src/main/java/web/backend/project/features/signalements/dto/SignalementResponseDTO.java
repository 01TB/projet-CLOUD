package web.backend.project.features.signalements.dto;

import java.util.List;

public class SignalementResponseDTO {

    private Integer id;
    private String dateCreation;
    private Double surface;
    private Float budget;
    private String localisation; // Format WKT
    private Boolean synchro;
    private Integer idUtilisateurCreateur;
    private String emailUtilisateurCreateur;
    private Integer idEntreprise;
    private String nomEntreprise;
    private Integer niveaux;
    private List<AvancementResponseDTO> avancements; // Liste des avancements du signalement
    private List<SignalementPhotoResponseDTO> photos; // Liste des photos du signalement

    // Constructeurs
    public SignalementResponseDTO() {
    }

    public SignalementResponseDTO(Integer id, String dateCreation, Double surface,
            Float budget, String localisation, Boolean synchro,
            Integer idUtilisateurCreateur, String emailUtilisateurCreateur,
            Integer idEntreprise, String nomEntreprise, Integer niveaux,
            List<AvancementResponseDTO> avancements,
            List<SignalementPhotoResponseDTO> photos) {
        this.id = id;
        this.dateCreation = dateCreation;
        this.surface = surface;
        this.budget = budget;
        this.localisation = localisation;
        this.synchro = synchro;
        this.idUtilisateurCreateur = idUtilisateurCreateur;
        this.emailUtilisateurCreateur = emailUtilisateurCreateur;
        this.idEntreprise = idEntreprise;
        this.nomEntreprise = nomEntreprise;
        this.niveaux = niveaux;
        this.avancements = avancements;
        this.photos = photos;
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

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Integer getIdUtilisateurCreateur() {
        return idUtilisateurCreateur;
    }

    public void setIdUtilisateurCreateur(Integer idUtilisateurCreateur) {
        this.idUtilisateurCreateur = idUtilisateurCreateur;
    }

    public String getEmailUtilisateurCreateur() {
        return emailUtilisateurCreateur;
    }

    public void setEmailUtilisateurCreateur(String emailUtilisateurCreateur) {
        this.emailUtilisateurCreateur = emailUtilisateurCreateur;
    }

    public Integer getIdEntreprise() {
        return idEntreprise;
    }

    public void setIdEntreprise(Integer idEntreprise) {
        this.idEntreprise = idEntreprise;
    }

    public String getNomEntreprise() {
        return nomEntreprise;
    }

    public void setNomEntreprise(String nomEntreprise) {
        this.nomEntreprise = nomEntreprise;
    }

    public Integer getNiveaux() {
        return niveaux;
    }

    public void setNiveaux(Integer niveaux) {
        this.niveaux = niveaux;
    }

    public List<AvancementResponseDTO> getAvancements() {
        return avancements;
    }

    public void setAvancements(List<AvancementResponseDTO> avancements) {
        this.avancements = avancements;
    }

    public List<SignalementPhotoResponseDTO> getPhotos() {
        return photos;
    }

    public void setPhotos(List<SignalementPhotoResponseDTO> photos) {
        this.photos = photos;
    }
}