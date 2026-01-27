package web.backend.project.features.auth.api.dto;

public record AuthenticatedUserDto(
                Integer id,
                String email,
                String role,
                String token) {

}
