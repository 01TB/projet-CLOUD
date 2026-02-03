package web.backend.project.features.statutavancement.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.backend.project.entities.StatutAvancement;
import web.backend.project.exceptions.ResourceNotFoundException;
import web.backend.project.repositories.StatutAvancementRepo;

import java.util.List;

@RestController
@RequestMapping("/api/statutAvancements")
public class StatutAvancementController {

    @Autowired
    private StatutAvancementRepo statutAvancementRepo;

    @GetMapping
    public ResponseEntity<List<StatutAvancement>> getAllStatuts() {
        return ResponseEntity.ok(statutAvancementRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatutAvancement> getStatutById(@PathVariable Integer id) {
        StatutAvancement statut = statutAvancementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StatutAvancement", "id", id));
        return ResponseEntity.ok(statut);
    }
}