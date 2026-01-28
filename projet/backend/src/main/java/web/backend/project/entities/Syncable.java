package web.backend.project.entities;

import web.backend.project.entities.dto.SyncableDTO;

public interface Syncable<T extends SyncableDTO> {
    T toDTO();
}
