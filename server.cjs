'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const STUDENTS = ['max', 'adrian'];
const COOKIE = '__Host-hallway';
const TTL = 8 * 60 * 60 * 1000;
function validateSnapshot(bundle, studentId) {
  const fail = () => { throw new Error('Invalid protected snapshot configuration'); };
  const snap = bundle?.snapshot;
  if (!snap || snap.student?.id !== studentId || snap.mode !== 'frozen_demo' ||
      !snap.ownership?.verified || snap.ownership.studentId !== studentId ||
      typeof snap.ownership.evidence !== 'string' || !snap.ownership.evidence.trim() ||
      !['capturedAt','demoNow'].every(k => typeof snap[k] === 'string' && /(?:Z|[+-]\d\d:\d\d)$/.test(snap[k]) && Number.isFinite(Date.parse(snap[k])))) fail();
  const groups = ['courses','assignments','resources','sources','changes'];
  const ids = {};
  for (const group of groups) {
    if (!Array.isArray(bundle[group])) fail();
    ids[group] = new Set();
    for (const record of bundle[group]) {
      if (!record || record.studentId !== studentId || typeof record.id !== 'string' || !record.id || ids[group].has(record.id)) fail();
      ids[group].add(record.id);
    }
  }
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if ('studentId' in value && value.studentId !== studentId) fail();
    for (const [key, child] of Object.entries(value)) {
      const refs = {courseId:'courses',assignmentId:'assignments',resourceId:'resources',sourceId:'sources',courseIds:'courses',includedCourseIds:'courses',assignmentIds:'assignments',resourceIds:'resources',sourceIds:'sources',evidenceSourceIds:'sources'};
      if (refs[key] && child !== null) {
        const values = Array.isArray(child) ? child : [child];
        if (values.some(id => !ids[refs[key]].has(id))) fail();
      }
      if ((key === 'url' || key === 'sourceUrl') && child !== null) {
        try { if (new URL(child).protocol !== 'https:') fail(); } catch { fail(); }
      }
      walk(child);
    }
  }
  walk(bundle);
  const nonempty = value => typeof value === 'string' && !!value.trim();
  const date = value => value === null || (typeof value === 'string' && /(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value)));
  const availability = value => value && (value.state === 'available' || (value.state === 'unavailable' && nonempty(value.reason) && nonempty(value.explanation)));
  if (!nonempty(snap.student.displayName) || !nonempty(snap.coverage?.explanation) || !nonempty(snap.coverage?.state) || !nonempty(snap.timeZone)) fail();
  try { new Intl.DateTimeFormat('en-US',{timeZone:snap.timeZone}); } catch { fail(); }
  for (const c of bundle.courses) if (!nonempty(c.title)) fail();
  for (const a of bundle.assignments) {
    if (!nonempty(a.title) || !date(a.dueAt) || (!a.dueAt && !availability(a.dueAvailability)) ||
        !['missing','not_submitted','submitted','graded','excused','unknown'].includes(a.submission?.state) ||
        !a.grade || !(a.grade.value === null || Number.isFinite(a.grade.value)) || !(a.grade.pointsPossible === null || Number.isFinite(a.grade.pointsPossible)) ||
        !availability(a.grade.availability) || !Array.isArray(a.feedback) || !Array.isArray(a.resourceIds)) fail();
    for (const f of a.feedback) if (!nonempty(f.text) || !date(f.postedAt)) fail();
  }
  for (const r of bundle.resources) if (!nonempty(r.title) || !availability(r.availability)) fail();
  for (const s of bundle.sources) if (!nonempty(s.title) || !nonempty(s.provenance) || !date(s.checkedAt)) fail();
  for (const c of bundle.changes) if (c.type !== 'due_date' || !date(c.previousValue) || !date(c.newValue) || !c.newValue || (!c.previousValue && !availability(c.previousAvailability))) fail();
  return bundle;
}
function readConfig(env) {
  if (typeof env.HALLWAY_SESSION_SECRET !== 'string' || Buffer.byteLength(env.HALLWAY_SESSION_SECRET) < 32) throw new Error('Protected session secret is missing or invalid');
  let snapshots = {};
  if (env.HALLWAY_SNAPSHOTS_JSON) {
    try {
      snapshots = JSON.parse(env.HALLWAY_SNAPSHOTS_JSON);
      if (!snapshots || Array.isArray(snapshots) || typeof snapshots !== 'object' || Object.keys(snapshots).some(k => !STUDENTS.includes(k))) throw new Error();
      for (const student of Object.keys(snapshots)) validateSnapshot(snapshots[student], student);
    } catch { throw new Error('Invalid protected snapshot configuration'); }
  }
  return { secret: env.HALLWAY_SESSION_SECRET, snapshots };
}
const loginPage = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hallway · Sign in</title><style>body{font:1.1rem system-ui;background:#141410;color:#f5f3e9;margin:auto;padding:2rem 1rem;max-width:26rem}label,select,button{display:block;width:100%;box-sizing:border-box;margin:.7rem 0;font:inherit}select,button{padding:.8rem;border-radius:.6rem}button{background:#edb66a;color:#171712;border:0}p{line-height:1.5}a{color:#edb66a}</style><h1>Hallway</h1><p>Know what you're walking into.</p><p>A frozen school snapshot. No live updates.</p><form method="post" action="/login"><label for="studentId">Your name</label><select name="studentId" id="studentId"><option value="max">Max</option><option value="adrian">Adrian</option></select><button>Open my snapshot</button></form></html>`;
function createServer({ env = process.env, now = Date.now, sessionTtl = TTL, getFixture } = {}) {
  const config = readConfig(env);
  const fixture = getFixture || require('./fixtures.cjs').getFixture;
  const sessions = new Map(), attempts = new Map();
  let globalAttempts = {count:0,until:now()+15*60*1000};
  const sign = token => crypto.createHmac('sha256', config.secret).update(token).digest('hex');
  function session(req) {
    const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
    if (!cookie) return null;
    const value = cookie.slice(COOKIE.length + 1);
    if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(value)) return null;
    const [token, sig] = value.split('.');
    if (!/^[a-f0-9]{64}$/.test(token || '') || !/^[a-f0-9]{64}$/.test(sig || '') || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(token)))) return null;
    const entry = sessions.get(token);
    if (!entry || entry.expires <= now()) { sessions.delete(token); return null; }
    return { ...entry, token };
  }
  function reply(res, status, body, extra = {}) {
    res.writeHead(status, { 'Cache-Control':'no-store', 'Pragma':'no-cache', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'X-Frame-Options':'DENY', 'Strict-Transport-Security':'max-age=31536000', 'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'Content-Type':'text/html; charset=utf-8', ...extra });
    res.end(body);
  }
  function sameOrigin(req) {
    if (req.headers['sec-fetch-site'] === 'cross-site') return false;
    if (req.headers['sec-fetch-site'] === 'same-origin') return true;
    if (!req.headers.origin) return true;
    try { const origin = new URL(req.headers.origin); return origin.host === req.headers.host && (origin.protocol === 'https:' || (origin.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(origin.hostname))); } catch { return false; }
  }
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'), route = url.pathname;
      if (!['GET','HEAD','POST'].includes(req.method)) return reply(res,405,'Method not allowed',{Allow:'GET, HEAD, POST'});
      if (req.method === 'POST' && !sameOrigin(req)) return reply(res,403,'Request rejected');
      if (route === '/login' && ['GET','HEAD'].includes(req.method)) return reply(res,200,req.method === 'HEAD' ? '' : loginPage);
      if (route === '/login' && req.method === 'POST') {
        // The transport peer is the trusted rate-limit key. Never trust client-supplied forwarding headers.
        // Behind a shared proxy this intentionally limits that proxy as a whole.
        const ip = req.socket.remoteAddress || 'unknown';
        if (globalAttempts.until <= now()) globalAttempts = {count:0,until:now()+15*60*1000};
        if (globalAttempts.count >= 100) return reply(res,429,'Too many attempts. Try again in 15 minutes.',{'Retry-After':'900'});
        for (const [key, entry] of attempts) if (entry.until <= now()) attempts.delete(key);
        for (const [key, entry] of sessions) if (entry.expires <= now()) sessions.delete(key);
        let limit = attempts.get(ip);
        if (!limit) { limit = { count:0, until:now()+15*60*1000 }; attempts.set(ip,limit); }
        if (limit.count >= 10 || globalAttempts.count >= 100) return reply(res,429,'Too many attempts. Try again in 15 minutes.',{'Retry-After':'900'});
        limit.count++;
        globalAttempts.count++;
        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 4096) return reply(res,413,'Request too large'); }
        let values;
        try { values = (req.headers['content-type'] || '').includes('application/json') ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body)); } catch { return reply(res,400,'Invalid request'); }
        const student = values?.studentId;
        if (!STUDENTS.includes(student)) return reply(res,401,'Name was not accepted. <a href="/login">Try again</a>');
        const old = session(req); if (old) sessions.delete(old.token);
        if (sessions.size >= 1000) return reply(res,503,'Please try again later.');
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token,{student,expires:now()+sessionTtl});
        return reply(res,303,'',{'Location':'/','Set-Cookie':`${COOKIE}=${token}.${sign(token)}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(sessionTtl/1000)}`});
      }
      if (route === '/logout' && req.method === 'POST') {
        const entry = session(req); if (entry) sessions.delete(entry.token);
        return reply(res,303,'',{'Location':'/login','Set-Cookie':`${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`});
      }
      if (!['GET','HEAD'].includes(req.method)) return reply(res,405,'Method not allowed');
      if (!['/','/index.html','/api/snapshot'].includes(route)) return reply(res,404,'Not found');
      const entry = session(req);
      if (!entry) return route === '/api/snapshot' ? reply(res,401,JSON.stringify({error:'Sign in required'}),{'Content-Type':'application/json'}) : reply(res,303,'',{'Location':'/login'});
      if (route === '/api/snapshot') return reply(res,200,req.method === 'HEAD' ? '' : JSON.stringify(config.snapshots[entry.student] || fixture(entry.student)),{'Content-Type':'application/json; charset=utf-8'});
      return reply(res,200,req.method === 'HEAD' ? '' : fs.readFileSync(path.join(__dirname,'public','index.html')));
    } catch { if (!res.headersSent) reply(res,500,'Unable to open Hallway. Please try again.'); else res.end(); }
  });
}
if (require.main === module) {
  try { createServer().listen(Number(process.env.PORT || 3000),'0.0.0.0',()=>console.log('Hallway access gate ready')); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { createServer, validateSnapshot, readConfig };
