'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createServer} = require('./server.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {bundleFor} = require('./test-support/synthetic-capture.cjs');
const {validateBundle} = require('./bundles.cjs');
const {buildBundle} = require('./tools/build-bundle.cjs');
const {rawCapture} = require('./test-support/synthetic-capture.cjs');
function snapshotDir(t, files = {max: JSON.stringify(bundleFor('max')), adrian: JSON.stringify(bundleFor('adrian'))}) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  for(const [name,text] of Object.entries(files)) fs.writeFileSync(path.join(dir,name+'.json'),text);
  return dir;
}
async function app(t, files) {
  const server=createServer({snapshotDir:snapshotDir(t,files)});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  return (path,options={})=>fetch(base+path,{redirect:'manual',...options});
}
test('app opens without sign-in; legacy login redirects home; no passcode fields',async t=>{
  const request=await app(t);
  for(const path of ['/','/index.html']) {
    const response=await request(path);
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-type'),/text\/html/);
    assert.doesNotMatch(await response.text(),/data-logout|type=["']password|passcode/i);
  }
  const login=await request('/login');
  assert.equal(login.status,302);assert.equal(login.headers.get('location'),'/');
  const students=await (await request('/api/students')).json();
  assert.deepEqual(students.students.map(s=>[s.id,s.displayName,s.available]),[['max','Max',true],['adrian','Adrian',true]]);
});
test('each student parameter returns only that student\'s records; headers and cookies choose nothing',async t=>{
  const request=await app(t);
  for(const [id,own,other] of [['max','SYNTHETIC-M','SYNTHETIC-A'],['adrian','SYNTHETIC-A','SYNTHETIC-M']]) {
    const response=await request('/api/snapshot?student='+id,{headers:{'X-Student-Id':id==='max'?'adrian':'max',Cookie:'__Host-hallway=old-session'}});
    assert.equal(response.status,200);
    assert.equal(response.headers.get('set-cookie'),null);
    const text=await response.text();
    assert.match(text,new RegExp(own));assert.doesNotMatch(text,new RegExp(other));
    assert.equal(JSON.parse(text).snapshot.student.id,id);
  }
  for(const bad of ['','other','../max','max.json','MAX','max%00','adrian/../max']) {
    const response=await request('/api/snapshot?student='+bad);
    assert.equal(response.status,404,bad);
    assert.doesNotMatch(await response.text(),/SYNTHETIC/);
  }
  assert.equal((await request('/api/snapshot?studentId=max')).status,404,'legacy parameter name selects nothing');
});
test('missing, corrupt, mislabeled or example bundles are unavailable and never replaced with fixtures',async t=>{
  const mislabeled=JSON.stringify(bundleFor('adrian'));
  const example=JSON.stringify({...bundleFor('max'),exampleOnly:true});
  for(const [files,label] of [[{adrian:JSON.stringify(bundleFor('adrian'))},'missing'],[{max:'{not json',adrian:'[]'},'corrupt'],[{max:mislabeled},'mislabeled'],[{max:example},'example']]) {
    const request=await app(t,files);
    const response=await request('/api/snapshot?student=max');
    assert.equal(response.status,503,label);
    const body=await response.json();
    assert.equal(body.error,'snapshot_unavailable');assert.match(body.explanation,/Max/);
    assert.equal(Object.hasOwn(body,'assignments'),false);
    assert.doesNotMatch(JSON.stringify(body),/SYNTHETIC|Greenhouse|exampleOnly/);
    const listed=(await (await request('/api/students')).json()).students.find(s=>s.id==='max');
    assert.equal(listed.available,false);assert.equal(listed.capturedAt,null);
  }
});
test('legacy runtime secrets are never read or published',async t=>{
  const marker='PRIVATE_RUNTIME_RECORD_MUST_NOT_APPEAR';
  process.env.HALLWAY_SNAPSHOTS_JSON=JSON.stringify({max:{snapshot:{student:{displayName:marker}},assignments:[{title:marker}]}});
  process.env.HALLWAY_SESSION_SECRET=marker;
  t.after(()=>{delete process.env.HALLWAY_SNAPSHOTS_JSON;delete process.env.HALLWAY_SESSION_SECRET;});
  const request=await app(t);
  for(const path of ['/api/students','/api/snapshot?student=max','/']) assert.doesNotMatch(await (await request(path)).text(),new RegExp(marker));
});
test('server does not expose source files, private data, environment or arbitrary snapshots',async t=>{
  const request=await app(t);
  for(const path of ['/bundles.cjs','/public/index.html','/.env','/server.cjs','/snapshots/max.json','/private-data/snapshots/max.json','/private-data/access-x/runtime.env','/package.json','/api/snapshot/max','/max.json']) {
    assert.equal((await request(path)).status,404,path);
  }
  assert.equal((await request('/api/snapshot?student=max',{method:'POST'})).status,405);
});
test('bundle validation enforces identity, references, reasons, timestamps and no grades',()=>{
  const broken=(edit,pattern)=>{const b=bundleFor('max');edit(b);const r=validateBundle(b,'max');assert.equal(r.ok,false);assert.match(r.errors.join('\n'),pattern);};
  assert.equal(validateBundle(bundleFor('max'),'max').ok,true);
  assert.equal(validateBundle(bundleFor('max'),'adrian').ok,false);
  broken(b=>{b.assignments[0].studentId='adrian'},/different student/);
  broken(b=>{b.resources[0].studentId='adrian'},/different student/);
  broken(b=>{b.assignments[0].courseId='nope'},/course does not resolve/);
  broken(b=>{b.assignments[0].resourceIds.push('nope')},/resource nope does not resolve/);
  broken(b=>{b.assignments[0].sourceId='nope'},/source does not resolve/);
  broken(b=>{b.snapshot.capturedAt=null},/capturedAt/);
  broken(b=>{b.snapshot.demoNow='2026-09-18 13:00'},/demoNow/);
  broken(b=>{b.snapshot.coverage.state='not_captured'},/coverage state/);
  broken(b=>{b.assignments[0].grade={value:'A'}},/grades/);
  broken(b=>{const a=b.assignments.find(a=>!a.dueAt);a.dueAvailability={state:'unavailable',reason:'because',explanation:''}},/reason invalid|explanation required/);
  broken(b=>{b.sources[0].url='http://insecure.example'},/https/);
  broken(b=>{const r=b.resources.find(r=>r.availability.state==='available');r.body=''},/needs captured content/);
  broken(b=>{b.assignments.push({...b.assignments[0]})},/duplicate ids/);
});
test('builder refuses captures that are for the wrong student, mixed, or incomplete',()=>{
  assert.throws(()=>buildBundle('max',rawCapture('adrian')),/not Max/);
  const mixed=rawCapture('max');mixed.assignments[1].submission.userId=2222;
  assert.throws(()=>buildBundle('max',mixed),/another student/);
  const foreign=rawCapture('max');foreign.assignments[0].courseId=601;
  assert.throws(()=>buildBundle('max',foreign),/not enrolled/);
  const observer=rawCapture('max');observer.courses[0].enr='observer:999';
  assert.throws(()=>buildBundle('max',observer),/not a student enrollment/);
  const failed=rawCapture('max');failed.errors.push({what:'modules'});
  assert.throws(()=>buildBundle('max',failed),/re-capture/);
  const built=buildBundle('max',rawCapture('max'),{reference:'2026-09-21T08:00:00-07:00'});
  assert.equal(built.snapshot.capturedAt,'2026-09-19T02:35:15.414Z');
  assert.equal(built.snapshot.demoNow,'2026-09-21T15:00:00.000Z','reference clock is kept separate from capture time');
  assert.doesNotMatch(JSON.stringify(built),/"grade"|"score"|points_possible/);
  assert.doesNotMatch(JSON.stringify(built.resources)+JSON.stringify(built.sources),/mailto:|http:\/\//,'mailto and non-https links never become link resources');
});

test('SAAS theme and bundled fonts load through the public server',async t=>{
  const request=await app(t);
  const page=await request('/');
  assert.match(page.headers.get('content-security-policy'),/style-src 'self'/);
  assert.match(page.headers.get('content-security-policy'),/font-src 'self'/);
  const csp=page.headers.get('content-security-policy');
  assert.match(csp,/script-src 'unsafe-inline';/,'no outside scripts: Replit feedback widget and analytics stay blocked');
  assert.match(csp,/connect-src 'self';/);
  assert.doesNotMatch(csp,/https?:|replit|\*|unsafe-eval/,'no outside hosts, wildcards or eval');
  assert.match(csp,/default-src 'none'/);assert.match(csp,/frame-ancestors 'none'/);
  const icon=await request('/apple-touch-icon.png');assert.equal(icon.status,200);assert.equal(icon.headers.get('content-type'),'image/png');
  assert.match(await page.text(),/href="\/saas.css"/);
  const css=await request('/saas.css');
  assert.equal(css.status,200);
  assert.match(css.headers.get('content-type'),/text\/css/);
  const stylesheet=await css.text();
  const fonts=[...stylesheet.matchAll(/url\("(\/fonts\/[^" ]+)"\)/g)].map(m=>m[1]);
  assert.equal(fonts.length,4);
  for(const path of fonts){
    const response=await request(path);
    assert.equal(response.status,200);
    assert.equal(response.headers.get('content-type'),'font/woff2');
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,4).toString(),'wOF2');
  }
});
