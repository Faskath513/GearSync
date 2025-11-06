package com.gearsync.backend.dto;

import com.gearsync.backend.model.ServiceCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServiceDTO {
    @NotBlank
    @Size(max = 120)
    private String serviceName;

    @Size(max = 1000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal basePrice;

    @NotNull @Positive
    private Integer estimatedDurationMinutes;

    @NotNull
    private ServiceCategory category;
}
