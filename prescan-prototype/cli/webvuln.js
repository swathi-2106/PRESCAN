// cli/webvuln.js
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { program } = require('commander');
const { makeReport, addIssue } = require('../shared/rules');

program
  .requiredOption('-t, --target <url>')
  .option('-o, --output <file>', 'output JSON report')
  .parse(process.argv);

(async ()=>{
  const { target, output } = program.opts();
  const report = makeReport(target);

  let res, text;
  try {
    res = await fetch(target, { redirect: 'follow' });
    text = await res.text();
  } catch (e) {
    addIssue(report, 'high', 'fetch-failed', 'Failed to fetch target', String(e));
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  // Check headers
  const headers = res.headers.raw ? res.headers.raw() : {};
  const h = {};
  Object.keys(headers).forEach(k=>h[k.toLowerCase()] = headers[k].join('; '));
  if (!h['content-security-policy']) addIssue(report,'high','missing-csp','Missing CSP','No Content-Security-Policy header');
  if (!h['strict-transport-security']) addIssue(report,'high','missing-hsts','Missing HSTS','No Strict-Transport-Security header');
  if (!h['x-frame-options'] && !h['content-security-policy']) addIssue(report,'medium','missing-frame-options','Missing X-Frame-Options','No X-Frame-Options and no CSP frame-ancestors');
  if (!h['x-content-type-options']) addIssue(report,'medium','missing-cto','Missing X-Content-Type-Options','No X-Content-Type-Options header');

  // Parse HTML
  const dom = new JSDOM(text, { url: target });
  const doc = dom.window.document;

  // Mixed content: if target is https, any http: resource
  if (new URL(target).protocol === 'https:') {
    const resources = Array.from(doc.querySelectorAll('[src], link[href]'))
      .map(el => el.getAttribute('src') || el.getAttribute('href'))
      .filter(Boolean)
      .filter(u => u.startsWith('http:'));
    if (resources.length) addIssue(report,'high','mixed-content','Mixed content', `Found ${resources.length} HTTP resources: ${resources.slice(0,5).join(', ')}${resources.length>5?'...':''}`);
  }

  // Forms
  const forms = Array.from(doc.forms).map(f => ({ method: (f.method||'GET').toUpperCase(), action: f.action||target, hasPassword: !!f.querySelector('input[type="password"]') }));
  forms.filter(f => f.hasPassword && (f.method === 'GET' || f.action.startsWith('http:'))).forEach((f,i)=>{
    addIssue(report,'high','insecure-form','Insecure form', `Form #${i+1}: method=${f.method} action=${f.action}`);
  });

  // Inline scripts
  const inlineCount = Array.from(doc.scripts).filter(s => !s.src).length;
  if (inlineCount) addIssue(report,'medium','inline-scripts','Inline scripts', `Found ${inlineCount} inline <script> tags.`);

  // SQL-injection indicator in code: search for common patterns (static, naive)
  const suspiciousSql = /(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+.+SET).*(\+|concat\(|'\s*\+\s*|`)/i;
  if (suspiciousSql.test(text)) addIssue(report,'medium','sql-indicator','SQL-string building','Page contains patterns that may indicate string-built SQL (static scan heuristic).');

  // Password hashing indicator (naive)
  if (!/bcrypt|pbkdf2|argon2/i.test(text)) addIssue(report,'info','password-hash-check','Password hashing indicator','No server-side hashing library names found in HTML/JS (static heuristic).');

  // File upload inputs
  const fileInputs = Array.from(doc.querySelectorAll('input[type="file"]')).filter(i=> (i.getAttribute('accept') || '').includes('image'));
  if (fileInputs.length) addIssue(report,'medium','unsafe-image-upload','Image upload inputs', `Found ${fileInputs.length} image file inputs (no server-side validation detected).`);

  // Cookies from Set-Cookie header
  const setCookies = res.headers.raw()['set-cookie'] || [];
  setCookies.forEach((c,i)=>{
    if (!/;\s*Secure/i.test(c)) addIssue(report,'high','cookie-no-secure','Cookie missing Secure', `Set-Cookie #${i+1} does not have Secure flag: ${c.split(';')[0]}`);
    if (!/;\s*HttpOnly/i.test(c)) addIssue(report,'high','cookie-no-httponly','Cookie missing HttpOnly', `Set-Cookie #${i+1} does not have HttpOnly flag: ${c.split(';')[0]}`);
    if (!/;\s*SameSite=/i.test(c)) addIssue(report,'medium','cookie-no-samesite','Cookie missing SameSite', `Set-Cookie #${i+1} missing SameSite flag.`);
  });

  // Output
  if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();



