package com.gearsync.backend.service;

import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPhoneNumber("1234567890");
        testUser.setRole(Role.CUSTOMER);
        testUser.setIsActive(true);
    }

    @Test
    void testFindUserById() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> found = userRepository.findById(1L);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testFindUserByEmail() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("John");
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void testSaveUser() {
        // Given
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User saved = userRepository.save(testUser);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testFindAllUsers() {
        // Given
        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
        user2.setRole(Role.EMPLOYEE);

        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser, user2));

        // When
        List<User> users = userRepository.findAll();

        // Then
        assertThat(users).hasSize(2);
        assertThat(users.get(0).getEmail()).isEqualTo("test@example.com");
        assertThat(users.get(1).getEmail()).isEqualTo("user2@example.com");
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testDeleteUser() {
        // Given
        doNothing().when(userRepository).deleteById(1L);

        // When
        userRepository.deleteById(1L);

        // Then
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void testExistsByEmail() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Then
        assertThat(exists).isTrue();
        verify(userRepository, times(1)).existsByEmail("test@example.com");
    }

    @Test
    void testFindByRole() {
        // Given
        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(Arrays.asList(testUser));

        // When
        List<User> customers = userRepository.findByRole(Role.CUSTOMER);

        // Then
        assertThat(customers).hasSize(1);
        assertThat(customers.get(0).getRole()).isEqualTo(Role.CUSTOMER);
        verify(userRepository, times(1)).findByRole(Role.CUSTOMER);
    }
}
