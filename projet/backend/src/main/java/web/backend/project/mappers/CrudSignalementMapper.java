package web.backend.project.mappers;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;
import org.springframework.stereotype.Component;
import web.backend.project.entities.Entreprise;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.features.signalements.dto.SignalementInsertDTO;
import web.backend.project.features.signalements.dto.SignalementResponseDTO;

@Component
public class CrudSignalementMapper {
    
    private final WKTReader wktReader = new WKTReader();
    private final WKTWriter wktWriter = new WKTWriter();

    /**
     * Convertit un SignalementDTO en entité Signalement
     */
    public Signalement toEntity(SignalementInsertDTO dto, Utilisateur utilisateur, Entreprise entreprise) {
        Signalement signalement = new Signalement();
        signalement.setDateCreation(dto.getDateCreation());
        signalement.setSurface(dto.getSurface());
        signalement.setBudget(dto.getBudget());
        signalement.setSynchro(dto.getSynchro() != null ? dto.getSynchro() : false);
        signalement.setUtilisateurCreateur(utilisateur);
        signalement.setEntreprise(entreprise);
        
        // Conversion WKT vers Geometry
        try {
            Geometry geometry = wktReader.read(dto.getLocalisation());
            geometry.setSRID(4326); // WGS 84
            signalement.setLocalisation(geometry);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Format de localisation invalide: " + e.getMessage());
        }
        
        return signalement;
    }

    /**
     * Met à jour une entité Signalement existante avec les données du DTO
     */
    public void updateEntity(Signalement signalement, SignalementInsertDTO dto, 
                            Utilisateur utilisateur, Entreprise entreprise) {
        signalement.setDateCreation(dto.getDateCreation());
        signalement.setSurface(dto.getSurface());
        signalement.setBudget(dto.getBudget());
        signalement.setSynchro(dto.getSynchro() != null ? dto.getSynchro() : signalement.getSynchro());
        signalement.setUtilisateurCreateur(utilisateur);
        signalement.setEntreprise(entreprise);
        
        // Conversion WKT vers Geometry
        try {
            Geometry geometry = wktReader.read(dto.getLocalisation());
            geometry.setSRID(4326); // WGS 84
            signalement.setLocalisation(geometry);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Format de localisation invalide: " + e.getMessage());
        }
    }

    /**
     * Convertit une entité Signalement en SignalementResponseDTO
     */
    public SignalementResponseDTO toResponseDTO(Signalement signalement) {
        SignalementResponseDTO dto = new SignalementResponseDTO();
        dto.setId(signalement.getId());
        dto.setDateCreation(signalement.getDateCreation());
        dto.setSurface(signalement.getSurface());
        dto.setBudget(signalement.getBudget());
        dto.setSynchro(signalement.getSynchro());
        
        // Conversion Geometry vers WKT
        if (signalement.getLocalisation() != null) {
            dto.setLocalisation(wktWriter.write(signalement.getLocalisation()));
        }
        
        // Informations utilisateur
        if (signalement.getUtilisateurCreateur() != null) {
            dto.setIdUtilisateurCreateur(signalement.getUtilisateurCreateur().getId());
            dto.setEmailUtilisateurCreateur(signalement.getUtilisateurCreateur().getEmail());
        }
        
        // Informations entreprise
        if (signalement.getEntreprise() != null) {
            dto.setIdEntreprise(signalement.getEntreprise().getId());
            dto.setNomEntreprise(signalement.getEntreprise().getNom());
        }
        
        return dto;
    }
}