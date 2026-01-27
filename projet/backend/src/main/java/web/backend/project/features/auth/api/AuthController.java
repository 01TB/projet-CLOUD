package web.backend.project.features.auth.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import web.backend.project.features.auth.api.dto.LoginCredentialsDto;
import web.backend.project.features.auth.services.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public String login(@RequestBody LoginCredentialsDto credentials) {
        // System.out.println("Login attempt for email: " + credentials.email());
        return authService.login(credentials.email(), credentials.password());
    }

    @PostMapping("/sign-in")
    public String signIn(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    

    @GetMapping()
    public String test() {
        return "Auth controller is working!";
    }
    

}
