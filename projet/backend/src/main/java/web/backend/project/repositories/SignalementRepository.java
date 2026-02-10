package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.Signalement;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Integer> {

    // Recherche par entreprise
    List<Signalement> findByEntrepriseId(Integer entrepriseId);

    // Recherche par utilisateur créateur
    List<Signalement> findByUtilisateurCreateurId(Integer utilisateurId);

    // Recherche par statut de synchronisation
    List<Signalement> findBySynchro(Boolean synchro);

    // Recherche par budget minimum
    List<Signalement> findByBudgetGreaterThanEqual(Float budgetMin);

    // Recherche par surface minimum
    List<Signalement> findBySurfaceGreaterThanEqual(Double surfaceMin);

    // Recherche par entreprise et synchro
    List<Signalement> findByEntrepriseIdAndSynchro(Integer entrepriseId, Boolean synchro);

    // Recherche avec budget entre deux valeurs
    @Query("SELECT s FROM Signalement s WHERE s.budget BETWEEN :minBudget AND :maxBudget")
    List<Signalement> findByBudgetBetween(@Param("minBudget") Float minBudget,
            @Param("maxBudget") Float maxBudget);

    // Recherche avec surface entre deux valeurs
    @Query("SELECT s FROM Signalement s WHERE s.surface BETWEEN :minSurface AND :maxSurface")
    List<Signalement> findBySurfaceBetween(@Param("minSurface") Double minSurface,
            @Param("maxSurface") Double maxSurface);

    // Recherche par niveaux ID avec statut NOUVEAUX uniquement
    // Inclut les signalements sans aucun avancement (implicitement NOUVEAUX)
    // et ceux dont aucun avancement n'a un statut différent de NOUVEAUX
    @Query("SELECT s FROM Signalement s WHERE s.niveaux.id = :niveauxId " +
           "AND NOT EXISTS (" +
           "  SELECT a FROM AvancementSignalement a WHERE a.signalement = s " +
           "  AND a.statutAvancement.nom <> 'NOUVEAUX'" +
           ")")
    List<Signalement> findByNiveauxIdAndStatusNouveaux(@Param("niveauxId") Integer niveauxId);

    // Recherche par niveaux ID
    List<Signalement> findByNiveauxId(Integer niveauxId);
}