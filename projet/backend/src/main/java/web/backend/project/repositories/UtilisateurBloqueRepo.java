package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.UtilisateurBloque;

@Repository
public interface UtilisateurBloqueRepo extends JpaRepository<UtilisateurBloque, Integer> {

}
