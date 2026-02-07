package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.UtilisateurBloque;
import java.util.Optional;

@Repository
public interface UtilisateurBloqueRepo extends JpaRepository<UtilisateurBloque, Integer> {

    Optional<UtilisateurBloque> findByUtilisateurId(Integer utilisateurId);

    boolean existsByUtilisateurId(Integer utilisateurId);

    void deleteByUtilisateurId(Integer utilisateurId);
}
