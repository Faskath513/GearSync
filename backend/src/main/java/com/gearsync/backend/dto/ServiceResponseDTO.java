package com.gearsync.backend.dto;

import com.gearsync.backend.model.ServiceCategory;
import java.math.BigDecimal;

public record ServiceResponseDTO(
        Long id,
        String serviceName,
        String description,
        BigDecimal basePrice,
        Integer estimatedDurationMinutes,
        ServiceCategory category
) {}
