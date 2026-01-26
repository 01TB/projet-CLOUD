package web.backend.project.features.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import web.backend.project.entities.Utilisateur;
import web.backend.project.features.auth.dto.AuthenticatedUserDto;

@Service
public class AuthService {
    @Autowired
    AuthRepository authRepository;


    public AuthenticatedUserDto login(String email, String password) {
        Utilisateur user = authRepository.findByEmailAndPassword(email, password)
                .orElse(null);


        return new AuthenticatedUserDto(user.getId(), user.getEmail(), user.getRole().getNom());
    }
}
