package web.backend.project.features.signalements.dto;

public class AvancementResponseDTO {
    
    private Integer id;
    private String dateModification;
    private Integer idUtilisateur;
    private String emailUtilisateur;
    private Integer idStatutAvancement;
    private String nomStatutAvancement;
    private Integer valeurStatutAvancement;
    
    // Constructeurs
    public AvancementResponseDTO() {
    }
    
    public AvancementResponseDTO(Integer id, String dateModification, Integer idUtilisateur, 
            String emailUtilisateur, Integer idStatutAvancement, String nomStatutAvancement, 
            Integer valeurStatutAvancement) {
        this.id = id;
        this.dateModification = dateModification;
        this.idUtilisateur = idUtilisateur;
        this.emailUtilisateur = emailUtilisateur;
        this.idStatutAvancement = idStatutAvancement;
        this.nomStatutAvancement = nomStatutAvancement;
        this.valeurStatutAvancement = valeurStatutAvancement;
    }
    
    // Getters et Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getDateModification() {
        return dateModification;
    }
    
    public void setDateModification(String dateModification) {
        this.dateModification = dateModification;
    }
    
    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }
    
    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }
    
    public String getEmailUtilisateur() {
        return emailUtilisateur;
    }
    
    public void setEmailUtilisateur(String emailUtilisateur) {
        this.emailUtilisateur = emailUtilisateur;
    }
    
    public Integer getIdStatutAvancement() {
        return idStatutAvancement;
    }
    
    public void setIdStatutAvancement(Integer idStatutAvancement) {
        this.idStatutAvancement = idStatutAvancement;
    }
    
    public String getNomStatutAvancement() {
        return nomStatutAvancement;
    }
    
    public void setNomStatutAvancement(String nomStatutAvancement) {
        this.nomStatutAvancement = nomStatutAvancement;
    }
    
    public Integer getValeurStatutAvancement() {
        return valeurStatutAvancement;
    }
    
    public void setValeurStatutAvancement(Integer valeurStatutAvancement) {
        this.valeurStatutAvancement = valeurStatutAvancement;
    }
}
