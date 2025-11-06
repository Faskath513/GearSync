package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDTO {
    private Long id;
    private String projectName;
    private String status;
    private BigDecimal estimatedCost;
    private Integer progressPercentage;
    private String vehicleRegistrationNumber;
    private LocalDateTime createdAt;
}
