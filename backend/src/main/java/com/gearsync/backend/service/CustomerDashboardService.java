package com.gearsync.backend.service;

import com.gearsync.backend.dto.MyAppointmentDTO;
import com.gearsync.backend.dto.ServiceSummaryDTO;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.model.User;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDashboardService {

    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Long myAppointmentCount(String email) {
        return appointmentRepository.countByCustomer_Email(email);
    }

    @Transactional(readOnly = true)
    public Integer activeAppointmentCount(String email) {
        long count = appointmentRepository.countByCustomer_EmailAndStatus(email, AppointmentStatus.IN_PROGRESS);
        return Math.toIntExact(count);
    }

    @Transactional(readOnly = true)
    public Integer completedServicesCount(String email) {
        long count = appointmentRepository.countByCustomer_EmailAndStatus(email, AppointmentStatus.COMPLETED);
        return Math.toIntExact(count);
    }

    @Transactional(readOnly = true)
    public Long myVehicleCount(String email) {
        return vehicleRepository.countByOwner_Email(email);
    }

    @Transactional(readOnly = true)
    public BigDecimal totalSpentAmount(String email) {
        return appointmentRepository.sumSpentByCustomerCompleted(email);
    }

    @Transactional(readOnly = true)
    public List<MyAppointmentDTO> upcomingAppointments(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        LocalDateTime startOfTomorrow = LocalDate.now().plusDays(1).atStartOfDay();

        List<Appointment> appointments =
                appointmentRepository.findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
                        customer.getId(), startOfTomorrow);

        return appointments.stream().map(appointment -> {
            MyAppointmentDTO dto = new MyAppointmentDTO();
            dto.setId(appointment.getId());
            dto.setScheduledDateTime(appointment.getScheduledDateTime());
            dto.setStatus(appointment.getStatus().name());
            dto.setCustomerNotes(appointment.getCustomerNotes());
            dto.setEmployeeNotes(appointment.getEmployeeNotes());
            dto.setFinalCost(appointment.getFinalCost());
            dto.setProgressPercentage(appointment.getProgressPercentage());

            dto.setServices(
                    appointment.getAppointmentServices().stream().map(service -> {
                        ServiceSummaryDTO sDto = new ServiceSummaryDTO();
                        sDto.setId(service.getId());
                        sDto.setServiceName(service.getServiceName());
                        sDto.setCategory(service.getCategory().name());
                        sDto.setBasePrice(service.getBasePrice());
                        sDto.setEstimatedDurationMinutes(service.getEstimatedDurationMinutes());
                        return sDto;
                    }).collect(Collectors.toSet())
            );

            BigDecimal estimatedCost = dto.getServices().stream()
                    .map(ServiceSummaryDTO::getBasePrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setEstimatedCost(estimatedCost);

            return dto;
        }).collect(Collectors.toList());
    }
}
