package com.prescan.service;

import com.prescan.dto.ScanRequest;
import com.prescan.model.Finding;
import com.prescan.model.ScanTask;
import com.prescan.repository.ScanTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScanService {

    private final ScanTaskRepository scanTaskRepository;

    public ScanTask scanUrl(ScanRequest request) {
        String targetUrl = request.getUrl();

        ScanTask scanTask = new ScanTask();
        scanTask.setTargetUrl(targetUrl);
        scanTask.setStatus("COMPLETED");

        List<Finding> findings = new ArrayList<>();
        int high = 0, medium = 0, low = 0;

        // Mock modular scans
        if (targetUrl.startsWith("http://")) {
            findings.add(createFinding(scanTask, "Insecure Protocol (HTTP)", 
                    "The application is using unencrypted HTTP.", "HIGH", 
                    targetUrl, "Missing HTTPS", "Enable HTTPS and redirect HTTP traffic.", "URGENT"));
            high++;
        }

        findings.add(createFinding(scanTask, "Missing Security Headers", 
                "Standard security headers like X-Frame-Options or Content-Security-Policy are missing.", "MEDIUM", 
                targetUrl, "Headers inspected", "Implement proper security headers.", "MEDIUM"));
        medium++;

        if (targetUrl.contains("login") || targetUrl.contains("admin")) {
            findings.add(createFinding(scanTask, "Sensitive Endpoint Exposed", 
                    "A potential sensitive endpoint is accessible.", "LOW", 
                    targetUrl, "URL matches pattern", "Ensure proper authentication is enforced.", "LOW"));
            low++;
        }

        scanTask.setFindings(findings);
        scanTask.setHighSeverityCount(high);
        scanTask.setMediumSeverityCount(medium);
        scanTask.setLowSeverityCount(low);
        scanTask.setTotalVulnerabilities(high + medium + low);
        
        if (high > 0) scanTask.setOverallRiskScore("HIGH");
        else if (medium > 0) scanTask.setOverallRiskScore("MEDIUM");
        else if (low > 0) scanTask.setOverallRiskScore("LOW");
        else scanTask.setOverallRiskScore("SAFE");

        return scanTaskRepository.save(scanTask);
    }

    public List<ScanTask> getScanHistory() {
        return scanTaskRepository.findAllByOrderByScanTimestampDesc();
    }

    public ScanTask getScanDetails(Long id) {
        return scanTaskRepository.findById(id).orElseThrow(() -> new RuntimeException("Scan not found"));
    }

    private Finding createFinding(ScanTask scanTask, String title, String description, String severity, 
                                  String endpoint, String evidence, String recommendation, String priority) {
        Finding finding = new Finding();
        finding.setTitle(title);
        finding.setDescription(description);
        finding.setSeverity(severity);
        finding.setAffectedEndpoint(endpoint);
        finding.setEvidence(evidence);
        finding.setRecommendation(recommendation);
        finding.setRemediationPriority(priority);
        finding.setScanTask(scanTask);
        return finding;
    }
}