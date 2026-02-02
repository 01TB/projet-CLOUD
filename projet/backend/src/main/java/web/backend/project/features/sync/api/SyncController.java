package web.backend.project.features.sync.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import web.backend.project.features.sync.dto.SyncRequest;
import web.backend.project.features.sync.dto.SyncResponse;
import web.backend.project.features.sync.services.SyncService;

import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour les opérations de synchronisation
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);

    private final SyncService syncService;

    // Liste des types d'entités supportés
    private static final List<String> SUPPORTED_ENTITY_TYPES = Arrays.asList(
            "Signalement",
            "StatutAvancement",
            "AvancementSignalement",
            "Utilisateur",
            "UtilisateurBloque");

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    /**
     * Endpoint principal de synchronisation
     * POST /api/sync
     * 
     * Body exemple:
     * {
     * "entityTypes": ["Signalement", "StatutAvancement"],
     * "direction": "PUSH",
     * "forceSync": false
     * }
     */
    @PostMapping
    public ResponseEntity<SyncResponse> synchronize(@Valid @RequestBody SyncRequest request) {
        logger.info("Synchronization request received: direction={}, entities={}",
                request.getDirection(), request.getEntityTypes());

        // Validation des types d'entités
        if (request.getEntityTypes() == null || request.getEntityTypes().isEmpty()) {
            logger.warn("Sync request rejected: empty entity types");
            SyncResponse errorResponse = new SyncResponse(false, "Entity types must not be empty");
            errorResponse.addError("entityTypes: must contain at least one entity type");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Validation de la direction
        if (request.getDirection() == null) {
            logger.warn("Sync request rejected: missing direction");
            SyncResponse errorResponse = new SyncResponse(false, "Direction must be specified");
            errorResponse.addError("direction: must not be null (PUSH, PULL, or BIDIRECTIONAL)");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Validation des types d'entités supportés
        List<String> unsupportedTypes = request.getEntityTypes().stream()
                .filter(type -> !SUPPORTED_ENTITY_TYPES.contains(type))
                .collect(Collectors.toList());

        if (!unsupportedTypes.isEmpty()) {
            logger.warn("Sync request contains unsupported entity types: {}", unsupportedTypes);
            SyncResponse errorResponse = new SyncResponse(false,
                    "Unsupported entity types: " + String.join(", ", unsupportedTypes));
            errorResponse.addError("Supported types are: " + String.join(", ", SUPPORTED_ENTITY_TYPES));
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Vérification que les handlers sont enregistrés
        List<String> missingHandlers = request.getEntityTypes().stream()
                .filter(type -> !syncService.isEntityTypeRegistered(type))
                .collect(Collectors.toList());

        if (!missingHandlers.isEmpty()) {
            logger.error("Missing handlers for entity types: {}", missingHandlers);
            SyncResponse errorResponse = new SyncResponse(false,
                    "Handlers not registered for: " + String.join(", ", missingHandlers));
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }

        try {
            SyncResponse response = syncService.synchronize(request);

            if (response.getSuccess()) {
                logger.info("Synchronization completed successfully");
                return ResponseEntity.ok(response);
            } else {
                logger.error("Synchronization failed: {}", response.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            logger.error("Synchronization error", e);
            SyncResponse errorResponse = new SyncResponse(false, "Synchronization error: " + e.getMessage());
            errorResponse.addError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint simplifié pour push uniquement
     * POST /api/sync/push?entities=Signalement,StatutAvancement
     * 
     * Si entities est omis, synchronise tous les types supportés
     */
    @PostMapping("/push")
    public ResponseEntity<SyncResponse> push(
            @RequestParam(required = false) String entities,
            @RequestParam(required = false, defaultValue = "false") Boolean forceSync) {

        List<String> entityTypes = parseEntityTypes(entities);
        logger.info("Push request received for entities: {}", entityTypes);

        SyncRequest request = new SyncRequest(entityTypes, SyncRequest.SyncDirection.PUSH);
        request.setForceSync(forceSync);

        return synchronize(request);
    }

    /**
     * Endpoint simplifié pour pull uniquement
     * POST /api/sync/pull?entities=Signalement,StatutAvancement
     * 
     * Si entities est omis, synchronise tous les types supportés
     */
    @PostMapping("/pull")
    public ResponseEntity<SyncResponse> pull(
            @RequestParam(required = false) String entities) {

        List<String> entityTypes = parseEntityTypes(entities);
        logger.info("Pull request received for entities: {}", entityTypes);

        SyncRequest request = new SyncRequest(entityTypes, SyncRequest.SyncDirection.PULL);
        return synchronize(request);
    }

    /**
     * Endpoint pour synchronisation bidirectionnelle
     * POST /api/sync/bidirectional?entities=Signalement,StatutAvancement
     * 
     * Si entities est omis, synchronise tous les types supportés
     */
    @PostMapping("/bidirectional")
    public ResponseEntity<SyncResponse> bidirectional(
            @RequestParam(required = false) String entities,
            @RequestParam(required = false, defaultValue = "false") Boolean forceSync) {

        List<String> entityTypes = parseEntityTypes(entities);
        logger.info("Bidirectional sync request received for entities: {}", entityTypes);

        SyncRequest request = new SyncRequest(entityTypes, SyncRequest.SyncDirection.BIDIRECTIONAL);
        request.setForceSync(forceSync);

        return synchronize(request);
    }

    /**
     * Endpoint pour obtenir le statut de synchronisation d'une entité
     * GET /api/sync/status/{entityType}
     */
    @GetMapping("/status/{entityType}")
    public ResponseEntity<?> getSyncStatus(@PathVariable String entityType) {
        if (!SUPPORTED_ENTITY_TYPES.contains(entityType)) {
            return ResponseEntity.badRequest()
                    .body("Unsupported entity type: " + entityType);
        }

        if (!syncService.isEntityTypeRegistered(entityType)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Handler not registered for entity type: " + entityType);
        }

        return ResponseEntity.ok()
                .body("Entity type " + entityType + " is ready for synchronization");
    }

    /**
     * Endpoint pour obtenir la liste des types d'entités supportés
     * GET /api/sync/supported-entities
     */
    @GetMapping("/supported-entities")
    public ResponseEntity<List<String>> getSupportedEntities() {
        return ResponseEntity.ok(SUPPORTED_ENTITY_TYPES);
    }

    /**
     * Endpoint de health check
     * GET /api/sync/health
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse();
        response.setStatus("UP");
        response.setService("Sync Service");
        response.setSupportedEntities(SUPPORTED_ENTITY_TYPES);
        response.setRegisteredRepositories(getRegisteredRepositories());

        return ResponseEntity.ok(response);
    }

    /**
     * Parse la chaîne d'entités en liste
     */
    private List<String> parseEntityTypes(String entities) {
        if (entities != null && !entities.trim().isEmpty()) {
            return Arrays.stream(entities.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        return SUPPORTED_ENTITY_TYPES;
    }

    /**
     * Récupère la liste des repositories enregistrés
     */
    private List<String> getRegisteredRepositories() {
        return SUPPORTED_ENTITY_TYPES.stream()
                .filter(syncService::isEntityTypeRegistered)
                .collect(Collectors.toList());
    }

    /**
     * Classe pour la réponse du health check
     */
    public static class HealthResponse {
        private String status;
        private String service;
        private List<String> supportedEntities;
        private List<String> registeredRepositories;

        // Getters et Setters
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getService() {
            return service;
        }

        public void setService(String service) {
            this.service = service;
        }

        public List<String> getSupportedEntities() {
            return supportedEntities;
        }

        public void setSupportedEntities(List<String> supportedEntities) {
            this.supportedEntities = supportedEntities;
        }

        public List<String> getRegisteredRepositories() {
            return registeredRepositories;
        }

        public void setRegisteredRepositories(List<String> registeredRepositories) {
            this.registeredRepositories = registeredRepositories;
        }
    }
}