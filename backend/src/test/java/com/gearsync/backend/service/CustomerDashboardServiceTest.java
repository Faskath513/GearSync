package com.gearsync.backend.service;

import com.gearsync.backend.dto.MyAppointmentDTO;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerDashboardServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerDashboardService customerDashboardService;

    private String customerEmail;
    private User testCustomer;

    @BeforeEach
    void setUp() {
        customerEmail = "customer@example.com";
        testCustomer = new User();
        testCustomer.setId(1L);
        testCustomer.setEmail(customerEmail);
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
    }

    @Test
    void testMyAppointmentCount_Success() {
        // Given
        Long expectedCount = 5L;
        when(appointmentRepository.countByCustomer_Email(customerEmail)).thenReturn(expectedCount);

        // When
        Long result = customerDashboardService.myAppointmentCount(customerEmail);

        // Then
        assertThat(result).isEqualTo(expectedCount);
        verify(appointmentRepository).countByCustomer_Email(customerEmail);
    }

    @Test
    void testMyAppointmentCount_NoAppointments() {
        // Given
        when(appointmentRepository.countByCustomer_Email(customerEmail)).thenReturn(0L);

        // When
        Long result = customerDashboardService.myAppointmentCount(customerEmail);

        // Then
        assertThat(result).isZero();
        verify(appointmentRepository).countByCustomer_Email(customerEmail);
    }

    @Test
    void testActiveAppointmentCount_Success() {
        // Given
        when(appointmentRepository.countByCustomer_EmailAndStatus(customerEmail, AppointmentStatus.IN_PROGRESS))
                .thenReturn(3L);

        // When
        Integer result = customerDashboardService.activeAppointmentCount(customerEmail);

        // Then
        assertThat(result).isEqualTo(3);
        verify(appointmentRepository).countByCustomer_EmailAndStatus(customerEmail, AppointmentStatus.IN_PROGRESS);
    }

    @Test
    void testCompletedServicesCount_Success() {
        // Given
        when(appointmentRepository.countByCustomer_EmailAndStatus(customerEmail, AppointmentStatus.COMPLETED))
                .thenReturn(2L);

        // When
        Integer result = customerDashboardService.completedServicesCount(customerEmail);

        // Then
        assertThat(result).isEqualTo(2);
        verify(appointmentRepository).countByCustomer_EmailAndStatus(customerEmail, AppointmentStatus.COMPLETED);
    }

    @Test
    void testMyVehicleCount_Success() {
        // Given
        Long expectedCount = 3L;
        when(vehicleRepository.countByOwner_Email(customerEmail)).thenReturn(expectedCount);

        // When
        Long result = customerDashboardService.myVehicleCount(customerEmail);

        // Then
        assertThat(result).isEqualTo(expectedCount);
        verify(vehicleRepository).countByOwner_Email(customerEmail);
    }

    @Test
    void testMyVehicleCount_NoVehicles() {
        // Given
        when(vehicleRepository.countByOwner_Email(customerEmail)).thenReturn(0L);

        // When
        Long result = customerDashboardService.myVehicleCount(customerEmail);

        // Then
        assertThat(result).isZero();
        verify(vehicleRepository).countByOwner_Email(customerEmail);
    }

    @Test
    void testTotalSpentAmount_Success() {
        // Given
        BigDecimal expectedAmount = new BigDecimal("5000.00");
        when(appointmentRepository.sumSpentByCustomerCompleted(customerEmail)).thenReturn(expectedAmount);

        // When
        BigDecimal result = customerDashboardService.totalSpentAmount(customerEmail);

        // Then
        assertThat(result).isEqualByComparingTo(expectedAmount);
        verify(appointmentRepository).sumSpentByCustomerCompleted(customerEmail);
    }

    @Test
    void testTotalSpentAmount_NullResult_ReturnsNull() {
        // Given
        when(appointmentRepository.sumSpentByCustomerCompleted(customerEmail)).thenReturn(null);

        // When
        BigDecimal result = customerDashboardService.totalSpentAmount(customerEmail);

        // Then
        assertThat(result).isNull();
        verify(appointmentRepository).sumSpentByCustomerCompleted(customerEmail);
    }

    @Test
    void testUpcomingAppointments_Success() {
        // Given
        Appointment appointment1 = new Appointment();
        appointment1.setId(1L);
        appointment1.setScheduledDateTime(LocalDateTime.now().plusDays(2));
        appointment1.setStatus(AppointmentStatus.CONFIRMED);
        appointment1.setAppointmentServices(new HashSet<>());
        
        Appointment appointment2 = new Appointment();
        appointment2.setId(2L);
        appointment2.setScheduledDateTime(LocalDateTime.now().plusDays(3));
        appointment2.setStatus(AppointmentStatus.CONFIRMED);
        appointment2.setAppointmentServices(new HashSet<>());

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        
        when(userRepository.findByEmail(customerEmail)).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                eq(testCustomer.getId()), any(LocalDateTime.class)))
                .thenReturn(appointments);

        // When
        List<MyAppointmentDTO> result = customerDashboardService.upcomingAppointments(customerEmail);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(1).getId()).isEqualTo(2L);
        verify(appointmentRepository).findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                eq(testCustomer.getId()), any(LocalDateTime.class));
    }

    @Test
    void testUpcomingAppointments_NoUpcoming() {
        // Given
        when(userRepository.findByEmail(customerEmail)).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                eq(testCustomer.getId()), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // When
        List<MyAppointmentDTO> result = customerDashboardService.upcomingAppointments(customerEmail);

        // Then
        assertThat(result).isEmpty();
        verify(appointmentRepository).findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                eq(testCustomer.getId()), any(LocalDateTime.class));
    }

    @Test
    void testUpcomingAppointments_CustomerNotFound() {
        // Given
        when(userRepository.findByEmail(customerEmail)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> customerDashboardService.upcomingAppointments(customerEmail))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found");
        
        verify(userRepository).findByEmail(customerEmail);
        verifyNoInteractions(appointmentRepository);
    }

    @Test
    void testUpcomingAppointments_ConvertsToDTOCorrectly() {
        // Given
        Services service = new Services();
        service.setId(1L);
        service.setServiceName("Oil Change");
        service.setCategory(ServiceCategory.MAINTENANCE);
        service.setBasePrice(new BigDecimal("50.00"));
        service.setEstimatedDurationMinutes(60);

        Set<Services> services = new HashSet<>();
        services.add(service);

        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setScheduledDateTime(LocalDateTime.now().plusDays(2));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setProgressPercentage(0);
        appointment.setCustomerNotes("Test notes");
        appointment.setAppointmentServices(services);
        appointment.setFinalCost(new BigDecimal("50.00"));

        when(userRepository.findByEmail(customerEmail)).thenReturn(Optional.of(testCustomer));
        when(appointmentRepository.findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                eq(testCustomer.getId()), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(appointment));

        // When
        List<MyAppointmentDTO> result = customerDashboardService.upcomingAppointments(customerEmail);

        // Then
        assertThat(result).hasSize(1);
        MyAppointmentDTO dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getScheduledDateTime()).isEqualTo(appointment.getScheduledDateTime());
        assertThat(dto.getStatus()).isEqualTo("CONFIRMED");
        assertThat(dto.getProgressPercentage()).isZero();
        assertThat(dto.getCustomerNotes()).isEqualTo("Test notes");
        assertThat(dto.getServices()).hasSize(1);
        assertThat(dto.getEstimatedCost()).isEqualByComparingTo(new BigDecimal("50.00"));
    }
}
