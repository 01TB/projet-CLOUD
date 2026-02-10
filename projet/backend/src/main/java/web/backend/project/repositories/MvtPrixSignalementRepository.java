package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.MvtPrixSignalement;

import java.util.Optional;

@Repository
public interface MvtPrixSignalementRepository extends JpaRepository<MvtPrixSignalement, Integer> {

    /**
     * Récupère le prix actuel (dernier mouvement de prix par date de création)
     */
    @Query("SELECT m FROM MvtPrixSignalement m ORDER BY m.dateCreation DESC, m.id DESC LIMIT 1")
    Optional<MvtPrixSignalement> findLatestPrix();
}
