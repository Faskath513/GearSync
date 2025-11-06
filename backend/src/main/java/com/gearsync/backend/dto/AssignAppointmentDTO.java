package com.gearsync.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignAppointmentDTO {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String adminNotes;

    @DecimalMin(value = "0.0", message = "Final cost cannot be negative")
    private BigDecimal finalCost;
}
