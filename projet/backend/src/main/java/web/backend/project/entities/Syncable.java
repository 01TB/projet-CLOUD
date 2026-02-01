package web.backend.project.entities;

import web.backend.project.entities.dto.SyncableDTO;

/*
* Interface pour les entités pouvant être synchronisées avec Firestore
*/
public interface Syncable<T extends SyncableDTO> {
    T toDTO();
}
