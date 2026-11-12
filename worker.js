/**
 * ETA — St. Thomas, USVI Transportation Service Prototype
 * Worker with D1-backed questionnaire collection, protected admin API,
 * and static asset serving for the frontend.
 *
 * API routes (handled BEFORE static assets):
 *   POST   /api/responses            — submit questionnaire (public)
 *   GET    /api/admin/responses      — list/filter (bearer token required)
 *   GET    /api/admin/export         — CSV export (bearer token required)
 *   DELETE /api/admin/responses/:id  — delete response (bearer token required)
 *
 * Page routes (served from static assets):
 *   /             — guest prototype
 *   /partnership  — partnership walkthrough (unlisted)
 *   /questionnaire — operator questionnaire
 *
 * Admin entry:
 *   /admin        — login screen; all response APIs require a bearer token
 */

const MAX_BODY = 102400;
const LANGS = ['en', 'ar'];
const MAXLEN = { submission_id: 100, questionnaire_version: 50, comments: 5000, contact_name: 200, contact_phone: 50, contact_email: 200 };

// Files that must never be served as static assets
const BLOCKED_FILES = ['/worker.js', '/wrangler.toml', '/README.txt', '/CLOUDFLARE_AGENT_INSTRUCTIONS.txt', '/ETA_Cloudflare_Frontend_Handoff.zip'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders } });

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return env.ADMIN_TOKEN && auth.slice(7) === env.ADMIN_TOKEN;
}

// ─── Validation ──────────────────────────────────────────

const allowedFields = ['submission_id', 'questionnaire_version', 'language', 'answers', 'comments', 'contact_name', 'contact_phone', 'contact_email', 'follow_up_consent', 'is_test'];

function validateSubmission(b) {
  const errors = [];
  if (!b.submission_id || typeof b.submission_id !== 'string') errors.push('submission_id is required and must be a string');
  else if (b.submission_id.length > MAXLEN.submission_id) errors.push('submission_id too long');
  if (!b.questionnaire_version || typeof b.questionnaire_version !== 'string') errors.push('questionnaire_version is required and must be a string');
  else if (b.questionnaire_version.length > MAXLEN.questionnaire_version) errors.push('questionnaire_version too long');
  if (!b.language || !LANGS.includes(b.language)) errors.push('language must be "en" or "ar"');
  if (!b.answers || typeof b.answers !== 'object' || Array.isArray(b.answers)) errors.push('answers is required and must be an object');
  else if (JSON.stringify(b.answers).length > 50000) errors.push('answers too large (max 50KB)');
  for (const [f, m] of Object.entries(MAXLEN)) {
    if (f === 'submission_id' || f === 'questionnaire_version') continue;
    const v = b[f];
    if (v != null) { if (typeof v !== 'string') errors.push(f + ' must be a string or null'); else if (v.length > m) errors.push(f + ' too long'); }
  }
  if (b.follow_up_consent != null && typeof b.follow_up_consent !== 'boolean') errors.push('follow_up_consent must be a boolean');
  if (b.is_test != null && typeof b.is_test !== 'boolean') errors.push('is_test must be a boolean');
  const unknown = Object.keys(b).filter(k => !allowedFields.includes(k));
  if (unknown.length) errors.push('unknown fields: ' + unknown.join(', '));
  return errors;
}

// ─── CSV helpers ─────────────────────────────────────────

function csvEscape(v) {
  if (v == null) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes("'")) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function flattenObject(obj, prefix = '', result = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) flattenObject(v, key, result);
    else result[key] = Array.isArray(v) ? v.join('; ') : (v ?? '');
  }
  return result;
}

// ─── API: POST /api/responses ────────────────────────────

async function handleSubmit(request, env) {
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 415);
  const cl = parseInt(request.headers.get('Content-Length') || '0');
  if (cl > MAX_BODY) return json({ error: 'body too large' }, 413);

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ error: 'body too large' }, 413);
    body = JSON.parse(text);
  } catch { return json({ error: 'invalid JSON' }, 400); }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) return json({ error: 'body must be an object' }, 400);

  const errors = validateSubmission(body);
  if (errors.length) return json({ error: 'validation failed', details: errors }, 422);

  // Duplicate check (idempotent)
  const existing = await env.eta_responses
    .prepare('SELECT id, created_at FROM responses WHERE submission_id = ?')
    .bind(body.submission_id).first();
  if (existing) return json({ success: true, id: existing.id, created_at: existing.created_at, duplicate: true, message: 'Already received.' });

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await env.eta_responses
      .prepare('INSERT INTO responses (id, submission_id, created_at, questionnaire_version, language, answers, comments, contact_name, contact_phone, contact_email, follow_up_consent, is_test) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, body.submission_id, createdAt, body.questionnaire_version, body.language, JSON.stringify(body.answers), body.comments || null, body.contact_name || null, body.contact_phone || null, body.contact_email || null, body.follow_up_consent ? 1 : 0, body.is_test ? 1 : 0)
      .run();
    return json({ success: true, id, created_at: createdAt, duplicate: false }, 201);
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      const ex2 = await env.eta_responses.prepare('SELECT id, created_at FROM responses WHERE submission_id = ?').bind(body.submission_id).first();
      if (ex2) return json({ success: true, id: ex2.id, created_at: ex2.created_at, duplicate: true, message: 'Already received.' });
    }
    return json({ error: 'save failed', details: e.message }, 500);
  }
}

