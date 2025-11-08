package com.gearsync.backend.service;

import com.gearsync.backend.dto.VehicleRequestDTO;
import com.gearsync.backend.dto.VehicleResponseDTO;
import com.gearsync.backend.exception.UserNotFoundException;
import com.gearsync.backend.exception.VehicleAlreadyExistsException;
import com.gearsync.backend.exception.VehicleNotFoundException;
import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import com.gearsync.backend.model.Vehicle;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VehicleService
 */
@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private VehicleService vehicleService;

    private User testUser;
    private Vehicle testVehicle;
    private VehicleRequestDTO vehicleRequestDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("customer@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(Role.CUSTOMER);

        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2020);
        testVehicle.setRegistrationNumber("ABC-123");
        testVehicle.setVinNumber("1HGBH41JXMN109186");
        testVehicle.setColor("Blue");
        testVehicle.setMileage(50000);
        testVehicle.setOwner(testUser);

        vehicleRequestDTO = new VehicleRequestDTO();
        vehicleRequestDTO.setMake("Honda");
        vehicleRequestDTO.setModel("Civic");
        vehicleRequestDTO.setYear(2021);
        vehicleRequestDTO.setRegistrationNumber("XYZ-789");
        vehicleRequestDTO.setVinNumber("2HGFG12848H509765");
        vehicleRequestDTO.setColor("Red");
        vehicleRequestDTO.setMileage(30000);
    }

    @Test
    void testListMyVehicles_Success() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByOwner(testUser)).thenReturn(Arrays.asList(testVehicle));

        // When
        List<Vehicle> vehicles = vehicleService.listMyVehicles("customer@example.com");

        // Then
        assertThat(vehicles).hasSize(1);
        assertThat(vehicles.get(0).getMake()).isEqualTo("Toyota");
        verify(userRepository, times(1)).findByEmail("customer@example.com");
        verify(vehicleRepository, times(1)).findByOwner(testUser);
    }

    @Test
    void testListMyVehicles_UserNotFound() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> vehicleService.listMyVehicles("nonexistent@example.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testGetMyVehicle_Success() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        // When
        Vehicle vehicle = vehicleService.getMyVehicle("customer@example.com", 1L);

        // Then
        assertThat(vehicle).isNotNull();
        assertThat(vehicle.getMake()).isEqualTo("Toyota");
        assertThat(vehicle.getModel()).isEqualTo("Camry");
        verify(vehicleRepository, times(1)).findById(1L);
    }

    @Test
    void testGetMyVehicle_VehicleNotFound() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> vehicleService.getMyVehicle("customer@example.com", 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void testAddMyVehicle_Success() {
        // Given
        VehicleResponseDTO responseDTO = new VehicleResponseDTO();
        responseDTO.setId(2L);
        responseDTO.setMake("Honda");
        responseDTO.setModel("Civic");
        responseDTO.setOwnerEmail("customer@example.com");

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.existsByRegistrationNumber("XYZ-789")).thenReturn(false);
        when(modelMapper.map(vehicleRequestDTO, Vehicle.class)).thenReturn(testVehicle);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(modelMapper.map(testVehicle, VehicleResponseDTO.class)).thenReturn(responseDTO);

        // When
        VehicleResponseDTO result = vehicleService.addMyVehicle("customer@example.com", vehicleRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOwnerEmail()).isEqualTo("customer@example.com");
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void testAddMyVehicle_UserNotFound() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> vehicleService.addMyVehicle("nonexistent@example.com", vehicleRequestDTO))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void testAddMyVehicle_VehicleAlreadyExists() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.existsByRegistrationNumber("XYZ-789")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> vehicleService.addMyVehicle("customer@example.com", vehicleRequestDTO))
                .isInstanceOf(VehicleAlreadyExistsException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void testUpdateMyVehicle_Success() {
        // Given
        VehicleRequestDTO updateDTO = new VehicleRequestDTO();
        updateDTO.setMileage(55000);
        updateDTO.setColor("White");

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // When
        Vehicle updated = vehicleService.updateMyVehicle("customer@example.com", 1L, updateDTO);

        // Then
        assertThat(updated).isNotNull();
        assertThat(updated.getMileage()).isEqualTo(55000);
        assertThat(updated.getColor()).isEqualTo("White");
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void testDeleteMyVehicle_Success() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        doNothing().when(vehicleRepository).delete(testVehicle);

        // When
        vehicleService.deleteMyVehicle("customer@example.com", 1L);

        // Then
        verify(vehicleRepository, times(1)).delete(testVehicle);
    }

    @Test
    void testDeleteMyVehicle_VehicleNotFound() {
        // Given
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> vehicleService.deleteMyVehicle("customer@example.com", 999L))
                .isInstanceOf(VehicleNotFoundException.class);
    }
}
