package com.gearsync.backend.service;

import com.gearsync.backend.dto.ServiceDTO;
import com.gearsync.backend.dto.ServiceResponseDTO;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.model.ServiceCategory;
import com.gearsync.backend.model.Services;
import com.gearsync.backend.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private TaskService taskService;

    private ServiceDTO testServiceDTO;
    private Services testService;

    @BeforeEach
    void setUp() {
        testServiceDTO = new ServiceDTO();
        testServiceDTO.setServiceName("Oil Change");
        testServiceDTO.setDescription("Standard oil change service");
        testServiceDTO.setBasePrice(new BigDecimal("50.00"));
        testServiceDTO.setEstimatedDurationMinutes(60);
        testServiceDTO.setCategory(ServiceCategory.MAINTENANCE);

        testService = new Services();
        testService.setId(1L);
        testService.setServiceName("Oil Change");
        testService.setDescription("Standard oil change service");
        testService.setBasePrice(new BigDecimal("50.00"));
        testService.setEstimatedDurationMinutes(60);
        testService.setCategory(ServiceCategory.MAINTENANCE);
    }

    @Test
    void testNewServiceAdd_Success() {
        // Given
        when(serviceRepository.existsByServiceName(testServiceDTO.getServiceName())).thenReturn(false);
        when(serviceRepository.save(any(Services.class))).thenReturn(testService);

        // When
        taskService.newServiceAdd(testServiceDTO);

        // Then
        verify(serviceRepository).existsByServiceName("Oil Change");
        verify(serviceRepository).save(argThat(service ->
                service.getServiceName().equals("Oil Change") &&
                service.getDescription().equals("Standard oil change service") &&
                service.getBasePrice().compareTo(new BigDecimal("50.00")) == 0 &&
                service.getEstimatedDurationMinutes() == 60 &&
                service.getCategory() == ServiceCategory.MAINTENANCE
        ));
    }

    @Test
    void testNewServiceAdd_DuplicateServiceName() {
        // Given
        when(serviceRepository.existsByServiceName(testServiceDTO.getServiceName())).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> taskService.newServiceAdd(testServiceDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Service name already exists");
        
        verify(serviceRepository).existsByServiceName("Oil Change");
        verify(serviceRepository, never()).save(any(Services.class));
    }

    @Test
    void testGetAllServiceDetails_Success() {
        // Given
        Services service1 = new Services();
        service1.setId(1L);
        service1.setServiceName("Brake Inspection");
        service1.setDescription("Complete brake system inspection");
        service1.setBasePrice(new BigDecimal("75.00"));
        service1.setEstimatedDurationMinutes(45);
        service1.setCategory(ServiceCategory.INSPECTION);

        Services service2 = new Services();
        service2.setId(2L);
        service2.setServiceName("Oil Change");
        service2.setDescription("Standard oil change");
        service2.setBasePrice(new BigDecimal("50.00"));
        service2.setEstimatedDurationMinutes(60);
        service2.setCategory(ServiceCategory.MAINTENANCE);

        List<Services> services = Arrays.asList(service1, service2);
        
        when(serviceRepository.findAll(any(Sort.class))).thenReturn(services);

        // When
        List<ServiceResponseDTO> result = taskService.getAllServiceDetails();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).serviceName()).isEqualTo("Brake Inspection");
        assertThat(result.get(0).basePrice()).isEqualByComparingTo(new BigDecimal("75.00"));
        assertThat(result.get(1).serviceName()).isEqualTo("Oil Change");
        assertThat(result.get(1).estimatedDurationMinutes()).isEqualTo(60);
        
        verify(serviceRepository).findAll(Sort.by(Sort.Direction.ASC, "serviceName"));
    }

    @Test
    void testGetAllServiceDetails_EmptyList() {
        // Given
        when(serviceRepository.findAll(any(Sort.class))).thenReturn(List.of());

        // When
        List<ServiceResponseDTO> result = taskService.getAllServiceDetails();

        // Then
        assertThat(result).isEmpty();
        verify(serviceRepository).findAll(Sort.by(Sort.Direction.ASC, "serviceName"));
    }

    @Test
    void testGetAllServiceDetails_SortedAlphabetically() {
        // Given
        Services serviceZ = new Services();
        serviceZ.setId(1L);
        serviceZ.setServiceName("Z Service");
        serviceZ.setDescription("Last service");
        serviceZ.setBasePrice(new BigDecimal("100.00"));
        serviceZ.setEstimatedDurationMinutes(120);
        serviceZ.setCategory(ServiceCategory.REPAIR);

        Services serviceA = new Services();
        serviceA.setId(2L);
        serviceA.setServiceName("A Service");
        serviceA.setDescription("First service");
        serviceA.setBasePrice(new BigDecimal("50.00"));
        serviceA.setEstimatedDurationMinutes(30);
        serviceA.setCategory(ServiceCategory.MAINTENANCE);

        // Services should be returned in alphabetical order
        List<Services> services = Arrays.asList(serviceA, serviceZ);
        when(serviceRepository.findAll(any(Sort.class))).thenReturn(services);

        // When
        List<ServiceResponseDTO> result = taskService.getAllServiceDetails();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).serviceName()).isEqualTo("A Service");
        assertThat(result.get(1).serviceName()).isEqualTo("Z Service");
    }
}
