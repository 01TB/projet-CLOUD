package web.backend.project.features.sync.config;

import jakarta.annotation.PostConstruct;
import web.backend.project.features.sync.services.SyncService;
import web.backend.project.repositories.AvancementSignalementRepo;
import web.backend.project.repositories.SignalementRepository;
import web.backend.project.repositories.StatutAvancementRepo;
import web.backend.project.repositories.UtilisateurBloqueRepo;
import web.backend.project.repositories.UtilisateurRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration pour enregistrer les repositories dans le service de sync
 * 
 * IMPORTANT: Vous devez créer cette classe dans votre projet et injecter
 * vos repositories réels (SignalementRepository, StatutAvancementRepository,
 * etc.)
 */
@Configuration
public class SyncRepositoryConfig {

    private final SyncService syncService;

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

    public SyncRepositoryConfig(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostConstruct
    public void registerRepositories() {
        syncService.registerRepository("Signalement", signalementRepository);
        syncService.registerRepository("StatutAvancement", statutAvancementRepository);
        syncService.registerRepository("AvancementSignalement", avancementSignalementRepository);
        syncService.registerRepository("Utilisateur", utilisateurRepository);
        syncService.registerRepository("UtilisateurBloque", utilisateurBloqueRepository);

        System.out.println("Sync repositories registration completed");
    }
}
