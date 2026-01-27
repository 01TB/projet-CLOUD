package web.backend.project.features.signalements.repositories;

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
    List<Signalement> findByBudgetGreaterThanEqual(Integer budgetMin);
    
    // Recherche par surface minimum
    List<Signalement> findBySurfaceGreaterThanEqual(Double surfaceMin);
    
    // Recherche par entreprise et synchro
    List<Signalement> findByEntrepriseIdAndSynchro(Integer entrepriseId, Boolean synchro);
    
    // Recherche avec budget entre deux valeurs
    @Query("SELECT s FROM Signalement s WHERE s.budget BETWEEN :minBudget AND :maxBudget")
    List<Signalement> findByBudgetBetween(@Param("minBudget") Integer minBudget, 
                                          @Param("maxBudget") Integer maxBudget);
    
    // Recherche avec surface entre deux valeurs
    @Query("SELECT s FROM Signalement s WHERE s.surface BETWEEN :minSurface AND :maxSurface")
    List<Signalement> findBySurfaceBetween(@Param("minSurface") Double minSurface, 
                                           @Param("maxSurface") Double maxSurface);
}