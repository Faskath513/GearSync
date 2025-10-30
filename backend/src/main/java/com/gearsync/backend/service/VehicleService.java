package com.gearsync.backend.service;

import com.gearsync.backend.dto.VehicleRequestDTO;
import com.gearsync.backend.dto.VehicleResponseDTO;
import com.gearsync.backend.exception.UserNotFoundException;
import com.gearsync.backend.exception.VehicleAlreadyExistsException;
import com.gearsync.backend.exception.VehicleNotFoundException;
import com.gearsync.backend.model.User;
import com.gearsync.backend.model.Vehicle;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public List<Vehicle> listMyVehicles(String email) {
        User me = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return vehicleRepository.findByOwner(me);
    }

    public Vehicle getMyVehicle(String email, Long id) {
        User me = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Vehicle v = vehicleRepository.findById(id).orElseThrow(() -> new RuntimeException("Vehicle not found"));
        if (!v.getOwner().getId().equals(me.getId())) throw new RuntimeException("Forbidden");
        return v;
    }

    @Transactional
    public VehicleResponseDTO addMyVehicle(String email, VehicleRequestDTO payload) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (vehicleRepository.existsByRegistrationNumber(payload.getRegistrationNumber())) {
            throw new VehicleAlreadyExistsException(
                    "Vehicle with registration number " + payload.getRegistrationNumber() + " already exists");
        }
        Vehicle vehicle = modelMapper.map(payload, Vehicle.class);
        vehicle.setOwner(me);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        VehicleResponseDTO response = modelMapper.map(savedVehicle, VehicleResponseDTO.class);
        response.setOwnerEmail(me.getEmail());
        return response;
    }



    @Transactional
    public Vehicle updateMyVehicle(String email, Long id, VehicleRequestDTO update) {
        Vehicle existing = getMyVehicle(email, id);
        if (update.getMake() != null) existing.setMake(update.getMake());
        if (update.getModel() != null) existing.setModel(update.getModel());
        if (update.getColor() != null) existing.setColor(update.getColor());
        if (update.getVinNumber() != null) existing.setVinNumber(update.getVinNumber());
        if (update.getRegistrationNumber() != null) existing.setRegistrationNumber(update.getRegistrationNumber());
        if (update.getYear() != null) existing.setYear(update.getYear());
        if (update.getMileage() != null) existing.setMileage(update.getMileage());
        return vehicleRepository.save(existing);
    }

    @Transactional
    public void deleteMyVehicle(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }


}
