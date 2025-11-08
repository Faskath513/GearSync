package com.gearsync.backend.service;

import com.gearsync.backend.dto.ProjectRequestDTO;
import com.gearsync.backend.dto.ProjectResponseDTO;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.ProjectRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private ProjectService projectService;

    private User testCustomer;
    private User testEmployee;
    private Vehicle testVehicle;
    private Project testProject;

    @BeforeEach
    void setUp() {
        // Setup test customer
        testCustomer = new User();
        testCustomer.setId(1L);
        testCustomer.setEmail("customer@test.com");
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setPhoneNumber("1234567890");
        testCustomer.setRole(Role.CUSTOMER);

        // Setup test employee
        testEmployee = new User();
        testEmployee.setId(2L);
        testEmployee.setEmail("employee@test.com");
        testEmployee.setFirstName("Jane");
        testEmployee.setLastName("Smith");
        testEmployee.setRole(Role.EMPLOYEE);

        // Setup test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setRegistrationNumber("ABC123");
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Camry");
        testVehicle.setYear(2020);
        testVehicle.setOwner(testCustomer);

        // Setup test project
        testProject = new Project();
        testProject.setId(1L);
        testProject.setProjectName("Engine Overhaul");
        testProject.setDescription("Complete engine rebuild");
        testProject.setCustomer(testCustomer);
        testProject.setVehicle(testVehicle);
        testProject.setStatus(ProjectStatus.PENDING);
        testProject.setEstimatedCost(new BigDecimal("2500.00"));
        testProject.setEstimatedDurationHours(40);
        testProject.setProgressPercentage(0);
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateProject_Success() {
        // Given
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setProjectName("Engine Overhaul");
        request.setDescription("Complete engine rebuild");
        request.setVehicleId(1L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // When
        ProjectResponseDTO result = projectService.createProject(testCustomer.getEmail(), request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProjectName()).isEqualTo("Engine Overhaul");
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void testCreateProject_CustomerNotFound() {
        // Given
        ProjectRequestDTO request = new ProjectRequestDTO();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.createProject("unknown@test.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found");
    }

    @Test
    void testCreateProject_NotCustomerRole() {
        // Given
        testEmployee.setRole(Role.EMPLOYEE); // Not a customer
        ProjectRequestDTO request = new ProjectRequestDTO();

        when(userRepository.findByEmail(testEmployee.getEmail())).thenReturn(Optional.of(testEmployee));

        // When/Then
        assertThatThrownBy(() -> projectService.createProject(testEmployee.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only customers can create project requests");
    }

    @Test
    void testCreateProject_VehicleNotFound() {
        // Given
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setVehicleId(999L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.createProject(testCustomer.getEmail(), request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void testCreateProject_UnauthorizedVehicle() {
        // Given
        User otherUser = new User();
        otherUser.setId(999L);
        otherUser.setEmail("other@test.com");

        Vehicle otherVehicle = new Vehicle();
        otherVehicle.setId(2L);
        otherVehicle.setOwner(otherUser);

        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setVehicleId(2L);
        request.setProjectName("Test Project");
        request.setDescription("Test Description");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(2L)).thenReturn(Optional.of(otherVehicle));

        // When/Then
        assertThatThrownBy(() -> projectService.createProject(testCustomer.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only create projects for your own vehicles");
    }

    @Test
    void testGetMyProjects_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(projectRepository.findByCustomerId(testCustomer.getId())).thenReturn(Arrays.asList(testProject));

        // When
        List<ProjectResponseDTO> results = projectService.getMyProjects(testCustomer.getEmail());

        // Then
        assertThat(results).isNotEmpty();
        assertThat(results).hasSize(1);
        verify(projectRepository).findByCustomerId(testCustomer.getId());
    }

    @Test
    void testGetMyProjects_UserNotFound() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.getMyProjects("unknown@test.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found");
    }

    @Test
    void testGetMyActiveProjects_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(projectRepository.findActiveProjectsByCustomer(testCustomer.getId()))
                .thenReturn(Arrays.asList(testProject));

        // When
        List<ProjectResponseDTO> results = projectService.getMyActiveProjects(testCustomer.getEmail());

        // Then
        assertThat(results).isNotEmpty();
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isIn("PENDING", "APPROVED", "IN_PROGRESS", "ON_HOLD");
    }

    @Test
    void testGetProjectById_Success() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));

        // When
        ProjectResponseDTO result = projectService.getProjectById(testCustomer.getEmail(), 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProjectName()).isEqualTo("Engine Overhaul");
    }

    @Test
    void testGetProjectById_NotFound() {
        // Given
        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> projectService.getProjectById(testCustomer.getEmail(), 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found");
    }

    @Test
    void testGetProjectById_Unauthorized() {
        // Given
        User otherCustomer = new User();
        otherCustomer.setId(999L);
        otherCustomer.setEmail("other@test.com");
        otherCustomer.setRole(Role.CUSTOMER);

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherCustomer));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));

        // When/Then
        assertThatThrownBy(() -> projectService.getProjectById("other@test.com", 1L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("don't have permission to view this project");
    }

    @Test
    void testGetProjectById_EmployeeCanViewAny() {
        // Given
        when(userRepository.findByEmail(testEmployee.getEmail())).thenReturn(Optional.of(testEmployee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));

        // When
        ProjectResponseDTO result = projectService.getProjectById(testEmployee.getEmail(), 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        // Employees can view any project
    }

    @Test
    void testCreateProjectWithAdditionalNotes() {
        // Given
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setProjectName("Engine Overhaul");
        request.setDescription("Complete engine rebuild");
        request.setVehicleId(1L);
        request.setAdditionalNotes("Customer requested premium parts");

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project savedProject = invocation.getArgument(0);
            savedProject.setId(1L);
            return savedProject;
        });

        // When
        ProjectResponseDTO result = projectService.createProject(testCustomer.getEmail(), request);

        // Then
        assertThat(result).isNotNull();
        verify(projectRepository).save(argThat(project ->
                project.getDescription().contains("Additional Notes:")
        ));
    }

    @Test
    void testProjectInitialStatus() {
        // Given
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setProjectName("Test Project");
        request.setDescription("Test Description");
        request.setVehicleId(1L);

        when(userRepository.findByEmail(testCustomer.getEmail())).thenReturn(Optional.of(testCustomer));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project savedProject = invocation.getArgument(0);
            savedProject.setId(1L);
            return savedProject;
        });

        // When
        projectService.createProject(testCustomer.getEmail(), request);

        // Then
        verify(projectRepository).save(argThat(project ->
                project.getStatus() == ProjectStatus.PENDING &&
                        project.getProgressPercentage() == 0 &&
                        project.getEstimatedCost().equals(BigDecimal.ZERO)
        ));
    }
}
