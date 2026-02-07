package web.backend.project.features.sync.config;

import jakarta.annotation.PostConstruct;
import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Entreprise;
import web.backend.project.entities.Parametre;
import web.backend.project.entities.Role;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.entities.UtilisateurBloque;
import web.backend.project.entities.dto.AvancementSignalementDTO;
import web.backend.project.entities.dto.EntrepriseDTO;
import web.backend.project.entities.dto.ParametreDTO;
import web.backend.project.entities.dto.RoleDTO;
import web.backend.project.entities.dto.SignalementDTO;
import web.backend.project.entities.dto.StatutAvancementDTO;
import web.backend.project.entities.dto.UtilisateurBloqueDTO;
import web.backend.project.entities.dto.UtilisateurDTO;
import web.backend.project.features.sync.services.EntitySyncRegistry;
import web.backend.project.features.sync.services.EntityTypeHandler;
import web.backend.project.features.sync.services.SyncService;
import web.backend.project.repositories.AvancementSignalementRepo;
import web.backend.project.repositories.EntrepriseRepository;
import web.backend.project.repositories.ParametreRepository;
import web.backend.project.repositories.RoleRepository;
import web.backend.project.repositories.SignalementRepository;
import web.backend.project.repositories.StatutAvancementRepo;
import web.backend.project.repositories.UtilisateurBloqueRepo;
import web.backend.project.repositories.UtilisateurRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration pour enregistrer les handlers d'entités dans le registre de
 * sync
 * Utilise l'approche générique via EntitySyncRegistry et EntityTypeHandler
 */
@Configuration
public class SyncRepositoryConfig {

	private static final Logger logger = LoggerFactory.getLogger(SyncRepositoryConfig.class);

	private final SyncService syncService;
	private final EntitySyncRegistry syncRegistry;

	@Autowired
	private SignalementRepository signalementRepository;

	@Autowired
	private StatutAvancementRepo statutAvancementRepository;

	@Autowired
	private AvancementSignalementRepo avancementSignalementRepository;

	@Autowired
	private UtilisateurRepository utilisateurRepository;

	@Autowired
	private UtilisateurBloqueRepo utilisateurBloqueRepository;

	@Autowired
	private EntrepriseRepository entrepriseRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private ParametreRepository parametreRepository;

	public SyncRepositoryConfig(SyncService syncService, EntitySyncRegistry syncRegistry) {
		this.syncService = syncService;
		this.syncRegistry = syncRegistry;
	}

	@PostConstruct
	public void registerRepositories() {
		// ========== Enregistrement dans l'ancien système (rétro-compatibilité)
		// ==========
		syncService.registerRepository("signalements", signalementRepository);
		syncService.registerRepository("statuts_avancement", statutAvancementRepository);
		syncService.registerRepository("avancements_signalement", avancementSignalementRepository);
		syncService.registerRepository("utilisateurs", utilisateurRepository);
		syncService.registerRepository("utilisateurs_bloques", utilisateurBloqueRepository);

		syncService.registerRepository("entreprises", entrepriseRepository);
		syncService.registerRepository("roles", roleRepository);
		syncService.registerRepository("parametres", parametreRepository);

		// ========== Enregistrement dans le nouveau registre générique ==========
		registerEntityHandlers();

		logger.info("Sync repositories and handlers registration completed");
	}

