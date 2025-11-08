package com.gearsync.backend.service;

import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeDashboardServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private EmployeeDashboardService employeeDashboardService;

    private String employeeEmail;

    @BeforeEach
    void setUp() {
        employeeEmail = "employee@example.com";
    }

    @Test
    void testAssignedAppointmentCount_Success() {
        // Given
        Long expectedCount = 10L;
        when(appointmentRepository.countByAssignedEmployee_Email(employeeEmail)).thenReturn(expectedCount);

        // When
        Long result = employeeDashboardService.assignedAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isEqualTo(expectedCount);
        verify(appointmentRepository).countByAssignedEmployee_Email(employeeEmail);
    }

    @Test
    void testAssignedAppointmentCount_NoAssignments() {
        // Given
        when(appointmentRepository.countByAssignedEmployee_Email(employeeEmail)).thenReturn(0L);

        // When
        Long result = employeeDashboardService.assignedAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isZero();
        verify(appointmentRepository).countByAssignedEmployee_Email(employeeEmail);
    }

    @Test
    void testCompletedAppointmentCount_Success() {
        // Given
        Long expectedCount = 5L;
        when(appointmentRepository.countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.COMPLETED))
                .thenReturn(expectedCount);

        // When
        Long result = employeeDashboardService.completedAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isEqualTo(expectedCount);
        verify(appointmentRepository).countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.COMPLETED);
    }

    @Test
    void testCompletedAppointmentCount_NoCompleted() {
        // Given
        when(appointmentRepository.countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.COMPLETED))
                .thenReturn(0L);

        // When
        Long result = employeeDashboardService.completedAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isZero();
        verify(appointmentRepository).countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.COMPLETED);
    }

    @Test
    void testInProgressAppointmentCount_Success() {
        // Given
        Long expectedCount = 3L;
        when(appointmentRepository.countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.IN_PROGRESS))
                .thenReturn(expectedCount);

        // When
        Long result = employeeDashboardService.inProgressAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isEqualTo(expectedCount);
        verify(appointmentRepository).countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.IN_PROGRESS);
    }

    @Test
    void testInProgressAppointmentCount_NoInProgress() {
        // Given
        when(appointmentRepository.countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.IN_PROGRESS))
                .thenReturn(0L);

        // When
        Long result = employeeDashboardService.inProgressAppointmentCount(employeeEmail);

        // Then
        assertThat(result).isZero();
        verify(appointmentRepository).countByAssignedEmployee_EmailAndStatus(employeeEmail, AppointmentStatus.IN_PROGRESS);
    }
}
