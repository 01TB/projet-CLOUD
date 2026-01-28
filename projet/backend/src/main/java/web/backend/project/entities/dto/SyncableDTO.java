package web.backend.project.entities.dto;

import java.time.LocalDateTime;

/**
 * Interface de base pour tous les DTOs synchronisables
 */
public interface SyncableDTO {
    Integer getId();

    void setId(Integer id);

    Boolean getSynchro();

    void setSynchro(Boolean synchro);

    LocalDateTime getLastModified();
}