	/**
	 * Enregistre les handlers génériques pour chaque type d'entité
	 */
	private void registerEntityHandlers() {

		// Handler pour StatutAvancement (pas de relations)
		syncRegistry.register(new EntityTypeHandler<>(
				"statuts_avancement",
				statutAvancementRepository,
				StatutAvancement::new,
				StatutAvancementDTO::new));

		// Handler pour Signalement (avec relations obligatoires)
		syncRegistry.register(new EntityTypeHandler<>(
				"signalements",
				signalementRepository,
				Signalement::new,
				SignalementDTO::new,
				(entity, dto) -> {
					// Résolution de la relation UtilisateurCreateur (obligatoire)
					if (dto.getUtilisateurCreateurId() != null) {
						Utilisateur utilisateur = utilisateurRepository.findById(dto.getUtilisateurCreateurId())
								.orElseThrow(() -> new RuntimeException(
										"Utilisateur with id " + dto.getUtilisateurCreateurId() + " not found. " +
												"Ensure 'utilisateurs' are synchronized before 'signalements'."));
						entity.setUtilisateurCreateur(utilisateur);
					} else {
						throw new RuntimeException(
								"UtilisateurCreateur id is required for Signalement but was null. " +
										"Firebase data must include 'id_utilisateur_createur' field.");
					}
					// Résolution de la relation Entreprise (obligatoire)
					if (dto.getEntrepriseId() != null) {
						Entreprise entreprise = entrepriseRepository.findById(dto.getEntrepriseId())
								.orElseThrow(() -> new RuntimeException(
										"Entreprise with id " + dto.getEntrepriseId() + " not found. " +
												"Ensure 'entreprises' are synchronized before 'signalements'."));
						entity.setEntreprise(entreprise);
					} else {
						throw new RuntimeException(
								"Entreprise id is required for Signalement but was null. " +
										"Firebase data must include 'id_entreprise' field.");
					}
				}));

		// Handler pour AvancementSignalement (avec relations obligatoires)
		syncRegistry.register(new EntityTypeHandler<>(
				"avancements_signalement",
				avancementSignalementRepository,
				AvancementSignalement::new,
				AvancementSignalementDTO::new,
				(entity, dto) -> {
					// Résolution de la relation Utilisateur (obligatoire)
					if (dto.getUtilisateurId() != null) {
						Utilisateur utilisateur = utilisateurRepository.findById(dto.getUtilisateurId())
								.orElseThrow(() -> new RuntimeException(
										"Utilisateur with id " + dto.getUtilisateurId() + " not found. " +
												"Ensure 'utilisateurs' are synchronized before 'avancements_signalement'."));
						entity.setUtilisateur(utilisateur);
					} else {
						throw new RuntimeException(
								"Utilisateur id is required for AvancementSignalement but was null. " +
										"Firebase data must include 'id_utilisateur' field.");
					}
					// Résolution de la relation StatutAvancement (obligatoire)
					if (dto.getStatutAvancementId() != null) {
						StatutAvancement statut = statutAvancementRepository.findById(dto.getStatutAvancementId())
								.orElseThrow(() -> new RuntimeException(
										"StatutAvancement with id " + dto.getStatutAvancementId() + " not found. " +
												"Ensure 'statuts_avancement' are synchronized before 'avancements_signalement'."));
						entity.setStatutAvancement(statut);
					} else {
						throw new RuntimeException(
								"StatutAvancement id is required for AvancementSignalement but was null. " +
										"Firebase data must include 'id_statut_avancement' field.");
					}
					// Résolution de la relation Signalement (obligatoire)
					if (dto.getSignalementId() != null) {
						Signalement signalement = signalementRepository.findById(dto.getSignalementId())
								.orElseThrow(() -> new RuntimeException(
										"Signalement with id " + dto.getSignalementId() + " not found. " +
												"Ensure 'signalements' are synchronized before 'avancements_signalement'."));
						entity.setSignalement(signalement);
					} else {
						throw new RuntimeException(
								"Signalement id is required for AvancementSignalement but was null. " +
										"Firebase data must include 'id_signalement' field.");
					}
				}));

		// Handler pour Utilisateur (avec relation Role)
		syncRegistry.register(new EntityTypeHandler<>(
				"utilisateurs",
				utilisateurRepository,
				Utilisateur::new,
				UtilisateurDTO::new,
				(entity, dto) -> {
					// Résolution de la relation Role (obligatoire)
					if (dto.getRoleId() != null) {
						Role role = roleRepository.findById(dto.getRoleId())
								.orElseThrow(() -> new RuntimeException(
										"Role with id " + dto.getRoleId() + " not found. " +
												"Ensure 'roles' are synchronized before 'utilisateurs'."));
						entity.setRole(role);
					} else {
						throw new RuntimeException(
								"Role id is required for Utilisateur but was null. " +
										"Firebase data must include 'id_role' field.");
					}
				}));

		// Handler pour UtilisateurBloque (avec relation Utilisateur)
		syncRegistry.register(new EntityTypeHandler<>(
				"utilisateurs_bloques",
				utilisateurBloqueRepository,
				UtilisateurBloque::new,
				UtilisateurBloqueDTO::new,
				(entity, dto) -> {
					// Résolution de la relation Utilisateur (obligatoire)
					if (dto.getUtilisateurId() != null) {
						Utilisateur utilisateur = utilisateurRepository.findById(dto.getUtilisateurId())
								.orElseThrow(() -> new RuntimeException(
										"Utilisateur with id " + dto.getUtilisateurId() + " not found. " +
												"Ensure 'utilisateurs' are synchronized before 'utilisateurs_bloques'."));
						entity.setUtilisateur(utilisateur);
					} else {
						throw new RuntimeException(
								"Utilisateur id is required for UtilisateurBloque but was null. " +
										"Firebase data must include 'id_utilisateur' field.");
					}
				}));

		syncRegistry.register(new EntityTypeHandler<>(
				"entreprises", entrepriseRepository,
				Entreprise::new,
				EntrepriseDTO::new));

		syncRegistry.register(new EntityTypeHandler<>(
				"parametres", parametreRepository,
				Parametre::new,
				ParametreDTO::new));

		syncRegistry.register(new EntityTypeHandler<>(
				"roles",
				roleRepository,
				Role::new,
				RoleDTO::new));

		logger.info("Registered {} entity handlers in sync registry", syncRegistry.getRegisteredTypes().size());
	}
}
