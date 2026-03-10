// extension/content_script.js
(function () {
  const report = {
    url: location.href,
    timestamp: new Date().toISOString(),
    issues: []
  };

  function add(sev, id, title, detail) {
    report.issues.push({ severity: sev, id, title, detail });
  }

  // Mixed content: any http: resources on https page
  try {
    if (location.protocol === 'https:') {
      const bad = Array.from(document.querySelectorAll('*[src], link[href]'))
        .map(el => el.src || el.href)
        .filter(Boolean)
        .filter(u => u.startsWith('http:'));
      if (bad.length) add('high', 'mixed-content', 'Mixed content', `Found ${bad.length} HTTP resources: ${bad.slice(0,5).join(', ')}${bad.length>5?'...':''}`);
    }
  } catch(e){}

  // Missing common headers cannot be read from content script; mark as "unknown" so user knows CLI/server check needed
  add('info', 'headers-need-check', 'Headers check required', 'Response headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) cannot be read by content script — use CLI or server-side check.');

  // Forms insecure: password forms using GET or action that is http
  try {
    const forms = Array.from(document.forms).map(f => ({
      method: (f.method || 'GET').toUpperCase(),
      action: f.action || location.href,
      hasPassword: !!f.querySelector('input[type="password"]')
    }));
    forms.filter(f => f.hasPassword && (f.method === 'GET' || f.action.startsWith('http:'))).forEach((f,i)=>{
      add('high','insecure-form','Insecure form', `Form #${i+1} uses method=${f.method} action=${f.action}`);
    });
  } catch(e){}

  // Inline scripts: script tags with inline content or use of innerHTML/eval (basic indicators)
  try {
    const inlineScripts = Array.from(document.scripts).filter(s => !s.src).length;
    if (inlineScripts) add('medium','inline-scripts','Inline scripts', `Found ${inlineScripts} inline <script> tags.`);
    // detect innerHTML usage in page - basic heuristic: presence of "innerHTML" in inline scripts or event handlers
    const html = document.documentElement.innerHTML;
    if (html.includes('innerHTML') || html.includes('eval(')) add('medium','xss-indicator','XSS indicators', 'Detected innerHTML or eval in page HTML; review inline JS.');
  } catch(e){}

  // Cookie flags — content scripts can't see other cookies' flags; but can check document.cookie exists (incomplete)
  try {
    const cookies = document.cookie.split(';').filter(Boolean).map(c=>c.trim());
    if (cookies.length) add('info','cookie-indicator','Cookie presence', `Found ${cookies.length} cookie(s) via document.cookie (flags not visible from page JS). Use CLI/server to check Secure/HttpOnly/SameSite.`);
  } catch(e){}

  // Image upload inputs (unsafe image upload indicator)
  try {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).filter(i=>i.accept && i.accept.includes('image'));
    if (fileInputs.length) add('medium','unsafe-image-upload','Image upload present', `Found ${fileInputs.length} image file input(s). No server-side checks confirmed.`);
  } catch(e){}

  // Expose
  window.__PRESCAN = report;
})();
