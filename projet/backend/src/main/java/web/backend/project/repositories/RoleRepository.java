package web.backend.project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import web.backend.project.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
}
