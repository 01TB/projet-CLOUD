package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.Parametre;

@Repository
public interface ParametreRepository extends JpaRepository<Parametre, Integer> {

}
