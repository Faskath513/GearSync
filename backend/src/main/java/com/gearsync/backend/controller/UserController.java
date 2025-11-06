package com.gearsync.backend.controller;

import com.gearsync.backend.dto.UpdateUserRequest;
import com.gearsync.backend.dto.UserDto;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")  // base URL for APIs
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET /api/users - returns all users in JSON
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getFirstName() + " " + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setPhoneNumber(user.getPhoneNumber());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/users/me")
    public ResponseEntity<UserDto> updateMe(Authentication authentication, @RequestBody UpdateUserRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getFirstName() + " " + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setPhoneNumber(user.getPhoneNumber());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/users/me")
    public ResponseEntity<?> deleteMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        userRepository.delete(user);
        return ResponseEntity.ok().build();
    }
}