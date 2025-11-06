package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponseDTO {
    private String resetToken;
    private String message;
    private Long expiresInMinutes;
}