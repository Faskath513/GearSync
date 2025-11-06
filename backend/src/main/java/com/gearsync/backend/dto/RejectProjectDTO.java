package com.gearsync.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectProjectDTO {

    @NotBlank(message = "Rejection reason is required")
    @Size(min = 10, max = 1000, message = "Rejection reason must be between 10-1000 characters")
    private String rejectionReason;
}