package com.gearsync.backend.controller;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.service.AdminServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    public final AdminServices adminServices;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@Valid @RequestBody EmployeeRegisterDTO employeeRegisterDTO) {
        try {
            var response = adminServices.addEmployee(employeeRegisterDTO);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @PostMapping("/admins")
    public ResponseEntity<?> addAdmins(@Valid @RequestBody AdminRegisterDTO adminRegisterDTO) {
        try {
            var response = adminServices.addAdmin(adminRegisterDTO);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<User> users = userRepository.findAllEmployees();
            List<UserDto> userDtos = users.stream()
                    .map(user -> {
                        UserDto dto = new UserDto();
                        dto.setName(user.getFirstName() + " " + user.getLastName());
                        dto.setEmail(user.getEmail());
                        dto.setRole(String.valueOf(user.getRole()));
                        return dto;
                    })
                    .toList();
            return ResponseEntity.ok(userDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/appointments/{id}/assign")
    public ResponseEntity<?> assignEmployeeToAppointment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignAppointmentDTO request) {
        try {
            AppointmentResponseDTO response = adminServices.assignEmployeeToAppointment(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }


    }


    @PutMapping("/appointments/{id}/reassign")
    public ResponseEntity<?> reassignAppointmentEmployee(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignAppointmentDTO request) {

        try {
            AppointmentResponseDTO response = adminServices.reassignAppointmentEmployee(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }

    }


    @DeleteMapping("/appointments/{id}/unassign")
    public ResponseEntity<?> unassignAppointmentEmployee(
            Authentication authentication,
            @PathVariable Long id) {


        try {
            AppointmentResponseDTO response = adminServices.unassignAppointmentEmployee(
                    authentication.getName(),
                    id
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PutMapping("/projects/{id}/approve")
    public ResponseEntity<?> approveAndAssignProject(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ApproveProjectDTO request) {

        try {
            ProjectResponseDTO response = adminServices.approveAndAssignProject(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/projects/{id}/reject")
    public ResponseEntity<?> rejectProject(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RejectProjectDTO request) {


        try {
            ProjectResponseDTO response = adminServices.rejectProject(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PutMapping("/projects/{id}/assign")
    public ResponseEntity<?> assignEmployeeToProject(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignProjectDTO request) {

        try {
            ProjectResponseDTO response = adminServices.assignEmployeeToProject(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/projects/{id}/unassign")
    public ResponseEntity<?> unassignProjectEmployee(
            Authentication authentication,
            @PathVariable Long id) {


        try {
            ProjectResponseDTO response = adminServices.unassignProjectEmployee(
                    authentication.getName(),
                    id
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
