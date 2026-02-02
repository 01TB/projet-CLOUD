package web.backend.project.features.sync.config;

import jakarta.annotation.PostConstruct;
import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Signalement;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.entities.Utilisateur;
import web.backend.project.entities.UtilisateurBloque;
import web.backend.project.entities.dto.AvancementSignalementDTO;
import web.backend.project.entities.dto.SignalementDTO;
import web.backend.project.entities.dto.StatutAvancementDTO;
import web.backend.project.entities.dto.UtilisateurBloqueDTO;
import web.backend.project.entities.dto.UtilisateurDTO;
import web.backend.project.features.sync.services.EntitySyncRegistry;
import web.backend.project.features.sync.services.EntityTypeHandler;
import web.backend.project.features.sync.services.SyncService;
import web.backend.project.repositories.AvancementSignalementRepo;
import web.backend.project.repositories.EntrepriseRepository;
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

    public SyncRepositoryConfig(SyncService syncService, EntitySyncRegistry syncRegistry) {
        this.syncService = syncService;
        this.syncRegistry = syncRegistry;
    }

    @PostConstruct
    public void registerRepositories() {
        // ========== Enregistrement dans l'ancien système (rétro-compatibilité)
        // ==========
        syncService.registerRepository("Signalement", signalementRepository);
        syncService.registerRepository("StatutAvancement", statutAvancementRepository);
        syncService.registerRepository("AvancementSignalement", avancementSignalementRepository);
        syncService.registerRepository("Utilisateur", utilisateurRepository);
        syncService.registerRepository("UtilisateurBloque", utilisateurBloqueRepository);

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
                "StatutAvancement",
                statutAvancementRepository,
                StatutAvancement::new,
                StatutAvancementDTO::new));

        // Handler pour Signalement (avec relations)
        syncRegistry.register(new EntityTypeHandler<>(
                "Signalement",
                signalementRepository,
                Signalement::new,
                SignalementDTO::new,
                (entity, dto) -> {
                    // Résolution des relations depuis les IDs
                    if (dto.getUtilisateurCreateurId() != null) {
                        utilisateurRepository.findById(dto.getUtilisateurCreateurId())
                                .ifPresent(entity::setUtilisateurCreateur);
                    }
                    if (dto.getEntrepriseId() != null) {
                        entrepriseRepository.findById(dto.getEntrepriseId())
                                .ifPresent(entity::setEntreprise);
                    }
                }));

        // Handler pour AvancementSignalement (avec relations)
        syncRegistry.register(new EntityTypeHandler<>(
                "AvancementSignalement",
                avancementSignalementRepository,
                AvancementSignalement::new,
                AvancementSignalementDTO::new,
                (entity, dto) -> {
                    // Résolution des relations depuis les IDs
                    if (dto.getUtilisateurId() != null) {
                        utilisateurRepository.findById(dto.getUtilisateurId())
                                .ifPresent(entity::setUtilisateur);
                    }
                    if (dto.getStatutAvancementId() != null) {
                        statutAvancementRepository.findById(dto.getStatutAvancementId())
                                .ifPresent(entity::setStatutAvancement);
                    }
                    if (dto.getSignalementId() != null) {
                        signalementRepository.findById(dto.getSignalementId())
                                .ifPresent(entity::setSignalement);
                    }
                }));

        // Handler pour Utilisateur (avec relation Role)
        syncRegistry.register(new EntityTypeHandler<>(
                "Utilisateur",
                utilisateurRepository,
                Utilisateur::new,
                UtilisateurDTO::new,
                (entity, dto) -> {
                    // Résolution de la relation Role
                    if (dto.getRoleId() != null) {
                        roleRepository.findById(dto.getRoleId())
                                .ifPresent(entity::setRole);
                    }
                }));

        // Handler pour UtilisateurBloque (avec relation Utilisateur)
        syncRegistry.register(new EntityTypeHandler<>(
                "UtilisateurBloque",
                utilisateurBloqueRepository,
                UtilisateurBloque::new,
                UtilisateurBloqueDTO::new,
                (entity, dto) -> {
                    // Résolution de la relation Utilisateur
                    if (dto.getUtilisateurId() != null) {
                        utilisateurRepository.findById(dto.getUtilisateurId())
                                .ifPresent(entity::setUtilisateur);
                    }
                }));

        logger.info("Registered {} entity handlers in sync registry", syncRegistry.getRegisteredTypes().size());
    }
}