// ─── API: GET /api/admin/responses ────────────────────────

async function handleList(request, env, url) {
  const p = url.searchParams;
  const limit = Math.min(parseInt(p.get('limit') || '100'), 500);
  const offset = parseInt(p.get('offset') || '0');
  const excludeTest = p.get('exclude_test') === 'true';

  let sql = 'SELECT * FROM responses';
  if (excludeTest) sql += ' WHERE is_test = 0';
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const result = await env.eta_responses.prepare(sql).bind(limit, offset).all();
  let rows = result.results.map(r => ({ ...r, answers: JSON.parse(r.answers), follow_up_consent: r.follow_up_consent === 1, is_test: r.is_test === 1 }));

  const st = p.get('service_type');
  if (st) rows = rows.filter(r => r.answers.services && r.answers.services[st] !== undefined);
  const wa = p.get('working_arrangement');
  if (wa) rows = rows.filter(r => r.answers.working_arrangement === wa);
  if (p.get('pilot_interest') === 'true') rows = rows.filter(r => r.answers.pilot_interest === true || r.answers.pilot_interest === 'true');

  return json({ responses: rows, count: rows.length });
}

// ─── API: GET /api/admin/export ──────────────────────────

async function handleExport(request, env, url) {
  const p = url.searchParams;
  const excludeTest = p.get('exclude_test') === 'true';

  let sql = 'SELECT * FROM responses';
  if (excludeTest) sql += ' WHERE is_test = 0';
  sql += ' ORDER BY created_at DESC';

  const result = await env.eta_responses.prepare(sql).all();
  const answerKeys = new Set();
  const flatRows = [];
  for (const r of result.results) {
    const answers = JSON.parse(r.answers);
    const flat = flattenObject(answers);
    Object.keys(flat).forEach(k => answerKeys.add(k));
    flatRows.push({ r, flat });
  }

  const baseHeaders = ['id', 'submission_id', 'created_at', 'questionnaire_version', 'language', 'comments', 'contact_name', 'contact_phone', 'contact_email', 'follow_up_consent', 'is_test'];
  const answerHeaders = [...answerKeys].sort();
  const headers = [...baseHeaders, ...answerHeaders.map(k => 'answer.' + k)];

  const lines = [headers.map(csvEscape).join(',')];
  for (const { r, flat } of flatRows) {
    lines.push(headers.map(h => {
      if (h.startsWith('answer.')) return csvEscape(flat[h.slice(7)] ?? '');
      if (h === 'follow_up_consent') return csvEscape(r.follow_up_consent === 1 ? 'true' : 'false');
      if (h === 'is_test') return csvEscape(r.is_test === 1 ? 'true' : 'false');
      return csvEscape(r[h]);
    }).join(','));
  }

  return new Response('\uFEFF' + lines.join('\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="eta-responses.csv"', ...corsHeaders },
  });
}

// ─── API: DELETE /api/admin/responses/:id ────────────────

