package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.SignalementNiveaux;

@Repository
public interface SignalisationNiveauxRepo extends JpaRepository<SignalementNiveaux, Integer> {

}
