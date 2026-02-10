package web.backend.project.features.signalements.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class SignalementDTO {

    @NotNull(message = "La date de création est obligatoire")
    @Size(max = 50, message = "La date de création ne doit pas dépasser 50 caractères")
    private String dateCreation;

    @NotNull(message = "La surface est obligatoire")
    @Positive(message = "La surface doit être positive")
    private Double surface;

    @Positive(message = "Le budget doit être positif")
    private Float budget;

    @NotNull(message = "La localisation est obligatoire")
    private String localisation; // Format WKT (Well-Known Text) pour la géométrie

    @NotNull(message = "L'ID de l'utilisateur créateur est obligatoire")
    private Integer idUtilisateurCreateur;

    private Integer idEntreprise;

    private Integer niveaux;

    private Boolean synchro = false;

    // Nouveau statut (optionnel, utilisé lors de la mise à jour pour changer le
    // statut)
    private Integer idNouveauStatut;

    // Constructeurs
    public SignalementDTO() {
    }

    public SignalementDTO(String dateCreation, Double surface, Float budget,
            String localisation, Integer idUtilisateurCreateur,
            Integer idEntreprise, Integer niveaux, Boolean synchro) {
        this.dateCreation = dateCreation;
        this.surface = surface;
        this.budget = budget;
        this.localisation = localisation;
        this.idUtilisateurCreateur = idUtilisateurCreateur;
        this.idEntreprise = idEntreprise;
        this.niveaux = niveaux;
        this.synchro = synchro;
    }

    // Getters et Setters
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

    public Integer getIdUtilisateurCreateur() {
        return idUtilisateurCreateur;
    }

    public void setIdUtilisateurCreateur(Integer idUtilisateurCreateur) {
        this.idUtilisateurCreateur = idUtilisateurCreateur;
    }

    public Integer getIdEntreprise() {
        return idEntreprise;
    }

    public void setIdEntreprise(Integer idEntreprise) {
        this.idEntreprise = idEntreprise;
    }

    public Integer getNiveaux() {
        return niveaux;
    }

    public void setNiveaux(Integer niveaux) {
        this.niveaux = niveaux;
    }

    public Boolean getSynchro() {
        return synchro;
    }

    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Integer getIdNouveauStatut() {
        return idNouveauStatut;
    }

    public void setIdNouveauStatut(Integer idNouveauStatut) {
        this.idNouveauStatut = idNouveauStatut;
    }
}