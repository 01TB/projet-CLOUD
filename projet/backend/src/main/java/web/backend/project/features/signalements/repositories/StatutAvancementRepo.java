package web.backend.project.features.signalements.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.StatutAvancement;

@Repository
public interface StatutAvancementRepo extends JpaRepository<StatutAvancement, Integer> {

}
