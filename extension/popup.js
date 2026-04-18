document.addEventListener("DOMContentLoaded", async () => {
  const scanBtn = document.getElementById("scanBtn");
  const targetUrlInput = document.getElementById("targetUrl");
  const loader = document.getElementById("loader");
  const resultView = document.getElementById("resultView");
  const errorMsg = document.getElementById("errorMsg");
  const dashboardBtn = document.getElementById("dashboardBtn");
  
  const highCount = document.getElementById("highCount");
  const mediumCount = document.getElementById("mediumCount");
  const lowCount = document.getElementById("lowCount");

  let currentScanId = null;

  // Auto-fill current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith("http")) {
      targetUrlInput.value = tab.url;
    }
  } catch (err) {
    console.error("Could not get active tab:", err);
  }

  scanBtn.addEventListener("click", async () => {
    const url = targetUrlInput.value.trim();
    if (!url) {
      showError("Please enter a URL");
      return;
    }

    // Reset UI
    scanBtn.disabled = true;
    loader.style.display = "block";
    resultView.style.display = "none";
    errorMsg.style.display = "none";

    try {
      const response = await fetch("http://localhost:8080/api/scans/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) throw new Error("Backend connection failed.");

      const data = await response.json();
      currentScanId = data.id;

      // Update UI
      highCount.textContent = data.highSeverityCount || 0;
      mediumCount.textContent = data.mediumSeverityCount || 0;
      lowCount.textContent = data.lowSeverityCount || 0;
      
      loader.style.display = "none";
      resultView.style.display = "block";

      // Show notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiLz48L3N2Zz4=", // simple placeholder icon
        title: "Scan Completed",
        message: `Found ${data.totalVulnerabilities} vulnerabilities (High: ${data.highSeverityCount}).`,
        priority: 2
      });

    } catch (error) {
      loader.style.display = "none";
      showError("Failed to run scan. Is backend running?");
      console.error(error);
    } finally {
      scanBtn.disabled = false;
    }
  });

  dashboardBtn.addEventListener("click", () => {
    const reportUrl = `http://localhost:5173/report/${currentScanId || ''}`;
    chrome.tabs.create({ url: reportUrl });
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }
});