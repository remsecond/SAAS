'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {createStore} = require('./bundles.cjs');

// Serves each student's captured coursework bundle. There are no passcodes and
// no fallback content: a missing or invalid bundle is reported as unavailable.
// Old access secrets and HALLWAY_SNAPSHOTS_JSON are deliberately unused.
function createServer({snapshotDir}={}) {
  const store=createStore({dir:snapshotDir});
  const json={'Content-Type':'application/json; charset=utf-8'};
  return http.createServer((req,res)=>{
    const headers = {
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'X-Frame-Options':'DENY',
      // Replit injects its feedback widget into the published page. The widget needs its
      // script (replit-cdn.com), its API (replit.com), its font and blob: screenshots.
      // Replit's analytics script (i.replit.com) is deliberately NOT allowed.
      'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline' https://replit-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://replit.com; img-src 'self' data: blob:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      'Content-Type':'text/html; charset=utf-8'
    };
    const reply=(status,body,extra={})=>{res.writeHead(status,{...headers,...extra});res.end(req.method==='HEAD'?'':body)};
    try {
      const url=new URL(req.url,'http://localhost'),route=url.pathname;
      if(!['GET','HEAD'].includes(req.method)) return reply(405,'Method not allowed',{Allow:'GET, HEAD'});
      const assets={'/saas.css':'text/css; charset=utf-8','/fonts/figtree-400.woff2':'font/woff2','/fonts/figtree-700.woff2':'font/woff2','/fonts/montserrat-700.woff2':'font/woff2','/fonts/montserrat-900.woff2':'font/woff2'};
      if(Object.hasOwn(assets,route)) return reply(200,fs.readFileSync(path.join(__dirname,'public',route)),{'Content-Type':assets[route]});
      if(route==='/login') return reply(302,'',{Location:'/'});
      if(route==='/api/students') return reply(200,JSON.stringify({students:store.list()}),json);
      if(route==='/api/snapshot') {
        const result=store.read(url.searchParams.get('student')||'');
        if(result.status==='ok') return reply(200,JSON.stringify(result.bundle),json);
        if(result.status==='unknown_student') return reply(404,JSON.stringify({error:'unknown_student',explanation:'Choose Max or Adrian.'}),json);
        if(result.status==='invalid') console.error('Hallway: snapshot for '+result.student.id+' failed validation ('+result.errors.length+' problem(s)): '+result.errors.slice(0,5).join('; '));
        return reply(503,JSON.stringify({error:'snapshot_unavailable',student:result.student.id,explanation:result.status==='missing'?result.student.displayName+"'s coursework has not been loaded into Hallway yet.":result.student.displayName+"'s saved coursework did not pass Hallway's checks, so it is not being shown."}),json);
      }
      if(route==='/'||route==='/index.html') return reply(200,fs.readFileSync(path.join(__dirname,'public','index.html')));
      return reply(404,'Not found');
    } catch { return reply(500,'Hallway could not load. Please try again.'); }
  });
}
if(require.main===module)createServer().listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Hallway ready'));
module.exports={createServer};
