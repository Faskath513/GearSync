package com.gearsync.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterDTO {

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    )
    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    @Pattern(regexp = "CUSTOMER", message = "Role must be CUSTOMER")
    private String role;

}
