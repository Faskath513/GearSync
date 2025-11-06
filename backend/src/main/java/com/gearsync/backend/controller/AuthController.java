package com.gearsync.backend.controller;
import com.gearsync.backend.dto.LoginRequest;
import com.gearsync.backend.dto.UserDto;
import com.gearsync.backend.dto.UserRegisterDTO;
import com.gearsync.backend.dto.ChangePasswordRequest;
import com.gearsync.backend.dto.ForgotPasswordRequest;
import com.gearsync.backend.dto.VerifyOtpRequest;
import com.gearsync.backend.dto.ResetPasswordRequest;
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
        dto.setName(user.getFirstName() + " " + user.getLastName());
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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        User user = authService.findByEmail(email);
        boolean matches = authService.authenticate(user.getEmail(), request.getCurrentPassword());
        if (!matches) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
        }
        authService.updatePassword(user, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String otp = authService.generateAndStoreOtp(request.getEmail());
            // TODO: send OTP via email; for now return a generic message
            return ResponseEntity.ok(Map.of("message", "If the email exists, an OTP has been sent."));
        } catch (RuntimeException e) {
            // Avoid leaking existence of emails. Return same message.
            return ResponseEntity.ok(Map.of("message", "If the email exists, an OTP has been sent."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean ok = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid or expired OTP"));
        }
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean ok = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid or expired OTP"));
        }
        User user = authService.findByEmail(request.getEmail());
        authService.updatePassword(user, request.getNewPassword());
        authService.consumeOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}