package com.gearsync.backend.repository;

import com.gearsync.backend.model.Services;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ServiceRepository extends JpaRepository<Services, Long> {

    boolean existsByServiceName(@NotBlank @Size(max = 120) String serviceName);

}
