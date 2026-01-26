package web.backend.project.features.auth.dto;

public record AuthenticatedUserDto(
        Integer id,
        String email,
        String role
) {
    
}
