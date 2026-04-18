package com.prescan.scanner;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
@Primary
@Component
public class BasicUrlScanner implements UrlScanner {

    @Override
    public List<String> scan(String url) {

        List<String> vulnerabilities = new ArrayList<>();

        // Very basic mock logic
        if (url.contains("http://")) {
            vulnerabilities.add("Insecure Protocol (HTTP)");
        }

        if (url.contains("login")) {
            vulnerabilities.add("Potential Sensitive Endpoint");
        }

        return vulnerabilities;
    }
}