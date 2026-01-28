package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.AvancementSignalement;

@Repository
public interface AvancementSignalementRepo extends JpaRepository<AvancementSignalement, Integer> {

}
