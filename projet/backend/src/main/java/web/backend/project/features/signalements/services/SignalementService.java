package web.backend.project.features.signalements.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Entreprise;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.SignalementNiveaux;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.exceptions.ResourceNotFoundException;
import web.backend.project.features.signalements.dto.SignalementInsertDTO;
import web.backend.project.features.signalements.dto.SignalementResponseDTO;
import web.backend.project.mappers.CrudSignalementMapper;
import web.backend.project.repositories.EntrepriseRepository;
import web.backend.project.repositories.SignalementRepository;
import web.backend.project.repositories.SignalisationNiveauxRepo;
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
	private SignalisationNiveauxRepo signalisationNiveauxRepo;

	/**
	 * Crée un nouveau signalement
	 */
	public SignalementResponseDTO createSignalement(SignalementInsertDTO signalementDTO) {
		// Vérifier que l'utilisateur existe
		Utilisateur utilisateur = utilisateurRepository.findById(signalementDTO.getIdUtilisateurCreateur())
				.orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id",
						signalementDTO.getIdUtilisateurCreateur()));

		// Vérifier que l'entreprise existe
		Entreprise entreprise = entrepriseRepository.findById(signalementDTO.getIdEntreprise())
				.orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id",
						signalementDTO.getIdEntreprise()));

		// Vérifier que le niveau existe
		SignalementNiveaux niveaux = signalisationNiveauxRepo.findById(signalementDTO.getIdNiveaux())
				.orElseThrow(() -> new ResourceNotFoundException("SignalementNiveaux", "id",
						signalementDTO.getIdNiveaux()));

		// Convertir DTO vers entité
		Signalement signalement = crudSignalementMapper.toEntity(signalementDTO, utilisateur, entreprise, niveaux);

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
	 * Met à jour un signalement
	 */
	public SignalementResponseDTO updateSignalement(Integer id, SignalementInsertDTO signalementDTO) {
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

		// Vérifier que le niveau existe
		SignalementNiveaux niveaux = signalisationNiveauxRepo.findById(signalementDTO.getIdNiveaux())
				.orElseThrow(() -> new ResourceNotFoundException("SignalementNiveaux", "id",
						signalementDTO.getIdNiveaux()));

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

		// Mettre à jour l'entité
		crudSignalementMapper.updateEntity(signalement, signalementDTO, utilisateur, entreprise, niveaux);

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

	/**
	 * Met à jour le prix au m² d'un niveau de signalement
	 * et recalcule le budget de tous les signalements concernés (statut NOUVEAUX
	 * uniquement)
	 * Budget = prixM2 * surface
	 */
	public SignalementNiveaux updateNiveauxPrix(Integer niveauxId, Float newPrixM2) {
		// Vérifier que le niveau existe
		SignalementNiveaux niveaux = signalisationNiveauxRepo.findById(niveauxId)
				.orElseThrow(() -> new ResourceNotFoundException("SignalementNiveaux", "id", niveauxId));

		// Mettre à jour le prix au m²
		niveaux.setPrixM2(newPrixM2);
		niveaux.setSynchro(false);
		SignalementNiveaux savedNiveaux = signalisationNiveauxRepo.save(niveaux);

		// Recalculer le budget des signalements concernés (statut NOUVEAUX uniquement)
		List<Signalement> signalementsNouveaux = signalementRepository
				.findByNiveauxIdAndStatusNouveaux(niveauxId);

		for (Signalement signalement : signalementsNouveaux) {
			Float nouveauBudget = newPrixM2 * signalement.getSurface().floatValue();
			signalement.setBudget(nouveauBudget);
			signalement.setSynchro(false);
		}

		if (!signalementsNouveaux.isEmpty()) {
			signalementRepository.saveAll(signalementsNouveaux);
		}

		return savedNiveaux;
	}

}