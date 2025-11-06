package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 30;


    @Transactional
    public void changePassword(String email, ChangePasswordRequestDTO request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsPasswordChanged(true);
        user.setIsFirstLogin(false);
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepository.save(user);

        String userName = user.getFirstName() + " " + user.getLastName();
        emailService.sendPasswordChangedConfirmation(email, userName);

    }

    @Transactional
    public void initiateForgotPassword(ForgotPasswordRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String otp = generateOTP();

        user.setResetOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

        userRepository.save(user);

        String userName = user.getFirstName() + " " + user.getLastName();
        emailService.sendPasswordResetOTP(request.getEmail(), userName, otp);

    }

    @Transactional
    public VerifyOtpResponseDTO verifyOtp(VerifyOtpRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getResetOtp() == null || user.getOtpExpiry() == null) {
            throw new IllegalStateException("No OTP request found. Please request a new OTP.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            user.setResetOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            throw new IllegalStateException("OTP has expired. Please request a new one.");
        }

        if (!user.getResetOtp().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP. Please try again.");
        }

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));

        user.setResetOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);
        return new VerifyOtpResponseDTO(
                resetToken,
                "OTP verified successfully. You can now reset your password.",
                (long) RESET_TOKEN_EXPIRY_MINUTES
        );
    }


    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {

        User user = userRepository.findByPasswordResetToken(request.getResetToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);
            userRepository.save(user);
            throw new IllegalStateException("Reset token has expired. Please request a new OTP.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setIsPasswordChanged(true);
        user.setIsFirstLogin(false);

        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);

        userRepository.save(user);

        String userName = user.getFirstName() + " " + user.getLastName();
        emailService.sendPasswordChangedConfirmation(user.getEmail(), userName);

    }


    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        password.append(chars.charAt(random.nextInt(26)));
        password.append(chars.charAt(26 + random.nextInt(26)));
        password.append(chars.charAt(52 + random.nextInt(10)));
        password.append(chars.charAt(62 + random.nextInt(7)));

        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}