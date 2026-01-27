package web.backend.project.features.signalements.api;

import jakarta.validation.Valid;
import web.backend.project.features.signalements.api.dto.SignalementDTO;
import web.backend.project.features.signalements.api.dto.SignalementResponseDTO;
import web.backend.project.features.signalements.services.SignalementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    @Autowired
    private SignalementService signalementService;


    /**
     * CREATE - Créer un nouveau signalement
     * POST /api/signalements
     */
    @PostMapping
    public ResponseEntity<SignalementResponseDTO> createSignalement(
            @Valid @RequestBody SignalementDTO signalementDTO) {
        SignalementResponseDTO created = signalementService.createSignalement(signalementDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * READ - Récupérer tous les signalements
     * GET /api/signalements
     */
    @GetMapping
    public ResponseEntity<List<SignalementResponseDTO>> getAllSignalements() {
        List<SignalementResponseDTO> signalements = signalementService.getAllSignalements();
        return ResponseEntity.ok(signalements);
    }

    /**
     * READ - Récupérer un signalement par son ID
     * GET /api/signalements/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> getSignalementById(@PathVariable Integer id) {
        SignalementResponseDTO signalement = signalementService.getSignalementById(id);
        return ResponseEntity.ok(signalement);
    }

    /**
     * UPDATE - Mettre à jour un signalement
     * PUT /api/signalements/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> updateSignalement(
            @PathVariable Integer id,
            @Valid @RequestBody SignalementDTO signalementDTO) {
        SignalementResponseDTO updated = signalementService.updateSignalement(id, signalementDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE - Supprimer un signalement
     * DELETE /api/signalements/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSignalement(@PathVariable Integer id) {
        signalementService.deleteSignalement(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Signalement supprimé avec succès");
        response.put("id", id.toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer les signalements par entreprise
     * GET /api/signalements/entreprise/{entrepriseId}
     */
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByEntreprise(
            @PathVariable Integer entrepriseId) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsByEntreprise(entrepriseId);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements par utilisateur créateur
     * GET /api/signalements/utilisateur/{utilisateurId}
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByUtilisateur(
            @PathVariable Integer utilisateurId) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsByUtilisateur(utilisateurId);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements par statut de synchronisation
     * GET /api/signalements/synchro/{synchro}
     */
    @GetMapping("/synchro/{synchro}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsBySynchro(
            @PathVariable Boolean synchro) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsBySynchro(synchro);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements avec un budget minimum
     * GET /api/signalements/budget/min/{budgetMin}
     */
    @GetMapping("/budget/min/{budgetMin}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByBudgetMin(
            @PathVariable Integer budgetMin) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsByBudgetMin(budgetMin);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements avec une surface minimum
     * GET /api/signalements/surface/min/{surfaceMin}
     */
    @GetMapping("/surface/min/{surfaceMin}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsBySurfaceMin(
            @PathVariable Double surfaceMin) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsBySurfaceMin(surfaceMin);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements par plage de budget
     * GET /api/signalements/budget/range?min=1000&max=5000
     */
    @GetMapping("/budget/range")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByBudgetRange(
            @RequestParam Integer min,
            @RequestParam Integer max) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsByBudgetRange(min, max);
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements par plage de surface
     * GET /api/signalements/surface/range?min=100.0&max=500.0
     */
    @GetMapping("/surface/range")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsBySurfaceRange(
            @RequestParam Double min,
            @RequestParam Double max) {
        List<SignalementResponseDTO> signalements = signalementService.getSignalementsBySurfaceRange(min, max);
        return ResponseEntity.ok(signalements);
    }

    /**
     * PATCH - Mettre à jour uniquement le statut de synchronisation
     * PATCH /api/signalements/{id}/synchro
     */
    @PatchMapping("/{id}/synchro")
    public ResponseEntity<SignalementResponseDTO> updateSynchroStatus(
            @PathVariable Integer id,
            @RequestParam Boolean synchro) {
        SignalementResponseDTO updated = signalementService.updateSynchroStatus(id, synchro);
        return ResponseEntity.ok(updated);
    }
}