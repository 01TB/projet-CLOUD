package web.backend.project.features.users.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.backend.project.entities.Utilisateur;
import web.backend.project.entities.UtilisateurBloque;
import web.backend.project.entities.dto.UtilisateurDTO;
import web.backend.project.entities.dto.UtilisateurResponseDTO;
import web.backend.project.features.users.services.UtilisateurService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    /**
     * Crée un nouvel utilisateur
     * POST /api/utilisateurs
     * 
     * @param utilisateurDTO Les données de l'utilisateur à créer
     * @return L'utilisateur créé avec statut 201
     */
    @PostMapping
    public ResponseEntity<?> creerUtilisateur(@RequestBody UtilisateurDTO utilisateurDTO) {
        try {
            System.out.println(">>> debut creation entite");
            Utilisateur utilisateur = utilisateurService.creerUtilisateur(utilisateurDTO);
            UtilisateurResponseDTO response = utilisateurService.toResponseDTO(utilisateur);
            System.out.println("<<< creation entite reussie");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la création de l'utilisateur: " + e.getMessage()));
        }
    }

    /**
     * Récupère tous les utilisateurs
     * GET /api/utilisateurs
     * 
     * @return La liste de tous les utilisateurs
     */
    @GetMapping
    public ResponseEntity<List<UtilisateurResponseDTO>> getAllUtilisateurs() {
        try {
            List<UtilisateurResponseDTO> utilisateurs = utilisateurService.getAllUtilisateursWithBlockInfo();
            return ResponseEntity.ok(utilisateurs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère un utilisateur par son ID
     * GET /api/utilisateurs/{id}
     * 
     * @param id L'ID de l'utilisateur
     * @return L'utilisateur trouvé
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUtilisateurById(@PathVariable Integer id) {
        try {
            UtilisateurResponseDTO utilisateur = utilisateurService.getUtilisateurWithBlockInfo(id);
            return ResponseEntity.ok(utilisateur);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération de l'utilisateur"));
        }
    }

    /**
     * Recherche un utilisateur par email
     * GET /api/utilisateurs/search?email={email}
     * 
     * @param email L'email de l'utilisateur à rechercher
     * @return L'utilisateur trouvé
     */
    @GetMapping("/search")
    public ResponseEntity<?> getUtilisateurByEmail(@RequestParam String email) {
        try {
            Utilisateur utilisateur = utilisateurService.getUtilisateurByEmail(email);
            return ResponseEntity.ok(utilisateur.toDTO());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la recherche de l'utilisateur"));
        }
    }

    /**
     * Modifie un utilisateur existant
     * PUT /api/utilisateurs/{id}
     * 
     * @param id             L'ID de l'utilisateur à modifier
     * @param utilisateurDTO Les nouvelles données de l'utilisateur
     * @return L'utilisateur modifié
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modifierUtilisateur(@PathVariable Integer id,
            @RequestBody UtilisateurDTO utilisateurDTO) {
        try {
            Utilisateur utilisateur = utilisateurService.modifierUtilisateur(id, utilisateurDTO);
            UtilisateurResponseDTO response = utilisateurService.toResponseDTO(utilisateur);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la modification de l'utilisateur"));
        }
    }

    /**
     * Supprime un utilisateur
     * DELETE /api/utilisateurs/{id}
     * 
     * @param id L'ID de l'utilisateur à supprimer
     * @return Confirmation de suppression
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerUtilisateur(@PathVariable Integer id) {
        try {
            utilisateurService.supprimerUtilisateur(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la suppression de l'utilisateur"));
        }
    }

    /**
     * Bloque un utilisateur
     * POST /api/utilisateurs/{id}/bloquer
     * 
     * @param id L'ID de l'utilisateur à bloquer
     * @return Confirmation du blocage
     */
    @PostMapping("/{id}/bloquer")
    public ResponseEntity<?> bloquerUtilisateur(@PathVariable Integer id) {
        try {
            UtilisateurBloque utilisateurBloque = utilisateurService.bloquerUtilisateur(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur bloqué avec succès");
            response.put("dateBlocage", utilisateurBloque.getDateBlocage());
            response.put("utilisateurId", id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors du blocage de l'utilisateur"));
        }
    }

    /**
     * Débloque un utilisateur
     * DELETE /api/utilisateurs/{id}/bloquer
     * 
     * @param id L'ID de l'utilisateur à débloquer
     * @return Confirmation du déblocage
     */
    @DeleteMapping("/{id}/bloquer")
    public ResponseEntity<?> debloquerUtilisateur(@PathVariable Integer id) {
        try {
            utilisateurService.debloquerUtilisateur(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur débloqué avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors du déblocage de l'utilisateur"));
        }
    }

    /**
     * Vérifie si un utilisateur est bloqué
     * GET /api/utilisateurs/{id}/est-bloque
     * 
     * @param id L'ID de l'utilisateur
     * @return Le statut de blocage de l'utilisateur
     */
    @GetMapping("/{id}/est-bloque")
    public ResponseEntity<?> estUtilisateurBloque(@PathVariable Integer id) {
        try {
            boolean estBloque = utilisateurService.estUtilisateurBloque(id);
            Map<String, Object> response = new HashMap<>();
            response.put("utilisateurId", id);
            response.put("estBloque", estBloque);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la vérification du statut de blocage"));
        }
    }
}
