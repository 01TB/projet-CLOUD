package web.backend.project.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import web.backend.project.entities.SignalementPhoto;

@Repository
public interface SignalementPhotoRepo extends JpaRepository<SignalementPhoto, Integer> {

    List<SignalementPhoto> findBySignalement_Id(Integer signalementId);
}
