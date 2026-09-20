'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {createStore} = require('./bundles.cjs');
const {loadCollection} = require('./personality.cjs');

// Serves each student's captured coursework bundle. There are no passcodes and
// no fallback content: a missing or invalid bundle is reported as unavailable.
// Old access secrets and HALLWAY_SNAPSHOTS_JSON are deliberately unused.
// The school's parent sign-in address is site configuration, not code: it names the
// school, so it lives in HALLWAY_PARENT_LOGIN_URL or private-data/config.json (both
// outside Git) and never in this repository. Missing or unusable config simply means
// the parent link is not offered; the students' own sign-in link is unaffected.
function parentLoginUrl({snapshotDir,env}) {
  let value=env&&env.HALLWAY_PARENT_LOGIN_URL;
  // Same directory the bundles come from, resolved the same way, so production
  // (which passes no snapshotDir) reads the deployed private folder too.
  const dir=path.resolve(snapshotDir||(env&&env.HALLWAY_SNAPSHOT_DIR)||path.join(__dirname,'private-data','snapshots'));
  if(!value) try {
    value=JSON.parse(fs.readFileSync(path.join(dir,'config.json'),'utf8')).parentLoginUrl;
  } catch { value=null; }
  try { const u=new URL(String(value)); return u.protocol==='https:'?u.href:null; } catch { return null; }
}
function createServer({snapshotDir,personalityFile,env=process.env}={}) {
  const store=createStore({dir:snapshotDir});
  const parentLogin=parentLoginUrl({snapshotDir,env});
  const json={'Content-Type':'application/json; charset=utf-8'};
  return http.createServer((req,res)=>{
    const headers = {
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'X-Frame-Options':'DENY',
      // Replit injects a feedback widget and an analytics script into published pages.
      // Both are deliberately NOT allowed: the widget needs a Replit account, which the
      // students do not have (Roberto, Sept 18: pull it for now). Nothing outside loads.
      'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      'Content-Type':'text/html; charset=utf-8'
    };
    const reply=(status,body,extra={})=>{res.writeHead(status,{...headers,...extra});res.end(req.method==='HEAD'?'':body)};
    try {
      const url=new URL(req.url,'http://localhost'),route=url.pathname;
      if(!['GET','HEAD'].includes(req.method)) return reply(405,'Method not allowed',{Allow:'GET, HEAD'});
      const assets={'/saas.css':'text/css; charset=utf-8','/fonts/figtree-400.woff2':'font/woff2','/fonts/figtree-700.woff2':'font/woff2','/fonts/montserrat-700.woff2':'font/woff2','/fonts/montserrat-900.woff2':'font/woff2','/apple-touch-icon.png':'image/png'};
      if(Object.hasOwn(assets,route)) return reply(200,fs.readFileSync(path.join(__dirname,'public',route)),{'Content-Type':assets[route]});
      if(route==='/login') return reply(302,'',{Location:'/'});
      if(route==='/content/personality.json') return reply(200,JSON.stringify(loadCollection({file:personalityFile,env})),json);
      if(route==='/api/students') return reply(200,JSON.stringify({students:store.list(),parentLogin}),json);
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
