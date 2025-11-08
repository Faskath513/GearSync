package com.gearsync.backend.service;

import com.gearsync.backend.dto.UpdateCustomerProfileDTO;
import com.gearsync.backend.dto.UserDto;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerProfileService customerProfileService;

    private User testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new User();
        testCustomer.setId(1L);
        testCustomer.setEmail("customer@example.com");
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setPhoneNumber("1234567890");
        testCustomer.setRole(Role.CUSTOMER);
        testCustomer.setIsActive(true);
        testCustomer.setCreatedAt(LocalDateTime.now());
        testCustomer.setPassword("encodedPassword");
        testCustomer.setIsFirstLogin(false);
        testCustomer.setIsPasswordChanged(true);
    }

    @Test
    void testGetMyProfile_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));

        // When
        UserDto result = customerProfileService.getMyProfile(testCustomer.getEmail());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("customer@example.com");
        assertThat(result.getName()).isEqualTo("John Doe");
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getPhoneNumber()).isEqualTo("1234567890");
        assertThat(result.getRole()).isEqualTo("CUSTOMER");
        assertThat(result.getIsActive()).isTrue();
        verify(userRepository).findByEmail(testCustomer.getEmail());
    }

    @Test
    void testGetMyProfile_UserNotFound() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> customerProfileService.getMyProfile("nonexistent@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testUpdateMyProfile_Success() {
        // Given
        UpdateCustomerProfileDTO request = new UpdateCustomerProfileDTO();
        request.setFirstName("UpdatedJohn");
        request.setLastName("UpdatedDoe");
        request.setPhoneNumber("0987654321");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(userRepository.save(any(User.class))).thenReturn(testCustomer);

        // When
        UserDto result = customerProfileService.updateMyProfile(testCustomer.getEmail(), request);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getFirstName().equals("UpdatedJohn") &&
                user.getLastName().equals("UpdatedDoe") &&
                user.getPhoneNumber().equals("0987654321")
        ));
        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("UpdatedJohn");
        assertThat(result.getLastName()).isEqualTo("UpdatedDoe");
    }

    @Test
    void testUpdateMyProfile_UserNotFound() {
        // Given
        UpdateCustomerProfileDTO request = new UpdateCustomerProfileDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("1234567890");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> customerProfileService.updateMyProfile("nonexistent@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testUpdateMyProfile_NotCustomer() {
        // Given
        testCustomer.setRole(Role.EMPLOYEE);
        
        UpdateCustomerProfileDTO request = new UpdateCustomerProfileDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("1234567890");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));

        // When/Then
        assertThatThrownBy(() -> customerProfileService.updateMyProfile(testCustomer.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only customers can update profile");
    }

    @Test
    void testUpdateMyProfile_TrimsWhitespace() {
        // Given
        UpdateCustomerProfileDTO request = new UpdateCustomerProfileDTO();
        request.setFirstName("  John  ");
        request.setLastName("  Doe  ");
        request.setPhoneNumber("  1234567890  ");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(userRepository.save(any(User.class))).thenReturn(testCustomer);

        // When
        customerProfileService.updateMyProfile(testCustomer.getEmail(), request);

        // Then
        verify(userRepository).save(argThat(user ->
                user.getFirstName().equals("John") &&
                user.getLastName().equals("Doe") &&
                user.getPhoneNumber().equals("1234567890")
        ));
    }
}
