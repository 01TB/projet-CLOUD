package web.backend.project.features.users.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.backend.project.entities.Role;
import web.backend.project.repositories.RoleRepository;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Récupère tous les rôles disponibles
     * GET /api/roles
     * 
     * @return La liste de tous les rôles
     */
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        try {
            List<Role> roles = roleRepository.findAll();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
