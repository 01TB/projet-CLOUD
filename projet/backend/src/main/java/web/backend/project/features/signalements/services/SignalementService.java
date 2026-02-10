package web.backend.project.features.signalements.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Entreprise;
import web.backend.project.entities.MvtPrixSignalement;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.exceptions.ResourceNotFoundException;
import web.backend.project.features.signalements.dto.SignalementInsertDTO;
import web.backend.project.features.signalements.dto.SignalementResponseDTO;
import web.backend.project.mappers.CrudSignalementMapper;
import web.backend.project.repositories.EntrepriseRepository;
import web.backend.project.repositories.MvtPrixSignalementRepository;
import web.backend.project.repositories.SignalementRepository;
import web.backend.project.repositories.StatutAvancementRepo;
import web.backend.project.repositories.UtilisateurRepository;

import java.time.LocalDateTime;
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
	private CrudSignalementMapper crudSignalementMapper;

	@Autowired
	private StatutAvancementRepo statutAvancementRepo;

	@Autowired
	private MvtPrixSignalementRepository mvtPrixSignalementRepository;

	/**
	 * Crée un nouveau signalement
	 */
	public SignalementResponseDTO createSignalement(SignalementInsertDTO signalementDTO) {
		// Vérifier que l'utilisateur existe
		Utilisateur utilisateur = utilisateurRepository.findById(signalementDTO.getIdUtilisateurCreateur())
				.orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id",
						signalementDTO.getIdUtilisateurCreateur()));

		// Vérifier que l'entreprise existe (nullable pour les nouveaux signalements
		// depuis Firebase)
		Entreprise entreprise = null;
		if (signalementDTO.getIdEntreprise() != null) {
			entreprise = entrepriseRepository.findById(signalementDTO.getIdEntreprise())
					.orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id",
							signalementDTO.getIdEntreprise()));
		}

		// Convertir DTO vers entité
		Signalement signalement = crudSignalementMapper.toEntity(signalementDTO, utilisateur, entreprise);

		// Sauvegarder
		Signalement savedSignalement = signalementRepository.save(signalement);

		// Retourner le DTO de réponse
		return crudSignalementMapper.toResponseDTO(savedSignalement);
	}

	/**
	 * Récupère tous les signalements
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getAllSignalements() {
		return signalementRepository.findAll().stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère un signalement par son ID
	 */
	@Transactional(readOnly = true)
	public SignalementResponseDTO getSignalementById(Integer id) {
		Signalement signalement = signalementRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

		return crudSignalementMapper.toResponseDTO(signalement);
	}

	/**
	 * Met à jour un signalement.
	 * C'est ici qu'on affecte l'entreprise et qu'on calcule le budget
	 * (dénormalisation)
	 * à partir du prix actuel de mvt_prix_signalements.
	 * Formule budget = prix_actuel * niveaux * surface
	 */
	public SignalementResponseDTO updateSignalement(Integer id, SignalementInsertDTO signalementDTO) {
		// Vérifier que le signalement existe
		Signalement signalement = signalementRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));

		// Vérifier que l'utilisateur existe
		Utilisateur utilisateur = utilisateurRepository.findById(signalementDTO.getIdUtilisateurCreateur())
				.orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id",
						signalementDTO.getIdUtilisateurCreateur()));

		// Vérifier que l'entreprise existe (nullable - affectation ultérieure)
		Entreprise entreprise = null;
		if (signalementDTO.getIdEntreprise() != null) {
			entreprise = entrepriseRepository.findById(signalementDTO.getIdEntreprise())
					.orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id",
							signalementDTO.getIdEntreprise()));
		}

		// ======= Calcul du budget lors de l'affectation =======
		// Si un niveaux est fourni (affectation), on calcule le budget automatiquement
		Integer niveaux = signalementDTO.getNiveaux() != null ? signalementDTO.getNiveaux() : signalement.getNiveaux();
		Double surface = signalementDTO.getSurface() != null ? signalementDTO.getSurface() : signalement.getSurface();

		if (niveaux != null && surface != null && niveaux > 0) {
			// Récupérer le prix actuel depuis mvt_prix_signalements
			MvtPrixSignalement prixActuel = mvtPrixSignalementRepository.findLatestPrix()
					.orElse(null);

			if (prixActuel != null) {
				// Budget = prix_actuel * niveaux * surface
				float budgetCalcule = (float) (prixActuel.getMontant() * niveaux * surface);
				signalementDTO.setBudget(budgetCalcule);
			}
		}

		// Si un nouveau statut est fourni, créer un nouvel AvancementSignalement
		if (signalementDTO.getIdNouveauStatut() != null) {
			StatutAvancement nouveauStatut = statutAvancementRepo.findById(signalementDTO.getIdNouveauStatut())
					.orElseThrow(() -> new ResourceNotFoundException("StatutAvancement", "id",
							signalementDTO.getIdNouveauStatut()));

			// Créer le nouvel avancement
			AvancementSignalement avancement = new AvancementSignalement();

			// Utiliser la date fournie ou la date actuelle par défaut
			LocalDateTime dateModification = LocalDateTime.now();
			if (signalementDTO.getDateModificationStatut() != null
					&& !signalementDTO.getDateModificationStatut().isEmpty()) {
				try {
					dateModification = LocalDateTime.parse(signalementDTO.getDateModificationStatut());
				} catch (Exception e) {
					// Si le parsing échoue, utiliser la date actuelle
					dateModification = LocalDateTime.now();
				}
			}
			avancement.setDateModification(dateModification);

			avancement.setSynchro(false);
			avancement.setUtilisateur(utilisateur);
			avancement.setStatutAvancement(nouveauStatut);
			avancement.setSignalement(signalement);

			// Ajouter l'avancement au signalement
			signalement.addAvancement(avancement);
		}

		// Mettre à jour l'entité (le mapper gère l'affectation du budget calculé)
		crudSignalementMapper.updateEntity(signalement, signalementDTO, utilisateur, entreprise);

		// Sauvegarder
		Signalement updatedSignalement = signalementRepository.save(signalement);

		// Retourner le DTO de réponse
		return crudSignalementMapper.toResponseDTO(updatedSignalement);
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
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements par utilisateur créateur
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsByUtilisateur(Integer utilisateurId) {
		return signalementRepository.findByUtilisateurCreateurId(utilisateurId).stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements par statut de synchronisation
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsBySynchro(Boolean synchro) {
		return signalementRepository.findBySynchro(synchro).stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements avec un budget minimum
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsByBudgetMin(Float budgetMin) {
		return signalementRepository.findByBudgetGreaterThanEqual(budgetMin).stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements avec une surface minimum
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsBySurfaceMin(Double surfaceMin) {
		return signalementRepository.findBySurfaceGreaterThanEqual(surfaceMin).stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements par plage de budget
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsByBudgetRange(Float minBudget, Float maxBudget) {
		return signalementRepository.findByBudgetBetween(minBudget, maxBudget).stream()
				.map(crudSignalementMapper::toResponseDTO)
				.collect(Collectors.toList());
	}

	/**
	 * Récupère les signalements par plage de surface
	 */
	@Transactional(readOnly = true)
	public List<SignalementResponseDTO> getSignalementsBySurfaceRange(Double minSurface, Double maxSurface) {
		return signalementRepository.findBySurfaceBetween(minSurface, maxSurface).stream()
				.map(crudSignalementMapper::toResponseDTO)
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

		return crudSignalementMapper.toResponseDTO(updatedSignalement);
	}
}