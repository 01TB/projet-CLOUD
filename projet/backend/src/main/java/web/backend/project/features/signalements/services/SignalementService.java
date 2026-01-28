package web.backend.project.features.signalements.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import web.backend.project.entities.Entreprise;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.exceptions.ResourceNotFoundException;
import web.backend.project.features.signalements.dto.SignalementDTO;
import web.backend.project.features.signalements.dto.SignalementResponseDTO;
import web.backend.project.mappers.SignalementMapper;
import web.backend.project.repositories.EntrepriseRepository;
import web.backend.project.repositories.SignalementRepository;
import web.backend.project.repositories.UtilisateurRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private EntrepriseRepository entrepriseRepository;
    @Autowired
    private SignalementMapper signalementMapper;

    /**
     * Crée un nouveau signalement
     */
    public SignalementResponseDTO createSignalement(SignalementDTO signalementDTO) {
        // Vérifier que l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(signalementDTO.getIdUtilisateurCreateur())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id",
                        signalementDTO.getIdUtilisateurCreateur()));

        // Vérifier que l'entreprise existe
        Entreprise entreprise = entrepriseRepository.findById(signalementDTO.getIdEntreprise())
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id",
                        signalementDTO.getIdEntreprise()));

        // Convertir DTO vers entité
        Signalement signalement = signalementMapper.toEntity(signalementDTO, utilisateur, entreprise);

        // Sauvegarder
        Signalement savedSignalement = signalementRepository.save(signalement);

        // Retourner le DTO de réponse
        return signalementMapper.toResponseDTO(savedSignalement);
    }

    /**
     * Récupère tous les signalements
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getAllSignalements() {
        return signalementRepository.findAll().stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un signalement par son ID
     */
    @Transactional(readOnly = true)
    public SignalementResponseDTO getSignalementById(Integer id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

        return signalementMapper.toResponseDTO(signalement);
    }

    /**
     * Met à jour un signalement
     */
    public SignalementResponseDTO updateSignalement(Integer id, SignalementDTO signalementDTO) {
        // Vérifier que le signalement existe
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

        // Vérifier que l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(signalementDTO.getIdUtilisateurCreateur())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id",
                        signalementDTO.getIdUtilisateurCreateur()));

        // Vérifier que l'entreprise existe
        Entreprise entreprise = entrepriseRepository.findById(signalementDTO.getIdEntreprise())
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id",
                        signalementDTO.getIdEntreprise()));

        // Mettre à jour l'entité
        signalementMapper.updateEntity(signalement, signalementDTO, utilisateur, entreprise);

        // Sauvegarder
        Signalement updatedSignalement = signalementRepository.save(signalement);

        // Retourner le DTO de réponse
        return signalementMapper.toResponseDTO(updatedSignalement);
    }

    /**
     * Supprime un signalement
     */
    public void deleteSignalement(Integer id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

        signalementRepository.delete(signalement);
    }

    /**
     * Récupère les signalements par entreprise
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsByEntreprise(Integer entrepriseId) {
        return signalementRepository.findByEntrepriseId(entrepriseId).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements par utilisateur créateur
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsByUtilisateur(Integer utilisateurId) {
        return signalementRepository.findByUtilisateurCreateurId(utilisateurId).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements par statut de synchronisation
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsBySynchro(Boolean synchro) {
        return signalementRepository.findBySynchro(synchro).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements avec un budget minimum
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsByBudgetMin(Integer budgetMin) {
        return signalementRepository.findByBudgetGreaterThanEqual(budgetMin).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements avec une surface minimum
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsBySurfaceMin(Double surfaceMin) {
        return signalementRepository.findBySurfaceGreaterThanEqual(surfaceMin).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements par plage de budget
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsByBudgetRange(Integer minBudget, Integer maxBudget) {
        return signalementRepository.findByBudgetBetween(minBudget, maxBudget).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements par plage de surface
     */
    @Transactional(readOnly = true)
    public List<SignalementResponseDTO> getSignalementsBySurfaceRange(Double minSurface, Double maxSurface) {
        return signalementRepository.findBySurfaceBetween(minSurface, maxSurface).stream()
                .map(signalementMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour le statut de synchronisation d'un signalement
     */
    public SignalementResponseDTO updateSynchroStatus(Integer id, Boolean synchro) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

        signalement.setSynchro(synchro);
        Signalement updatedSignalement = signalementRepository.save(signalement);

        return signalementMapper.toResponseDTO(updatedSignalement);
    }
}