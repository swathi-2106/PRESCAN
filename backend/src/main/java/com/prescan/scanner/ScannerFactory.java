package com.prescan.scanner;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScannerFactory {

    private final List<UrlScanner> scanners;

    public UrlScanner getScanner(String url) {

        // simple decision logic (can be expanded later)
        if (url.contains("http://")) {
            return scanners.stream()
                    .filter(scanner -> scanner.getClass().getSimpleName().equals("BasicUrlScanner"))
                    .findFirst()
                    .orElseThrow();
        }

        return scanners.stream()
                .filter(scanner -> scanner.getClass().getSimpleName().equals("MockUrlScanner"))
                .findFirst()
                .orElseThrow();
    }
}