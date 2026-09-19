'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {createServer,readConfig,validateSnapshot} = require('./server.cjs');
const env = {HALLWAY_SESSION_SECRET:crypto.randomBytes(32).toString('hex')};
async function app(t) {
  let time=Date.now();
  const server=createServer({env,now:()=>time,sessionTtl:10000});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(path,options={})=>fetch(base+path,{redirect:'manual',...options});
  const login=(studentId,headers={})=>request('/login',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({studentId})});
  return {request,login,advance:()=>{time+=11000}};
}
const cookie = response => response.headers.get('set-cookie').split(';')[0];
test('configuration fails closed and never includes configuration contents in errors',()=>{
  assert.throws(()=>readConfig({}),/secret/);
  assert.throws(()=>readConfig({...env,HALLWAY_SNAPSHOTS_JSON:'SECRET INVALID'}),{message:'Invalid protected snapshot configuration'});
});
test('unauthenticated pages/data blocked; static assets and fixture files unavailable',async t=>{
  const {request}=await app(t);
  const root=await request('/');assert.equal(root.status,200);assert((await root.text()).includes('Open my snapshot'));assert.equal(root.headers.get('cache-control'),'no-store');
  const index=await request('/index.html');assert.equal(index.status,303);assert.equal(index.headers.get('location'),'/login');assert.equal(index.headers.get('cache-control'),'no-store');
  assert.equal((await request('/api/snapshot')).status,401);
  for(const path of ['/fixtures.cjs','/public/index.html','/.env','/server.cjs','/snapshots/max.json']) assert.equal((await request(path)).status,404);
});
test('invalid identity rejected; session controls student despite tampered requests',async t=>{
  const {request,login}=await app(t);
  assert.equal((await login('other')).status,401);
  const maxLogin=await login('max');assert.equal(maxLogin.status,303);
  const set=maxLogin.headers.get('set-cookie');for(const flag of ['Secure','HttpOnly','SameSite=Strict','Path=/','Max-Age=10'])assert(set.includes(flag));
  const maxCookie=cookie(maxLogin),adrianCookie=cookie(await login('adrian'));
  for(const [student,token] of [['max',maxCookie],['adrian',adrianCookie]]){
    const response=await request('/api/snapshot?studentId='+ (student==='max'?'adrian':'max'),{headers:{Cookie:token,'X-Student-Id':'other'}});
    assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
    const data=await response.json();assert.equal(data.snapshot.student.id,student);
    for(const group of ['courses','assignments','resources','sources','changes']) for(const record of data[group]) assert.equal(record.studentId,student);
    const page=await request('/index.html',{headers:{Cookie:token}});assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');
  }
  const tampered=maxCookie.slice(0,-1)+(maxCookie.endsWith('0')?'1':'0');
  assert.equal((await request('/api/snapshot',{headers:{Cookie:tampered}})).status,401);
  assert.equal((await request('/api/snapshot',{headers:{Cookie:maxCookie+'.suffix'}})).status,401);
  assert.equal((await request('/api/snapshot',{headers:{Cookie:'__Host-hallway=broken'}})).status,401);
});
test('expiration, logout, and session rotation invalidate earlier session',async t=>{
  const {request,login,advance}=await app(t);
  const old=cookie(await login('max'));
  const replacement=cookie(await login('max',{Cookie:old}));
  assert.equal((await request('/api/snapshot',{headers:{Cookie:old}})).status,401);
  const out=await request('/logout',{method:'POST',headers:{Cookie:replacement}});assert.equal(out.status,303);assert(out.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal((await request('/api/snapshot',{headers:{Cookie:replacement}})).status,401);
  const expiring=cookie(await login('adrian'));advance();
  assert.equal((await request('/api/snapshot',{headers:{Cookie:expiring}})).status,401);
});
test('rate limits reject login floods, including forged forwarding headers',async t=>{
  const {login}=await app(t);
  for(let i=0;i<10;i++) assert.equal((await login('max',{'X-Forwarded-For':'192.0.2.'+i})).status,303);
  const limited=await login('max');assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'900');
});
test('cross-origin mutations and oversized bodies rejected',async t=>{
  const {request,login}=await app(t);
  assert.equal((await login('max',{Origin:'https://evil.example'})).status,403);
  assert.equal((await login('max',{Origin:'https://browser-facing-preview.example','Sec-Fetch-Site':'same-origin'})).status,303);
  assert.equal((await request('/logout',{method:'POST',headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  assert.equal((await request('/login',{method:'POST',body:'x'.repeat(5000)})).status,413);
});
test('protected snapshots require verified ownership and resolving references',()=>{
  const good={snapshot:{student:{id:'max',displayName:'Max'},timeZone:'America/Los_Angeles',coverage:{state:'partial',explanation:'Reviewed partial snapshot'},mode:'frozen_demo',ownership:{verified:true,studentId:'max',evidence:'Ownership reviewed against source record'},capturedAt:'2026-09-18T12:00:00-07:00',demoNow:'2026-09-18T13:00:00-07:00'},courses:[],assignments:[],resources:[],sources:[],changes:[]};
  assert.equal(validateSnapshot(good,'max'),good);
  const changed=change=>{const clone=structuredClone(good);change(clone);assert.throws(()=>validateSnapshot(clone,'max'),/Invalid protected snapshot/)};
  changed(x=>x.snapshot.student.id='adrian');changed(x=>x.snapshot.ownership.verified=false);
  changed(x=>x.snapshot.timeZone='Invalid/Zone');changed(x=>delete x.snapshot.coverage);
  changed(x=>x.snapshot.demoNow='not-a-date');
  changed(x=>x.assignments.push({id:'a',studentId:'adrian'}));
  changed(x=>x.assignments.push({id:'a',studentId:'max',courseId:'missing'}));
  changed(x=>x.resources.push({id:'r',studentId:'max',action:{url:'javascript:alert(1)'}}));
});
