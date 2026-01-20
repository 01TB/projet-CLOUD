package web.backend.project.api;

import org.springframework.web.bind.annotation.RestController;

import web.backend.project.api.dto.AuthDto;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/auth")
public class Authentication {

    @PostMapping("/login")
    public String postMethodName(@RequestBody AuthDto authDto) {

        return "Login successful";
    }
    

}
