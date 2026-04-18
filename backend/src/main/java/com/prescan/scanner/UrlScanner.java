package com.prescan.scanner;

import java.util.List;

public interface UrlScanner {

    List<String> scan(String url);
}