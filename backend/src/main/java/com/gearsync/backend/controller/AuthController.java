package com.gearsync.backend.controller;
import com.gearsync.backend.dto.LoginRequest;
import com.gearsync.backend.dto.UserDto;
import com.gearsync.backend.dto.UserRegisterDTO;
import com.gearsync.backend.model.User;
import com.gearsync.backend.security.JwtUtil;
import com.gearsync.backend.service.AuthService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/test")
    public String test() {
        return "AuthController is working!";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterDTO userRegisterDTO) {
        if (authService.isEmailRegistered(userRegisterDTO.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User saved = authService.register(userRegisterDTO);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    boolean isAuthenticated = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
    if (!isAuthenticated) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
    User user = authService.findByEmail(loginRequest.getEmail());
    String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
    return ResponseEntity.ok(Map.of(
                "token", jwtToken,
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        String email = authentication.getName();
        System.out.println(authentication.getAuthorities());
        User user = authService.findByEmail(email);
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getFirstName() + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(String.valueOf(user.getRole()));
        dto.setPhoneNumber(user.getPhoneNumber());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.findByEmail(email);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}