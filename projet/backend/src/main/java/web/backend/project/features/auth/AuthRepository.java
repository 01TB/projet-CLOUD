package web.backend.project.features.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.Utilisateur;

@Repository
public interface AuthRepository extends JpaRepository<Utilisateur, Integer> {
    public Optional<Utilisateur> findByEmailAndPassword(String email, String password);
}
