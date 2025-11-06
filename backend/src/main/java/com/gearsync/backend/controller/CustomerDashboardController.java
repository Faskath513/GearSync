package com.gearsync.backend.controller;

import com.gearsync.backend.dto.MyAppointmentDTO;
import com.gearsync.backend.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/dashboard")
public class CustomerDashboardController {

    private final CustomerDashboardService customerDashboardService;

    @GetMapping("/appointment/count")
    public ResponseEntity<?> myAppointmentCount(Authentication authentication) {
        try{
            return ResponseEntity.ok(customerDashboardService.myAppointmentCount(authentication.getName()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/appointments/active/count")
    public ResponseEntity<?> activeAppointmentCount(Authentication auth) {
        try {
            return ResponseEntity.ok(customerDashboardService.activeAppointmentCount(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/services/completed/count")
    public ResponseEntity<?> completedServicesCount(Authentication auth) {
        try {
            return ResponseEntity.ok(customerDashboardService.completedServicesCount(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/vehicles/count")
    public ResponseEntity<?> myVehicleCount(Authentication auth) {
        try {
            return ResponseEntity.ok(customerDashboardService.myVehicleCount(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/spent/total")
    public ResponseEntity<?> totalSpent(Authentication auth) {
        try {
            BigDecimal total = customerDashboardService.totalSpentAmount(auth.getName());
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/appointments/upcoming")
    public ResponseEntity<?> upcomingAppointments(Authentication authentication) {
        try {
            List<MyAppointmentDTO> list = customerDashboardService.upcomingAppointments(authentication.getName());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
