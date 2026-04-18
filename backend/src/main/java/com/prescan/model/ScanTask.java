package com.prescan.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "scan_tasks")
public class ScanTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String targetUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime scanTimestamp;

    private String status; // PENDING, RUNNING, COMPLETED, FAILED

    private Integer totalVulnerabilities = 0;
    private Integer highSeverityCount = 0;
    private Integer mediumSeverityCount = 0;
    private Integer lowSeverityCount = 0;

    private String overallRiskScore; // HIGH, MEDIUM, LOW, SAFE

    @OneToMany(mappedBy = "scanTask", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Finding> findings = new ArrayList<>();
    
    // Default constructor
    public ScanTask() {}
}
