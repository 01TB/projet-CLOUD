package web.backend.project.features.auth.api.dto;

public record LoginCredentialsDto(
        String email,
        String password) {
}
