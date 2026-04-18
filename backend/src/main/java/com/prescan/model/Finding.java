package com.prescan.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "findings")
public class Finding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String severity; // HIGH, MEDIUM, LOW
    
    private String affectedEndpoint;
    
    @Column(columnDefinition = "TEXT")
    private String evidence;
    
    @Column(columnDefinition = "TEXT")
    private String recommendation;
    
    private String remediationPriority; // URGENT, HIGH, MEDIUM, LOW

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_task_id", nullable = false)
    @JsonBackReference
    private ScanTask scanTask;

    public Finding() {}
}
