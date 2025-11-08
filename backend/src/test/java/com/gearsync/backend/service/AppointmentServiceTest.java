package com.gearsync.backend.service;

import com.gearsync.backend.dto.AppointmentRequestDTO;
import com.gearsync.backend.dto.AppointmentResponseDTO;
import com.gearsync.backend.dto.MyAppointmentDTO;
import com.gearsync.backend.dto.UpdateAppointmentRequestDTO;
import com.gearsync.backend.exception.*;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.ServiceRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AppointmentService appointmentService;

    private User testCustomer;
    private User testEmployee;
    private Vehicle testVehicle;
    private Services testService1;
    private Services testService2;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        // Setup test customer
        testCustomer = new User();
        testCustomer.setId(1L);
        testCustomer.setEmail("customer@test.com");
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setPhoneNumber("1234567890");
        testCustomer.setRole(Role.CUSTOMER);

        // Setup test employee
        testEmployee = new User();
        testEmployee.setId(2L);
        testEmployee.setEmail("employee@test.com");
        testEmployee.setFirstName("Jane");
        testEmployee.setLastName("Smith");
        testEmployee.setRole(Role.EMPLOYEE);

        // Setup test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setRegistrationNumber("ABC123");
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2020);
        testVehicle.setOwner(testCustomer);

        // Setup test services
        testService1 = new Services();
        testService1.setId(1L);
        testService1.setServiceName("Oil Change");
        testService1.setBasePrice(new BigDecimal("49.99"));
        testService1.setEstimatedDurationMinutes(30);
        testService1.setCategory(ServiceCategory.MAINTENANCE);
        testService1.setIsActive(true);

        testService2 = new Services();
        testService2.setId(2L);
        testService2.setServiceName("Tire Rotation");
        testService2.setBasePrice(new BigDecimal("29.99"));
        testService2.setEstimatedDurationMinutes(20);
        testService2.setCategory(ServiceCategory.TIRE_SERVICE);
        testService2.setIsActive(true);

        // Setup test appointment
        testAppointment = new Appointment();
        testAppointment.setId(1L);
        testAppointment.setCustomer(testCustomer);
        testAppointment.setVehicle(testVehicle);
        testAppointment.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        testAppointment.setStatus(AppointmentStatus.SCHEDULED);
        testAppointment.setCustomerNotes("Please check brakes too");
        testAppointment.setProgressPercentage(0);
        testAppointment.setFinalCost(new BigDecimal("79.98"));
        testAppointment.setAppointmentServices(new HashSet<>(Arrays.asList(testService1, testService2)));
        testAppointment.setCreatedAt(LocalDateTime.now());
        testAppointment.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testBookAppointment_Success() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(1L);
        request.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        request.setCustomerNotes("Test notes");
        request.setServiceIds(Arrays.asList(1L, 2L));

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(serviceRepository.findAllById(request.getServiceIds()))
                .thenReturn(Arrays.asList(testService1, testService2));
        when(appointmentRepository.existsByCustomerAndScheduledDateTime(any(User.class), any(LocalDateTime.class))).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        // When
        AppointmentResponseDTO result = appointmentService.bookAppointment(testCustomer.getEmail(), request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCustomerEmail()).isEqualTo("customer@test.com");
        assertThat(result.getVehicleId()).isEqualTo(1L);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void testBookAppointment_CustomerNotFound() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment("unknown@test.com", request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("Customer not found");
    }

    @Test
    void testBookAppointment_VehicleNotFound() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(999L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(VehicleNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void testBookAppointment_UnauthorizedVehicle() {
        // Given
        User otherUser = new User();
        otherUser.setId(999L);
        otherUser.setEmail("other@test.com");

        Vehicle otherVehicle = new Vehicle();
        otherVehicle.setId(2L);
        otherVehicle.setOwner(otherUser);

        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(2L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(2L)).thenReturn(Optional.of(otherVehicle));

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only book appointments for your own vehicles");
    }

    @Test
    void testBookAppointment_PastDateTime() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(1L);
        request.setScheduledDateTime(LocalDateTime.now().minusDays(1)); // Past date
        request.setServiceIds(Arrays.asList(1L));

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot schedule appointment in the past");
    }

    @Test
    void testBookAppointment_DuplicateDateTime() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(1L);
        request.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        request.setServiceIds(Arrays.asList(1L));

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(appointmentRepository.existsByCustomerAndScheduledDateTime(any(User.class), any(LocalDateTime.class))).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already have an appointment scheduled");
    }

    @Test
    void testBookAppointment_NoServices() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(1L);
        request.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        request.setServiceIds(new ArrayList<>()); // Empty list

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("At least one service must be selected");
    }

    @Test
    void testBookAppointment_InactiveService() {
        // Given
        testService1.setIsActive(false); // Deactivate service

        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setVehicleId(1L);
        request.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        request.setServiceIds(Arrays.asList(1L));

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(serviceRepository.findAllById(request.getServiceIds())).thenReturn(Arrays.asList(testService1));
        when(appointmentRepository.existsByCustomerAndScheduledDateTime(any(User.class), any(LocalDateTime.class))).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> appointmentService.bookAppointment(testCustomer.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void testGetMyAppointments_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findAllByCustomerId(testCustomer.getId()))
                .thenReturn(Arrays.asList(testAppointment));

        // When
        List<MyAppointmentDTO> results = appointmentService.getMyAppointments(testCustomer.getEmail());

        // Then
        assertThat(results).isNotEmpty();
        assertThat(results).hasSize(1);
        verify(appointmentRepository).findAllByCustomerId(testCustomer.getId());
    }

    @Test
    void testGetAppointmentById_Success() {
        // Given
        MyAppointmentDTO expectedDTO = new MyAppointmentDTO();
        expectedDTO.setId(1L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(modelMapper.map(testAppointment, MyAppointmentDTO.class)).thenReturn(expectedDTO);

        // When
        MyAppointmentDTO result = appointmentService.getAppointmentById(testCustomer.getEmail(), 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void testGetAppointmentById_Unauthorized() {
        // Given
        User otherCustomer = new User();
        otherCustomer.setId(999L);
        otherCustomer.setEmail("other@test.com");

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        // When/Then
        assertThatThrownBy(() -> appointmentService.getAppointmentById("other@test.com", 1L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only view your own appointments");
    }

    @Test
    void testUpdateAppointment_Success() {
        // Given
        UpdateAppointmentRequestDTO request = new UpdateAppointmentRequestDTO();
        request.setCustomerNotes("Updated notes");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        // When
        UpdateAppointmentRequestDTO result = appointmentService.updateAppointment(
                testCustomer.getEmail(), 1L, request);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void testUpdateAppointment_InProgress() {
        // Given
        testAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
        UpdateAppointmentRequestDTO request = new UpdateAppointmentRequestDTO();
        request.setCustomerNotes("New notes");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        // When/Then
        assertThatThrownBy(() -> appointmentService.updateAppointment(testCustomer.getEmail(), 1L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("currently in progress");
    }

    @Test
    void testCancelAppointment_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        // When
        AppointmentResponseDTO result = appointmentService.cancelAppointment(testCustomer.getEmail(), 1L);

        // Then
        assertThat(result).isNotNull();
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void testCancelAppointment_AlreadyCancelled() {
        // Given
        testAppointment.setStatus(AppointmentStatus.CANCELLED);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        // When/Then
        assertThatThrownBy(() -> appointmentService.cancelAppointment(testCustomer.getEmail(), 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void testDeleteAppointment_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        // When
        appointmentService.deleteAppointment(testCustomer.getEmail(), 1L);

        // Then
        verify(appointmentRepository).deleteById(1L);
        verify(appointmentRepository).flush();
    }

    @Test
    void testDeleteAppointment_NotAllowedStatus() {
        // Given
        testAppointment.setStatus(AppointmentStatus.COMPLETED);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        // When/Then
        assertThatThrownBy(() -> appointmentService.deleteAppointment(testCustomer.getEmail(), 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("SCHEDULED, CONFIRMED, or RESCHEDULED");
    }
}
