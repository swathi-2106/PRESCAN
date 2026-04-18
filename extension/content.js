// content.js

function scanPage() {
  const issues = [];

  // 1. Check HTTPS
  if (location.protocol !== "https:") {
    issues.push("⚠️ Site is not using HTTPS");
  }

  // 2. Check password fields
  document.querySelectorAll("input").forEach(input => {
    if (input.type === "password" && input.autocomplete !== "off") {
      issues.push("⚠️ Password field allows autocomplete");
    }
  });

  // 3. Inline scripts (possible XSS risk)
  const inlineScripts = document.querySelectorAll("script:not([src])");
  if (inlineScripts.length > 0) {
    issues.push("⚠️ Inline scripts detected");
  }

  return issues;
}

// Listen for popup trigger
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCAN_PAGE") {
    const result = scanPage();
    sendResponse(result);
  }
});