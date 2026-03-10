// shared/rules.js
function makeReport(url) {
  return {
    url,
    timestamp: new Date().toISOString(),
    issues: []
  };
}

function addIssue(report, severity, id, title, detail) {
  report.issues.push({ severity, id, title, detail });
}

module.exports = { makeReport, addIssue };
