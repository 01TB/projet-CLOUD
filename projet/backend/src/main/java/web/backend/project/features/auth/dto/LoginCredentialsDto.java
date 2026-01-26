package web.backend.project.features.auth.dto;

public record LoginCredentialsDto(
        String email,
        String password) {
}
