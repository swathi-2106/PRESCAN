package com.prescan.controller;

import com.prescan.dto.ScanRequest;
import com.prescan.model.ScanTask;
import com.prescan.service.ScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scans")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    @PostMapping("/start")
    public ResponseEntity<ScanTask> startScan(@Valid @RequestBody ScanRequest request) {
        return ResponseEntity.ok(scanService.scanUrl(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ScanTask>> getScanHistory() {
        return ResponseEntity.ok(scanService.getScanHistory());
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<ScanTask> getScanDetails(@PathVariable Long id) {
        return ResponseEntity.ok(scanService.getScanDetails(id));
    }
}