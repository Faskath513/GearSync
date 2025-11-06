package com.gearsync.backend.controller;
import com.gearsync.backend.dto.VehicleRequestDTO;
import com.gearsync.backend.dto.VehicleResponseDTO;
import com.gearsync.backend.exception.UserNotFoundException;
import com.gearsync.backend.exception.VehicleAlreadyExistsException;
import com.gearsync.backend.exception.VehicleNotFoundException;
import com.gearsync.backend.model.Vehicle;
import com.gearsync.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/vehicles")
@RequiredArgsConstructor
public class CustomerVehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> list(Authentication authentication) {
        return ResponseEntity.ok(vehicleService.listMyVehicles(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getMyVehicle(authentication.getName(), id));
    }

    @PostMapping
    public ResponseEntity<?> addMyVehicle(
            Authentication authentication,
            @RequestBody VehicleRequestDTO payload) {

        try {
            VehicleResponseDTO response = vehicleService.addMyVehicle(authentication.getName(), payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (VehicleAlreadyExistsException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", ex.getMessage()));
        } catch (UserNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong"));
        }
    }

    @PutMapping("/{id}")
        public ResponseEntity<Vehicle> update(Authentication authentication, @PathVariable Long id, @RequestBody VehicleRequestDTO payload) {
            return ResponseEntity.ok(vehicleService.updateMyVehicle(authentication.getName(), id, payload));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Vehicle> patchUpdate(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody VehicleRequestDTO payload) {
        return ResponseEntity.ok(vehicleService.updateMyVehicle(authentication.getName(), id, payload));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication authentication, @PathVariable Long id) {
        try {
            vehicleService.deleteMyVehicle(authentication.getName(), id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (UserNotFoundException | VehicleNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong"));
        }
    }
}


