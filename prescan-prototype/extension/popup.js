document.addEventListener("DOMContentLoaded", async () => {
  const contentDiv = document.getElementById("content");
  contentDiv.textContent = "Scanning current page...";

  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Fetch headers from the target URL
    const headersReport = await checkHeaders(tab.url);

    // Inject code to scan DOM for forms and inline scripts
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scanPage,
    });

    const domReport = results[0].result;

    // Combine both reports
    const fullReport = {
      url: tab.url,
      timestamp: new Date().toISOString(),
      issues: [...headersReport.issues, ...domReport.issues],
    };

    showResults(fullReport);
  } catch (err) {
    contentDiv.textContent = `Error: ${err.message}`;
  }
});

async function checkHeaders(url) {
  const issues = [];
  try {
    const res = await fetch(url, { method: "HEAD" });
    const headers = Array.from(res.headers.entries()).reduce((acc, [k, v]) => {
      acc[k.toLowerCase()] = v;
      return acc;
    }, {});

    // Security header checks
    if (!headers["content-security-policy"])
      issues.push({
        severity: "high",
        id: "missing-csp",
        title: "Missing CSP",
        detail: "No Content-Security-Policy header found",
      });

    if (!headers["strict-transport-security"])
      issues.push({
        severity: "high",
        id: "missing-hsts",
        title: "Missing HSTS",
        detail: "No Strict-Transport-Security header found",
      });

    if (!headers["x-frame-options"])
      issues.push({
        severity: "medium",
        id: "missing-xfo",
        title: "Missing X-Frame-Options",
        detail: "No X-Frame-Options header found",
      });

    if (!headers["x-content-type-options"])
      issues.push({
        severity: "medium",
        id: "missing-xcto",
        title: "Missing X-Content-Type-Options",
        detail: "No X-Content-Type-Options header found",
      });

  } catch (err) {
    issues.push({
      severity: "high",
      id: "fetch-failed",
      title: "Failed to fetch headers",
      detail: `HEAD request failed: ${err.message}`,
    });
  }
  return { issues };
}

function scanPage() {
  const issues = [];

  // Inline scripts
  const inlineScripts = document.querySelectorAll("script:not([src])").length;
  if (inlineScripts > 0) {
    issues.push({
      severity: "medium",
      id: "inline-scripts",
      title: "Inline scripts",
      detail: `Found ${inlineScripts} inline <script> tag(s).`,
    });
  }

  // Insecure forms
  const forms = Array.from(document.forms);
  forms.forEach((f, i) => {
    const method = (f.method || "GET").toUpperCase();
    const action = f.action || "(none)";
    if (method === "GET" || action.startsWith("http://")) {
      issues.push({
        severity: "high",
        id: "insecure-form",
        title: "Insecure form",
        detail: `Form #${i + 1}: method=${method} action=${action}`,
      });
    }
  });

  return { issues };
}

function showResults(report) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  const header = document.createElement("div");
  header.textContent = `Scanned: ${report.url}`;
  header.style.fontSize = "12px";
  header.style.color = "#666";
  contentDiv.appendChild(header);

  if (report.issues.length === 0) {
    contentDiv.innerHTML += "<p>No obvious issues found ✅</p>";
    return;
  }

  report.issues.forEach(issue => {
    const div = document.createElement("div");
    div.className = `issue ${issue.severity}`;
    div.innerHTML = `
      <summary>${issue.title}</summary>
      <pre>${issue.detail}</pre>
    `;
    contentDiv.appendChild(div);
  });
}


// ======= ENHANCED UI ADD-ONS FOR PRESCAN =======

// 🎨 Severity badge colors
const badgeColor = {
  high: '#dc2626',
  medium: '#f59e0b',
  info: '#2563eb'
};

// 💡 Fix hint dictionary
const fixHints = {
  "missing-csp": "Add a Content-Security-Policy header to restrict script sources.",
  "missing-hsts": "Use Strict-Transport-Security to enforce HTTPS connections.",
  "missing-frame-options": "Add X-Frame-Options to protect against clickjacking.",
  "missing-cto": "Add X-Content-Type-Options to prevent MIME sniffing.",
  "insecure-form": "Use HTTPS and POST method for sensitive forms.",
  "inline-scripts": "Move inline JavaScript into separate .js files.",
  "unsafe-image-upload": "Validate uploaded images on the server side.",
  "password-hash-check": "Ensure password hashing is done on the server, not client side."
};

// 🧠 Enhanced issue renderer (patches your showResults)
const originalShowResults = typeof showResults === 'function' ? showResults : null;
window.showResults = function(report) {
  if (!report || !report.issues) return;

  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  report.issues.forEach(issue => {
    const div = document.createElement("details");
    div.className = `issue ${issue.severity}`;
    div.innerHTML = `
      <summary>
        <span style="background:${badgeColor[issue.severity] || '#888'};color:white;padding:2px 6px;border-radius:4px;font-size:11px;margin-right:6px;">
          ${issue.severity.toUpperCase()}
        </span> ${issue.title}
      </summary>
      <pre>${issue.detail}</pre>
    `;
    if (fixHints[issue.id]) {
      div.innerHTML += `<pre style="color:#4b5563"><b>Fix Hint:</b> ${fixHints[issue.id]}</pre>`;
    }
    contentDiv.appendChild(div);
  });

  // 📤 Export Report button
  const btn = document.createElement("button");
  btn.textContent = "Export Report";
  btn.style = "margin-top:12px;padding:6px 10px;border:none;border-radius:6px;background:#2563eb;color:white;cursor:pointer;";
  btn.onclick = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: "prescan_report.json"
    });
  };
  contentDiv.appendChild(btn);
};


