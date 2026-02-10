package web.backend.project.mappers;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Entreprise;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.SignalementNiveaux;
import web.backend.project.entities.SignalementPhoto;
import web.backend.project.entities.Utilisateur;
import web.backend.project.features.signalements.dto.SignalementInsertDTO;
import web.backend.project.features.signalements.dto.AvancementResponseDTO;
import web.backend.project.features.signalements.dto.SignalementPhotoResponseDTO;
import web.backend.project.features.signalements.dto.SignalementResponseDTO;
import web.backend.project.repositories.AvancementSignalementRepo;
import web.backend.project.repositories.SignalementPhotoRepo;

@Component
public class CrudSignalementMapper {

    private final WKTReader wktReader = new WKTReader();
    private final WKTWriter wktWriter = new WKTWriter();
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AvancementSignalementRepo avancementSignalementRepo;

    @Autowired
    private SignalementPhotoRepo signalementPhotoRepo;

    /**
     * Convertit un SignalementDTO en entité Signalement
     */
    public Signalement toEntity(SignalementInsertDTO dto, Utilisateur utilisateur, Entreprise entreprise,
            SignalementNiveaux niveaux) {
        Signalement signalement = new Signalement();
        signalement.setDateCreation(dto.getDateCreation());
        signalement.setSurface(dto.getSurface());
        signalement.setBudget(dto.getBudget());
        signalement.setSynchro(dto.getSynchro() != null ? dto.getSynchro() : false);
        signalement.setUtilisateurCreateur(utilisateur);
        signalement.setEntreprise(entreprise);
        signalement.setNiveaux(niveaux);

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
            Utilisateur utilisateur, Entreprise entreprise, SignalementNiveaux niveaux) {
        signalement.setDateCreation(dto.getDateCreation());
        signalement.setSurface(dto.getSurface());
        signalement.setBudget(dto.getBudget());
        signalement.setSynchro(dto.getSynchro() != null ? dto.getSynchro() : signalement.getSynchro());
        signalement.setUtilisateurCreateur(utilisateur);
        signalement.setEntreprise(entreprise);
        signalement.setNiveaux(niveaux);

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

        // Informations niveaux
        if (signalement.getNiveaux() != null) {
            dto.setIdNiveaux(signalement.getNiveaux().getId());
            dto.setLibelleNiveaux(signalement.getNiveaux().getLibelles());
            dto.setPrixM2Niveaux(signalement.getNiveaux().getPrixM2());
        }

        // Récupérer et convertir les avancements
        List<AvancementSignalement> avancements = avancementSignalementRepo
                .findBySignalement_IdOrderByDateModificationDesc(signalement.getId());

        List<AvancementResponseDTO> avancementDTOs = new ArrayList<>();
        for (AvancementSignalement avancement : avancements) {
            AvancementResponseDTO avancementDTO = new AvancementResponseDTO();
            avancementDTO.setId(avancement.getId());
            avancementDTO.setDateModification(avancement.getDateModification().format(dateFormatter));

            if (avancement.getUtilisateur() != null) {
                avancementDTO.setIdUtilisateur(avancement.getUtilisateur().getId());
                avancementDTO.setEmailUtilisateur(avancement.getUtilisateur().getEmail());
            }

            if (avancement.getStatutAvancement() != null) {
                avancementDTO.setIdStatutAvancement(avancement.getStatutAvancement().getId());
                avancementDTO.setNomStatutAvancement(avancement.getStatutAvancement().getNom());
                avancementDTO.setValeurStatutAvancement(avancement.getStatutAvancement().getValeur());
            }

            avancementDTOs.add(avancementDTO);
        }

        dto.setAvancements(avancementDTOs);

        // Récupérer et convertir les photos
        List<SignalementPhoto> photos = signalementPhotoRepo
                .findBySignalement_Id(signalement.getId());

        List<SignalementPhotoResponseDTO> photoDTOs = new ArrayList<>();
        for (SignalementPhoto photo : photos) {
            SignalementPhotoResponseDTO photoDTO = new SignalementPhotoResponseDTO();
            photoDTO.setId(photo.getId());
            photoDTO.setPathPhoto(photo.getPathPhoto());
            photoDTO.setSynchro(photo.getSynchro());
            photoDTO.setDateCreation(photo.getDateCreation() != null
                    ? photo.getDateCreation().format(dateFormatter)
                    : null);
            photoDTO.setIdSignalement(signalement.getId());
            photoDTOs.add(photoDTO);
        }

        dto.setPhotos(photoDTOs);

        return dto;
    }
}