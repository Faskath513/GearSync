package com.gearsync.backend.dto;

import lombok.Data;

@Data
public class VehicleRequestDTO {
    private String registrationNumber;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private String vinNumber;
    private Integer mileage;
}
