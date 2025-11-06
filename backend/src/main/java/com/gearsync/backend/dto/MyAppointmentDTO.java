package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyAppointmentDTO {
    private Long id;
    private LocalDateTime scheduledDateTime;
    private String status;
    private String customerNotes;
    private String employeeNotes;
    private BigDecimal estimatedCost;
    private BigDecimal finalCost;
    private Integer progressPercentage;
    private Set<ServiceSummaryDTO> services;
}
