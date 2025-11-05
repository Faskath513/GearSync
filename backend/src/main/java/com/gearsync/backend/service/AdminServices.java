package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.ProjectRepository;
import com.gearsync.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServices {

    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIALS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    private static final String ALL = UPPERCASE + LOWERCASE + DIGITS + SPECIALS;
    private static final SecureRandom random = new SecureRandom();


    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordManagementService passwordManagementService;
    private final AppointmentRepository appointmentRepository;
    private final ProjectRepository projectRepository;


    @Transactional
    public Map<String, Object> addEmployee(EmployeeRegisterDTO employeeRegisterDTO) {
        try {
            if (userRepository.existsByEmail(employeeRegisterDTO.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
            User user = modelMapper.map(employeeRegisterDTO, User.class);
            String generatedPassword = passwordManagementService.generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(generatedPassword));
            user.setIsFirstLogin(true);
            User savedUser = userRepository.save(user);
            String username = savedUser.getFirstName() + " " + savedUser.getLastName();
            emailService.sendEmployeeWelcomeEmail(savedUser.getEmail(),username,generatedPassword,"Employee");
            Map<String, Object> response = new HashMap<>();
            response.put("user-email", savedUser.getEmail());
            response.put("message", "Employee added successfully");
            return response;
        } catch (DuplicateResourceException e) {
            throw new DuplicateResourceException("User with email " + employeeRegisterDTO.getEmail() + " already exists.");
        }
    }
    @Transactional
    public Map<String, Object> addAdmin(AdminRegisterDTO adminRegisterDTO) {
        try {
            if (userRepository.existsByEmail(adminRegisterDTO.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
            User user = modelMapper.map(adminRegisterDTO, User.class);
            String generatedPassword = passwordManagementService.generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(generatedPassword));
            user.setIsFirstLogin(true);
            User savedUser = userRepository.save(user);
            String username = savedUser.getFirstName() + savedUser.getLastName();
            emailService.sendEmployeeWelcomeEmail(savedUser.getEmail(),username,generatedPassword,"Admin");
            Map<String, Object> response = new HashMap<>();
            response.put("user-email", savedUser.getEmail());
            response.put("message", "Admin added successfully");
            return response;
        } catch (DuplicateResourceException e) {
            throw new DuplicateResourceException("User with email " + adminRegisterDTO.getEmail() + " already exists.");
        }
    }

    @Transactional
    public AppointmentResponseDTO assignEmployeeToAppointment(
            String adminEmail,
            Long appointmentId,
            AssignAppointmentDTO request) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign employees to appointments");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));


        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot assign employee to a completed appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot assign employee to a cancelled appointment");
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        appointment.setAssignedEmployee(employee);

        if (appointment.getStatus() == AppointmentStatus.SCHEDULED) {
            appointment.setStatus(AppointmentStatus.CONFIRMED);
        }

        if (request.getFinalCost() != null) {
            appointment.setFinalCost(request.getFinalCost());
        }

        if (request.getAdminNotes() != null && !request.getAdminNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String note = String.format("[%s] Admin: %s", timestamp, request.getAdminNotes());

            String existingNotes = appointment.getEmployeeNotes() != null ?
                    appointment.getEmployeeNotes() : "";
            appointment.setEmployeeNotes(
                    existingNotes.isEmpty() ? note : existingNotes + "\n" + note
            );
        }

        Appointment updated = appointmentRepository.save(appointment);

        List<Services> services = new ArrayList<>(appointment.getAppointmentServices());
        return convertAppointmentToResponseDTO(updated, services);
    }


    @Transactional
    public AppointmentResponseDTO reassignAppointmentEmployee(
            String adminEmail,
            Long appointmentId,
            AssignAppointmentDTO request) {

        return assignEmployeeToAppointment(adminEmail, appointmentId, request);
    }


    @Transactional
    public AppointmentResponseDTO unassignAppointmentEmployee(String adminEmail, Long appointmentId) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can unassign employees");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot unassign employee from appointment in progress");
        }

        appointment.setAssignedEmployee(null);

        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }

        Appointment updated = appointmentRepository.save(appointment);

        List<Services> services = new ArrayList<>(appointment.getAppointmentServices());
        return convertAppointmentToResponseDTO(updated, services);
    }


    @Transactional
    public ProjectResponseDTO approveAndAssignProject(
            String adminEmail,
            Long projectId,
            ApproveProjectDTO request) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can approve projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new IllegalStateException(
                    "Can only approve projects with PENDING status. Current status: " + project.getStatus()
            );
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        project.setStatus(ProjectStatus.APPROVED);
        project.setAssignedEmployee(employee);
        project.setEstimatedCost(request.getEstimatedCost());
        project.setEstimatedDurationHours(request.getEstimatedDurationHours());

        if (request.getExpectedCompletionDate() != null) {
            project.setExpectedCompletionDate(request.getExpectedCompletionDate());
        }

        if (request.getApprovalNotes() != null && !request.getApprovalNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String approvalNote = String.format(
                    "\n\n[%s] APPROVED by Admin - Assigned to: %s %s\n" +
                            "Estimated Cost: $%.2f | Duration: %d hours\n" +
                            "Notes: %s",
                    timestamp,
                    employee.getFirstName(),
                    employee.getLastName(),
                    request.getEstimatedCost(),
                    request.getEstimatedDurationHours(),
                    request.getApprovalNotes()
            );

            project.setDescription(project.getDescription() + approvalNote);
        }

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO rejectProject(
            String adminEmail,
            Long projectId,
            RejectProjectDTO request) {


        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can reject projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new IllegalStateException(
                    "Can only reject projects with PENDING status. Current status: " + project.getStatus()
            );
        }

        project.setStatus(ProjectStatus.REJECTED);

        String timestamp = LocalDateTime.now().toString();
        String rejectionNote = String.format(
                "\n\n[%s] REJECTED by Admin\nReason: %s",
                timestamp,
                request.getRejectionReason()
        );

        project.setDescription(project.getDescription() + rejectionNote);

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO assignEmployeeToProject(
            String adminEmail,
            Long projectId,
            AssignProjectDTO request) {


        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign employees to projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() != ProjectStatus.APPROVED &&
                project.getStatus() != ProjectStatus.IN_PROGRESS &&
                project.getStatus() != ProjectStatus.ON_HOLD) {
            throw new IllegalStateException(
                    "Can only assign employee to APPROVED, IN_PROGRESS, or ON_HOLD projects. " +
                            "Current status: " + project.getStatus()
            );
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        project.setAssignedEmployee(employee);
        project.setEstimatedCost(request.getEstimatedCost());
        project.setEstimatedDurationHours(request.getEstimatedDurationHours());

        if (request.getAdminNotes() != null && !request.getAdminNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String note = String.format(
                    "\n\n[%s] Assignment Update - Assigned to: %s %s\nNotes: %s",
                    timestamp,
                    employee.getFirstName(),
                    employee.getLastName(),
                    request.getAdminNotes()
            );

            project.setDescription(project.getDescription() + note);
        }

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO unassignProjectEmployee(String adminEmail, Long projectId) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can unassign employees");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot unassign employee from project in progress");
        }

        project.setAssignedEmployee(null);

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }

    private AppointmentResponseDTO convertAppointmentToResponseDTO(
            Appointment appointment,
            List<Services> services) {

        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setScheduledDateTime(appointment.getScheduledDateTime());
        dto.setStatus(appointment.getStatus().name());
        dto.setCustomerNotes(appointment.getCustomerNotes());
        dto.setEmployeeNotes(appointment.getEmployeeNotes());
        dto.setFinalCost(appointment.getFinalCost());
        dto.setProgressPercentage(appointment.getProgressPercentage());

        User customer = appointment.getCustomer();
        dto.setCustomerId(customer.getId());
        dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        dto.setCustomerEmail(customer.getEmail());
        dto.setCustomerPhone(customer.getPhoneNumber());

        Vehicle vehicle = appointment.getVehicle();
        dto.setVehicleId(vehicle.getId());
        dto.setVehicleRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleMake(vehicle.getMake());
        dto.setVehicleModel(vehicle.getModel());
        dto.setVehicleYear(String.valueOf(vehicle.getYear()));

        List<ServiceSummaryDTO> serviceSummaries = services.stream()
                .map(service -> {
                    ServiceSummaryDTO summary = new ServiceSummaryDTO();
                    summary.setId(service.getId());
                    summary.setServiceName(service.getServiceName());
                    summary.setCategory(service.getCategory().name());
                    summary.setBasePrice(service.getBasePrice());
                    summary.setEstimatedDurationMinutes(service.getEstimatedDurationMinutes());
                    return summary;
                })
                .collect(Collectors.toList());
        dto.setServices(serviceSummaries);

        BigDecimal estimatedCost = services.stream()
                .map(Services::getBasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setEstimatedCost(estimatedCost);

        if (appointment.getAssignedEmployee() != null) {
            User employee = appointment.getAssignedEmployee();
            dto.setAssignedEmployeeId(employee.getId());
            dto.setAssignedEmployeeName(employee.getFirstName() + " " + employee.getLastName());
            dto.setAssignedEmployeeEmail(employee.getEmail());
        }

        dto.setActualStartTime(appointment.getActualStartTime());
        dto.setActualEndTime(appointment.getActualEndTime());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());

        return dto;
    }

    private ProjectResponseDTO convertProjectToResponseDTO(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectName(project.getProjectName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus().name());
        dto.setEstimatedCost(project.getEstimatedCost());
        dto.setActualCost(project.getActualCost());
        dto.setEstimatedDurationHours(project.getEstimatedDurationHours());
        dto.setStartDate(project.getStartDate());
        dto.setCompletionDate(project.getCompletionDate());
        dto.setExpectedCompletionDate(project.getExpectedCompletionDate());
        dto.setProgressPercentage(project.getProgressPercentage());

        User customer = project.getCustomer();
        dto.setCustomerId(customer.getId());
        dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        dto.setCustomerEmail(customer.getEmail());
        dto.setCustomerPhone(customer.getPhoneNumber());

        Vehicle vehicle = project.getVehicle();
        dto.setVehicleId(vehicle.getId());
        dto.setVehicleRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleMake(vehicle.getMake());
        dto.setVehicleModel(vehicle.getModel());
        dto.setVehicleYear(String.valueOf(vehicle.getYear()));

        if (project.getAssignedEmployee() != null) {
            User employee = project.getAssignedEmployee();
            dto.setAssignedEmployeeId(employee.getId());
            dto.setAssignedEmployeeName(employee.getFirstName() + " " + employee.getLastName());
            dto.setAssignedEmployeeEmail(employee.getEmail());
        }

        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        return dto;
    }
}
