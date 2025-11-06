package com.gearsync.backend.config;

import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void insertDefaultAdmin() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName("Admin");
            admin.setLastName("Admin");
            admin.setPhoneNumber("0710000000");
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("Default admin user created: " + adminEmail);
        } else {
            System.out.println("Admin user already exists. Skipping creation.");
        }
    }
}
