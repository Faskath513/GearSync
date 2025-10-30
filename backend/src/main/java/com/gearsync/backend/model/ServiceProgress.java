package com.gearsync.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer progressPercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Column(length = 1000, nullable = false)
    private String message;

    @Column(length = 500)
    private String technicalNotes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_employee_id", nullable = false)
    private User updatedByEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;


    public enum ProgressStatus {
        STARTED,
        IN_PROGRESS,
        AWAITING_PARTS,
        ON_HOLD,
        QUALITY_CHECK,
        COMPLETED,
        ISSUE_FOUND,
        CUSTOMER_APPROVAL_NEEDED
    }

    @PrePersist
    private void validateRelationship() {
        if (appointment == null && project == null) {
            throw new IllegalStateException("ServiceProgress must be associated with either an Appointment or a Project");
        }
    }
}