async function handleDelete(env, id) {
  const result = await env.eta_responses.prepare('DELETE FROM responses WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) return json({ error: 'not found' }, 404);
  return json({ success: true, deleted: id });
}

// ─── Admin login (response data remains protected) ──────

function adminPage() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>ETA Admin</title><style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}
.response-table{max-width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:.5rem;text-align:left;font-size:.875rem}
th{background:#f5f5f5}.test{color:#999}button{cursor:pointer;padding:.25rem .5rem}
.filters{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}pre{background:#f5f5f5;padding:1rem;overflow-x:auto;font-size:.75rem}
#login{max-width:400px}#login input{width:100%;padding:.5rem;margin:.5rem 0}[hidden]{display:none!important}#status{padding:1rem;background:#fff0eb}</style></head>
<body><h1>ETA — Questionnaire responses</h1><p>Responses are stored in ETA's database, not emailed. Use View to read a complete response or Export CSV to download the answers. Test responses are excluded by default.</p>
<p id="status" role="status" aria-live="polite" hidden></p>
<div id="login"><label for="token">Admin credential</label>
<input type="password" id="token" autocomplete="off"/><button id="login-button" onclick="login()">Login</button><p>Your credential is used only for this open page and is not saved in browser storage.</p></div>
<div id="content" hidden><div class="filters">
<label><input type="checkbox" id="excludeTest" checked onchange="refresh()"> Exclude test</label>
<input type="text" id="serviceType" placeholder="Service filter" aria-label="Service filter" onchange="refresh()">
<button onclick="refresh()">Refresh</button><button onclick="exportCsv()">Export CSV</button><button onclick="logout()">Log out</button></div>
<div class="response-table"><table id="t"><thead><tr><th>ID</th><th>Created</th><th>Lang</th><th>Test</th><th>Services</th><th>Contact</th><th>Actions</th></tr></thead><tbody></tbody></table></div>
<pre id="detail">Select a response to view.</pre></div>
<script>let token='';
const el=id=>document.getElementById(id);
function notice(text){el('status').textContent=text;el('status').hidden=!text}
function logout(){token='';el('token').value='';el('login').hidden=false;el('content').hidden=true;document.querySelector('#t tbody').replaceChildren();el('detail').textContent='Select a response to view.';notice('')}
async function api(p,method='GET'){
const r=await fetch(p,{method,cache:'no-store',headers:{Authorization:'Bearer '+token}});
if(r.status===401){logout();throw new Error('Admin credential not accepted. No response data loaded.')}
if(!r.ok)throw new Error('Request failed ('+r.status+'). Please try again; no success has been confirmed.');
return r}
async function login(){const entered=el('token').value;if(!entered){notice('Enter your admin credential.');return}
token=entered;el('login-button').disabled=true;notice('');
try{await load();el('token').value='';el('login').hidden=true;el('content').hidden=false}
catch(error){token='';notice(error.message)}
finally{el('login-button').disabled=false}}
async function refresh(){notice('');try{await load()}catch(error){notice(error.message)}}
async function load(){const p=new URLSearchParams();if(document.getElementById('excludeTest').checked)p.set('exclude_test','true');
const st=document.getElementById('serviceType').value;if(st)p.set('service_type',st);
const response=await api('/api/admin/responses?'+p);const d=await response.json();
if(!Array.isArray(d.responses))throw new Error('The response list could not be read. Try refreshing.');
const tb=document.querySelector('#t tbody');tb.replaceChildren();el('detail').textContent='Select a response to view.';
for(const r of d.responses){const tr=document.createElement('tr');if(r.is_test)tr.className='test';
const sv=r.answers.services?Object.keys(r.answers.services).join(', '):'';
const ct=r.contact_name||r.contact_email||r.contact_phone||'';
for(const value of [r.id.substring(0,8)+'…',r.created_at,r.language,r.is_test?'yes':'no',sv,ct]){const cell=document.createElement('td');cell.textContent=value;tr.appendChild(cell)}
const td=document.createElement('td');const vb=document.createElement('button');vb.textContent='View';vb.onclick=()=>document.getElementById('detail').textContent=JSON.stringify(r,null,2);td.appendChild(vb);
tr.appendChild(td);tb.appendChild(tr)}
notice(d.responses.length?'Loaded '+d.responses.length+' responses.':'No responses match these filters.')}
async function exportCsv(){const p=new URLSearchParams();if(el('excludeTest').checked)p.set('exclude_test','true');
try{const r=await api('/api/admin/export?'+p);
if(!(r.headers.get('Content-Type')||'').includes('text/csv'))throw new Error('Export did not return a CSV file. No download was started.');
const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download='eta-responses.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);notice('CSV download started.')}
catch(error){notice(error.message)}}
</script></body></html>`;
}

// ─── Main handler ────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    // API routes — handled BEFORE assets
    if (path === '/api/responses' && method === 'POST') return handleSubmit(request, env);

    if (path.startsWith('/api/admin')) {
      if (!checkAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      if (path === '/api/admin/responses' && method === 'GET') return handleList(request, env, url);
      if (path === '/api/admin/export' && method === 'GET') return handleExport(request, env, url);
      const dm = path.match(/^\/api\/admin\/responses\/(.+)$/);
      if (dm && method === 'DELETE') return handleDelete(env, dm[1]);
      return json({ error: 'not found' }, 404);
    }

    // The login shell contains no responses; the API still authenticates every request.
    if (path === '/admin') {
      if (method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } });
      return new Response(adminPage(), { headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow'
      } });
    }

    // Block sensitive files from being served as assets
    if (BLOCKED_FILES.includes(path)) return new Response('Not Found', { status: 404 });

    // All other routes — serve from static assets
    return env.ASSETS.fetch(request);
  }
};
