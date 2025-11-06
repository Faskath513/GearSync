package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstLoginResponseDTO {
    private Boolean requirePasswordChange;
    private String message;
    private String email;
}
