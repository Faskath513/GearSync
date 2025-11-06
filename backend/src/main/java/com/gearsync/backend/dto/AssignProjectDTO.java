package com.gearsync.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignProjectDTO {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Estimated cost is required")
    @DecimalMin(value = "0.01", message = "Estimated cost must be greater than 0")
    private BigDecimal estimatedCost;

    @NotNull(message = "Estimated duration is required")
    @Min(value = 1, message = "Estimated duration must be at least 1 hour")
    private Integer estimatedDurationHours;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String adminNotes;
}