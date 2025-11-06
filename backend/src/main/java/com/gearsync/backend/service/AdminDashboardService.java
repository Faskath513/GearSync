package com.gearsync.backend.service;

import com.gearsync.backend.dto.AdminDashboardCountsDTO;
import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public Long getUserCount() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getAppointmentCount() {
        return appointmentRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getVehicleCount() {
        return vehicleRepository.count();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalEarningsCompleted() {
        return appointmentRepository.sumFinalCostByStatus(AppointmentStatus.COMPLETED);
    }

    @Transactional(readOnly = true)
    public Long getActiveServiceCountInProgress() {
        return appointmentRepository.countByStatus(AppointmentStatus.IN_PROGRESS);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getConfirmedAppointments() {
        return appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getTodayScheduledAppointments() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        return appointmentRepository.findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(start, end);
    }
}
