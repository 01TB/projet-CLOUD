package web.backend.project.features.users;

import org.springframework.data.jpa.repository.JpaRepository;

import web.backend.project.entities.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    java.util.Optional<Utilisateur> findByEmail(String email);
    
}
