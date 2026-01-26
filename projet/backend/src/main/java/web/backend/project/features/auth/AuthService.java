package web.backend.project.features.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import web.backend.project.entities.Utilisateur;
import web.backend.project.features.auth.dto.AuthenticatedUserDto;
import web.backend.project.security.CustomUserDetails;
import web.backend.project.security.JwtService;

@Service
public class AuthService {
    @Autowired
    AuthRepository authRepository;
    @Autowired
    JwtService jwtService;

    public AuthenticatedUserDto login(String email, String password) {
        Utilisateur user = authRepository.findByEmailAndPassword(email, password)
                .orElse(null);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        System.out.println("Generating token for user: " + user.getEmail());
        String token = jwtService.generateToken(userDetails);


        return new AuthenticatedUserDto(user.getId(), user.getEmail(), user.getRole().getNom(), token);
    }
}
