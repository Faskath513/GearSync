package com.gearsync.backend.controller;

import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/user/count")
    public ResponseEntity<?> userCount() {
        try{
            return ResponseEntity.ok(adminDashboardService.getUserCount());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/appointment/count")
    public ResponseEntity<?> appointmentCount() {
        try{
            return ResponseEntity.ok(adminDashboardService.getAppointmentCount());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/vehicle/count")
    public ResponseEntity<?> vehicleCount() {
        try{
            return ResponseEntity.ok(adminDashboardService.getVehicleCount());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 1) Total Earnings for COMPLETED
    @GetMapping("/earnings/total")
    public ResponseEntity<?> totalEarnings() {
        try {
            BigDecimal total = adminDashboardService.getTotalEarningsCompleted();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 2) Active service count (IN_PROGRESS)
    @GetMapping("/services/active/count")
    public ResponseEntity<?> activeServiceCount() {
        try {
            Long count = adminDashboardService.getActiveServiceCountInProgress();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 3) List of appointments with status CONFIRMED
    @GetMapping("/appointments/confirmed")
    public ResponseEntity<?> confirmedAppointments() {
        try {
            List<Appointment> list = adminDashboardService.getConfirmedAppointments();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 4) List of appointments scheduled today (by scheduledDateTime date)
    @GetMapping("/appointments/today")
    public ResponseEntity<?> todayAppointments() {
        try {
            List<Appointment> list = adminDashboardService.getTodayScheduledAppointments();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

}
