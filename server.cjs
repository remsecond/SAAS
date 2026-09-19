'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {getDemoSnapshot} = require('./fixtures.cjs');

// One public design preview. Runtime student bundles and old access secrets
// are deliberately unused: only the reviewed demo content can be returned.
function createServer() {
  return http.createServer((req,res)=>{
    const headers = {
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'X-Frame-Options':'DENY',
      'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      'Content-Type':'text/html; charset=utf-8'
    };
    const reply=(status,body,extra={})=>{res.writeHead(status,{...headers,...extra});res.end(req.method==='HEAD'?'':body)};
    try {
      const route=new URL(req.url,'http://localhost').pathname;
      if(!['GET','HEAD'].includes(req.method)) return reply(405,'Method not allowed',{Allow:'GET, HEAD'});
      if(route==='/login') return reply(302,'',{Location:'/'});
      if(route==='/api/snapshot') return reply(200,JSON.stringify(getDemoSnapshot()),{'Content-Type':'application/json; charset=utf-8'});
      if(route==='/'||route==='/index.html') return reply(200,fs.readFileSync(path.join(__dirname,'public','index.html')));
      return reply(404,'Not found');
    } catch { return reply(500,'Hallway could not load. Please try again.'); }
  });
}
if(require.main===module)createServer().listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Hallway design preview ready'));
module.exports={createServer};
