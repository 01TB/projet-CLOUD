package web.backend.project.mappers;

import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.dto.AvancementSignalementDTO;
import web.backend.project.entities.dto.SignalementDTO;
import web.backend.project.entities.dto.StatutAvancementDTO;

import org.locationtech.jts.io.WKTWriter;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.ParseException;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir les entités en DTOs et vice-versa
 */
@Component
public class SyncMapper {

    private final WKTWriter wktWriter = new WKTWriter();
    private final WKTReader wktReader = new WKTReader();

    // ========== SIGNALEMENT ==========
    
    public SignalementDTO toDTO(Signalement entity) {
        if (entity == null) return null;
        
        SignalementDTO dto = new SignalementDTO();
        dto.setId(entity.getId());
        dto.setDateCreation(entity.getDateCreation());
        dto.setSurface(entity.getSurface());
        dto.setBudget(entity.getBudget());
        dto.setSynchro(entity.getSynchro());
        
        // Conversion Geometry → WKT
        if (entity.getLocalisation() != null) {
            dto.setLocalisationWkt(wktWriter.write(entity.getLocalisation()));
        }
        
        // IDs des relations
        if (entity.getUtilisateurCreateur() != null) {
            dto.setUtilisateurCreateurId(entity.getUtilisateurCreateur().getId());
        }
        if (entity.getEntreprise() != null) {
            dto.setEntrepriseId(entity.getEntreprise().getId());
        }
        
        return dto;
    }
    
    public void updateEntityFromDTO(SignalementDTO dto, Signalement entity) {
        if (dto == null || entity == null) return;
        
        entity.setDateCreation(dto.getDateCreation());
        entity.setSurface(dto.getSurface());
        entity.setBudget(dto.getBudget());
        entity.setSynchro(dto.getSynchro());
        
        // Conversion WKT → Geometry
        if (dto.getLocalisationWkt() != null) {
            try {
                entity.setLocalisation(wktReader.read(dto.getLocalisationWkt()));
            } catch (ParseException e) {
                throw new RuntimeException("Invalid WKT format", e);
            }
        }
        
        // Note: Les relations doivent être gérées séparément avec les repositories
    }

    // ========== STATUT AVANCEMENT ==========
    
    public StatutAvancementDTO toDTO(StatutAvancement entity) {
        if (entity == null) return null;
        
        StatutAvancementDTO dto = new StatutAvancementDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setValeur(entity.getValeur());
        dto.setSynchro(entity.getSynchro());
        
        return dto;
    }
    
    public void updateEntityFromDTO(StatutAvancementDTO dto, StatutAvancement entity) {
        if (dto == null || entity == null) return;
        
        entity.setNom(dto.getNom());
        entity.setValeur(dto.getValeur());
        entity.setSynchro(dto.getSynchro());
    }

    // ========== AVANCEMENT SIGNALEMENT ==========
    
    public AvancementSignalementDTO toDTO(AvancementSignalement entity) {
        if (entity == null) return null;
        
        AvancementSignalementDTO dto = new AvancementSignalementDTO();
        dto.setId(entity.getId());
        dto.setDateModification(entity.getDateModification());
        dto.setSynchro(entity.getSynchro());
        
        // IDs des relations
        if (entity.getUtilisateur() != null) {
            dto.setUtilisateurId(entity.getUtilisateur().getId());
        }
        if (entity.getStatutAvancement() != null) {
            dto.setStatutAvancementId(entity.getStatutAvancement().getId());
        }
        if (entity.getSignalement() != null) {
            dto.setSignalementId(entity.getSignalement().getId());
        }
        
        return dto;
    }
    
    public void updateEntityFromDTO(AvancementSignalementDTO dto, AvancementSignalement entity) {
        if (dto == null || entity == null) return;
        
        entity.setDateModification(dto.getDateModification());
        entity.setSynchro(dto.getSynchro());
        
        // Note: Les relations doivent être gérées séparément avec les repositories
    }
}
