package com.gearsync.backend.service;
import com.gearsync.backend.dto.UserRegisterDTO;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    private final Map<String, String> emailToOtp = new ConcurrentHashMap<>();
    private final Map<String, Long> emailToOtpExpiry = new ConcurrentHashMap<>();
    private static final long OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

    public boolean isEmailRegistered(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User register(UserRegisterDTO userRegisterDTO) {
        User user = modelMapper.map(userRegisterDTO, User.class);
        user.setPassword(passwordEncoder.encode(userRegisterDTO.getPassword()));
        return userRepository.save(user);
    }

    public boolean authenticate(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public void updatePassword(User user, String newRawPassword) {
        user.setPassword(passwordEncoder.encode(newRawPassword));
        userRepository.save(user);
    }

    public String generateAndStoreOtp(String email) {
        // ensure user exists (avoid enumeration in production by responding same regardless)
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        emailToOtp.put(email, otp);
        emailToOtpExpiry.put(email, Instant.now().toEpochMilli() + OTP_TTL_MS);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String stored = emailToOtp.get(email);
        Long exp = emailToOtpExpiry.get(email);
        if (stored == null || exp == null) return false;
        if (Instant.now().toEpochMilli() > exp) return false;
        return stored.equals(otp);
    }

    public void consumeOtp(String email) {
        emailToOtp.remove(email);
        emailToOtpExpiry.remove(email);
    }
}