package web.backend.project.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.AvancementSignalement;
import web.backend.project.entities.Signalement;

@Repository
public interface AvancementSignalementRepo extends JpaRepository<AvancementSignalement, Integer> {
    
    /**
     * Récupère tous les avancements d'un signalement, triés par date de modification décroissante
     */
    List<AvancementSignalement> findBySignalementOrderByDateModificationDesc(Signalement signalement);
    
    /**
     * Récupère tous les avancements d'un signalement par ID, triés par date de modification décroissante
     */
    List<AvancementSignalement> findBySignalement_IdOrderByDateModificationDesc(Integer signalementId);
}
