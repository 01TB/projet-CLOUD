package web.backend.project.features.entreprise.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.backend.project.entities.Entreprise;
import web.backend.project.exceptions.ResourceNotFoundException;
import web.backend.project.repositories.EntrepriseRepository;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {

	@Autowired
	private EntrepriseRepository entrepriseRepository;

	@GetMapping
	public ResponseEntity<List<Entreprise>> getAllEntreprises() {
		return ResponseEntity.ok(entrepriseRepository.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Entreprise> getEntrepriseById(@PathVariable Integer id) {
		Entreprise e = entrepriseRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Entreprise", "id", id));
		return ResponseEntity.ok(e);
	}
}