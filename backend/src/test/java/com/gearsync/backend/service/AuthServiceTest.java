package com.gearsync.backend.service;

import com.gearsync.backend.dto.UserRegisterDTO;
import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UserRegisterDTO registerDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword123");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(Role.CUSTOMER);
        testUser.setPhoneNumber("1234567890");

        registerDTO = new UserRegisterDTO();
        registerDTO.setEmail("newuser@example.com");
        registerDTO.setPassword("Password123!");
        registerDTO.setFirstName("Jane");
        registerDTO.setLastName("Smith");
        registerDTO.setPhoneNumber("0987654321");
    }

    @Test
    void testIsEmailRegistered_EmailExists() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        boolean result = authService.isEmailRegistered("test@example.com");

        // Then
        assertThat(result).isTrue();
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void testIsEmailRegistered_EmailDoesNotExist() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When
        boolean result = authService.isEmailRegistered("nonexistent@example.com");

        // Then
        assertThat(result).isFalse();
        verify(userRepository).findByEmail("nonexistent@example.com");
    }

    @Test
    void testRegister_Success() {
        // Given
        User newUser = new User();
        newUser.setEmail(registerDTO.getEmail());
        newUser.setFirstName(registerDTO.getFirstName());
        newUser.setLastName(registerDTO.getLastName());
        newUser.setPhoneNumber(registerDTO.getPhoneNumber());

        when(modelMapper.map(registerDTO, User.class)).thenReturn(newUser);
        when(passwordEncoder.encode(registerDTO.getPassword())).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // When
        User result = authService.register(registerDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(registerDTO.getEmail());
        verify(passwordEncoder).encode(registerDTO.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_PasswordIsEncoded() {
        // Given
        User newUser = new User();
        when(modelMapper.map(registerDTO, User.class)).thenReturn(newUser);
        when(passwordEncoder.encode(registerDTO.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        // When
        authService.register(registerDTO);

        // Then
        verify(passwordEncoder).encode(registerDTO.getPassword());
        verify(userRepository).save(argThat(user -> 
            user.getPassword().equals("encodedPassword")
        ));
    }

    @Test
    void testAuthenticate_Success() {
        // Given
        String rawPassword = "Password123!";
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(rawPassword, testUser.getPassword())).thenReturn(true);

        // When
        boolean result = authService.authenticate(testUser.getEmail(), rawPassword);

        // Then
        assertThat(result).isTrue();
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(passwordEncoder).matches(rawPassword, testUser.getPassword());
    }

    @Test
    void testAuthenticate_WrongPassword() {
        // Given
        String wrongPassword = "WrongPassword123!";
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(wrongPassword, testUser.getPassword())).thenReturn(false);

        // When
        boolean result = authService.authenticate(testUser.getEmail(), wrongPassword);

        // Then
        assertThat(result).isFalse();
        verify(passwordEncoder).matches(wrongPassword, testUser.getPassword());
    }

    @Test
    void testAuthenticate_UserNotFound() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When
        boolean result = authService.authenticate(email, "anyPassword");

        // Then
        assertThat(result).isFalse();
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testFindByEmail_Success() {
        // Given
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // When
        User result = authService.findByEmail(testUser.getEmail());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(result.getId()).isEqualTo(testUser.getId());
        verify(userRepository).findByEmail(testUser.getEmail());
    }

    @Test
    void testFindByEmail_UserNotFound() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> authService.findByEmail(email))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found with email: " + email);
        verify(userRepository).findByEmail(email);
    }

    @Test
    void testAuthenticate_EmptyPassword() {
        // Given
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("", testUser.getPassword())).thenReturn(false);

        // When
        boolean result = authService.authenticate(testUser.getEmail(), "");

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void testRegister_MapperCalledCorrectly() {
        // Given
        User mappedUser = new User();
        when(modelMapper.map(registerDTO, User.class)).thenReturn(mappedUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(mappedUser);

        // When
        authService.register(registerDTO);

        // Then
        verify(modelMapper).map(registerDTO, User.class);
    }
}
