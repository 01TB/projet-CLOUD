package web.backend.project.entities;

import web.backend.project.entities.dto.FirebaseSerializable;

/**
 * Interface enrichie pour les entités synchronisables
 * Ajoute la capacité de mise à jour depuis un DTO (bidirectionnel)
 * 
 * @param <D> Le type du DTO associé
 */
public interface SyncableEntity<D extends FirebaseSerializable> {

    /**
     * Convertit cette entité en son DTO associé
     */
    D toDTO();

    /**
     * Met à jour cette entité depuis les données du DTO
     * Note: Les relations (ManyToOne, etc.) doivent être résolues séparément
     * 
     * @param dto Le DTO contenant les nouvelles données
     */
    void updateFromDTO(D dto);

    /**
     * Retourne le flag de synchronisation
     */
    Boolean getSynchro();

    /**
     * Définit le flag de synchronisation
     */
    void setSynchro(Boolean synchro);

    /**
     * Retourne l'ID de l'entité
     */
    Integer getId();

    /**
     * Définit l'ID de l'entité
     */
    void setId(Integer id);
}
