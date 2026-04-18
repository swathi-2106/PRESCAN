package com.prescan.scanner;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MockUrlScanner implements UrlScanner {

    @Override
    public List<String> scan(String url) {

        // Mock behavior (future: real scanning logic)
        return new ArrayList<>();
    }
}