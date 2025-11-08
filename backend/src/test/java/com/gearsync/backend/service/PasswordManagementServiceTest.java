package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordManagementService passwordManagementService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedOldPassword");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setIsFirstLogin(true);
        testUser.setIsPasswordChanged(false);
    }

    @Test
    void testChangePassword_Success() {
        // Given
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setOldPassword("OldPassword123!");
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.matches(request.getNewPassword(), testUser.getPassword())).thenReturn(false);
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendPasswordChangedConfirmation(anyString(), anyString());

        // When
        passwordManagementService.changePassword(testUser.getEmail(), request);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getIsPasswordChanged() &&
                !user.getIsFirstLogin() &&
                user.getPasswordChangedAt() != null
        ));
        verify(emailService).sendPasswordChangedConfirmation(eq(testUser.getEmail()), anyString());
    }

    @Test
    void testChangePassword_UserNotFound() {
        // Given
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.changePassword("unknown@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testChangePassword_IncorrectOldPassword() {
        // Given
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setOldPassword("WrongPassword123!");
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.changePassword(testUser.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Current password is incorrect");
    }

    @Test
    void testChangePassword_NewPasswordSameAsOld() {
        // Given
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setOldPassword("OldPassword123!");
        request.setNewPassword("OldPassword123!");
        request.setConfirmPassword("OldPassword123!");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.matches(request.getNewPassword(), testUser.getPassword())).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.changePassword(testUser.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("New password must be different from current password");
    }

    @Test
    void testChangePassword_PasswordsDoNotMatch() {
        // Given
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setOldPassword("OldPassword123!");
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("DifferentPassword123!");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.matches(request.getNewPassword(), testUser.getPassword())).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.changePassword(testUser.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("New passwords do not match");
    }

    @Test
    void testInitiateForgotPassword_Success() {
        // Given
        ForgotPasswordRequestDTO request = new ForgotPasswordRequestDTO();
        request.setEmail(testUser.getEmail());

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendPasswordResetOTP(anyString(), anyString(), anyString());

        // When
        passwordManagementService.initiateForgotPassword(request);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getResetOtp() != null &&
                user.getResetOtp().length() == 6 &&
                user.getOtpExpiry() != null
        ));
        verify(emailService).sendPasswordResetOTP(eq(testUser.getEmail()), anyString(), anyString());
    }

    @Test
    void testInitiateForgotPassword_UserNotFound() {
        // Given
        ForgotPasswordRequestDTO request = new ForgotPasswordRequestDTO();
        request.setEmail("nonexistent@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.initiateForgotPassword(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with email");
    }

    @Test
    void testVerifyOtp_Success() {
        // Given
        String otp = "123456";
        testUser.setResetOtp(otp);
        testUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        VerifyOtpRequestDTO request = new VerifyOtpRequestDTO();
        request.setEmail(testUser.getEmail());
        request.setOtp(otp);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        VerifyOtpResponseDTO response = passwordManagementService.verifyOtp(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getResetToken()).isNotNull();
        assertThat(response.getMessage()).contains("OTP verified successfully");
        verify(userRepository).save(argThat(user ->
                user.getPasswordResetToken() != null &&
                user.getPasswordResetTokenExpiry() != null &&
                user.getResetOtp() == null &&
                user.getOtpExpiry() == null
        ));
    }

    @Test
    void testVerifyOtp_NoOtpRequest() {
        // Given
        VerifyOtpRequestDTO request = new VerifyOtpRequestDTO();
        request.setEmail(testUser.getEmail());
        request.setOtp("123456");

        testUser.setResetOtp(null);
        testUser.setOtpExpiry(null);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.verifyOtp(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No OTP request found");
    }

    @Test
    void testVerifyOtp_ExpiredOtp() {
        // Given
        testUser.setResetOtp("123456");
        testUser.setOtpExpiry(LocalDateTime.now().minusMinutes(5)); // Expired

        VerifyOtpRequestDTO request = new VerifyOtpRequestDTO();
        request.setEmail(testUser.getEmail());
        request.setOtp("123456");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.verifyOtp(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("OTP has expired");
    }

    @Test
    void testVerifyOtp_InvalidOtp() {
        // Given
        testUser.setResetOtp("123456");
        testUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        VerifyOtpRequestDTO request = new VerifyOtpRequestDTO();
        request.setEmail(testUser.getEmail());
        request.setOtp("654321"); // Wrong OTP

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.verifyOtp(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    void testResetPassword_Success() {
        // Given
        String resetToken = "valid-reset-token";
        testUser.setPasswordResetToken(resetToken);
        testUser.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        ResetPasswordRequestDTO request = new ResetPasswordRequestDTO();
        request.setResetToken(resetToken);
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getNewPassword(), testUser.getPassword())).thenReturn(false);
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendPasswordChangedConfirmation(anyString(), anyString());

        // When
        passwordManagementService.resetPassword(request);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getIsPasswordChanged() &&
                !user.getIsFirstLogin() &&
                user.getPasswordResetToken() == null &&
                user.getPasswordResetTokenExpiry() == null
        ));
        verify(emailService).sendPasswordChangedConfirmation(eq(testUser.getEmail()), anyString());
    }

    @Test
    void testResetPassword_InvalidToken() {
        // Given
        ResetPasswordRequestDTO request = new ResetPasswordRequestDTO();
        request.setResetToken("invalid-token");

        when(userRepository.findByPasswordResetToken(request.getResetToken())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired reset token");
    }

    @Test
    void testResetPassword_ExpiredToken() {
        // Given
        String resetToken = "expired-token";
        testUser.setPasswordResetToken(resetToken);
        testUser.setPasswordResetTokenExpiry(LocalDateTime.now().minusMinutes(5)); // Expired

        ResetPasswordRequestDTO request = new ResetPasswordRequestDTO();
        request.setResetToken(resetToken);
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.resetPassword(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Reset token has expired");
    }

    @Test
    void testResetPassword_PasswordsDoNotMatch() {
        // Given
        String resetToken = "valid-token";
        testUser.setPasswordResetToken(resetToken);
        testUser.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        ResetPasswordRequestDTO request = new ResetPasswordRequestDTO();
        request.setResetToken(resetToken);
        request.setNewPassword("NewPassword123!");
        request.setConfirmPassword("DifferentPassword123!");

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(testUser));

        // When/Then
        assertThatThrownBy(() -> passwordManagementService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Passwords do not match");
    }

    @Test
    void testGenerateTemporaryPassword() {
        // When
        String password1 = passwordManagementService.generateTemporaryPassword();
        String password2 = passwordManagementService.generateTemporaryPassword();

        // Then
        assertThat(password1).isNotNull();
        assertThat(password1).hasSize(12);
        assertThat(password2).isNotNull();
        assertThat(password1).isNotEqualTo(password2); // Should generate different passwords
        
        // Verify password contains required characters
        assertThat(password1).matches(".*[A-Z].*"); // Has uppercase
        assertThat(password1).matches(".*[a-z].*"); // Has lowercase
        assertThat(password1).matches(".*[0-9].*"); // Has digit
        assertThat(password1).matches(".*[@$!%*?&].*"); // Has special char
    }
}
