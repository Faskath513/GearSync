package com.gearsync.backend.dto;

import com.gearsync.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRegisterDTO {
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private String role = String.valueOf(Role.EMPLOYEE);
}
