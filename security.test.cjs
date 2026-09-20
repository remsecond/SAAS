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
async function app(t, files, extra={}) {
  const server=createServer({snapshotDir:snapshotDir(t,files),env:{},...extra});
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

// ---- personality collection: only approved, well-formed lines ever leave the server ----
const {publicCollection,checkEntry,loadCollection}=require('./personality.cjs');
const line=(over={})=>({id:'test-line',text:'A line.',surfaces:['daily_extra'],kind:'joke',tone:'app',status:'approved',source:null,reviewedAt:null,...over});

test('personality: drafts, retired lines, malformed entries and unsourced facts never render',()=>{
  const out=publicCollection({version:1,enabled:true,entries:[
    line({id:'ok-one'}),line({id:'a-draft',status:'draft'}),line({id:'gone',status:'retired'}),
    line({id:'fact-no-source',kind:'fact'}),line({id:'fact-http',kind:'fact',source:'http://example.com',reviewedAt:'2026-09-01'}),
    line({id:'fact-no-review',kind:'fact',source:'https://example.com/a'}),
    line({id:'fact-ok',kind:'fact',source:'https://example.com/a',reviewedAt:'2026-09-01'}),
    line({id:'bad-surface',surfaces:['billboard']}),line({id:'too-long',text:'x'.repeat(161)}),line({id:'ok-one',text:'duplicate id'}),
    line({id:'BAD ID'}),null,'string',
  ]});
  assert.deepEqual(out.entries.map(e=>e.id),['ok-one','fact-ok']);
  assert.equal(out.entries[0].source,null);assert.equal(out.entries[1].source,'https://example.com/a');
  assert.deepEqual(Object.keys(out.entries[0]).sort(),['id','kind','source','surfaces','text','tone'],'status, review notes and anything extra stay on the server');
  assert.ok(checkEntry(line({kind:'fact'})).length>0);
});

test('personality: off switch, disabled file, missing file and corrupt file all mean off, and coursework still loads',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-personality-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const good=path.join(dir,'good.json'),corrupt=path.join(dir,'corrupt.json'),disabled=path.join(dir,'disabled.json');
  fs.writeFileSync(good,JSON.stringify({version:1,enabled:true,entries:[line()]}));fs.writeFileSync(corrupt,'{not json');
  fs.writeFileSync(disabled,JSON.stringify({version:1,enabled:false,entries:[line()]}));
  assert.equal(loadCollection({file:good,env:{}}).entries.length,1);
  assert.equal(loadCollection({file:good,env:{HALLWAY_PERSONALITY:'off'}}).enabled,false);
  for(const file of [corrupt,disabled,path.join(dir,'missing.json')]) assert.deepEqual(loadCollection({file,env:{}}),{version:1,enabled:false,entries:[]});
  const request=await app(t,undefined,{personalityFile:corrupt});
  const response=await request('/content/personality.json');
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{version:1,enabled:false,entries:[]});
  assert.equal((await request('/api/snapshot?student=max')).status,200,'a broken joke file never blocks coursework');
});

test('personality: the shipped collection is valid, holds no student data, and serves only approved lines',async t=>{
  const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'content','personality.json'),'utf8'));
  for(const entry of raw.entries) assert.deepEqual(checkEntry(entry),[],entry.id);
  assert.equal(new Set(raw.entries.map(e=>e.id)).size,raw.entries.length);
  assert.doesNotMatch(JSON.stringify(raw),/Max|Adrian|Moyer|grade|missing|late|overdue|lazy|behind/i,'jokes are never about a student, grades or missed work');
  const request=await app(t);
  const served=await (await request('/content/personality.json')).json();
  assert.equal(served.enabled,true);
  assert.equal(served.entries.length,raw.entries.filter(e=>e.status==='approved').length);
  assert.ok(served.entries.filter(e=>e.surfaces.includes('daily_extra')).length>=14,'enough daily lines to avoid repeats for two weeks');
  assert.ok(!JSON.stringify(served).includes('"status"'));
});

// ---- Codex independent review, Sept 19: one malformed record must never take both profiles down ----
test('a null or non-object record makes only that bundle invalid; the other profile stays selectable',async t=>{
  for(const key of ['courses','assignments','resources','sources','changes']) for(const junk of [null,42,'text',[]]){
    const broken=bundleFor('max');broken[key]=[junk,...broken[key]];
    const result=validateBundle(broken,'max');
    assert.equal(result.ok,false,key+' with '+JSON.stringify(junk));assert.ok(result.errors.length>0);
  }
  const broken=bundleFor('max');broken.courses[0]=null;
  const request=await app(t,{max:JSON.stringify(broken),adrian:JSON.stringify(bundleFor('adrian'))});
  const list=await request('/api/students');
  assert.equal(list.status,200,'the profile list still loads');
  const students=(await list.json()).students;
  assert.deepEqual(students.map(s=>[s.id,s.available]),[['max',false],['adrian',true]]);
  const bad=await request('/api/snapshot?student=max');
  assert.equal(bad.status,503);assert.equal((await bad.json()).error,'snapshot_unavailable');
  assert.equal((await request('/api/snapshot?student=adrian')).status,200);
});

test('nested junk, an unusable time zone and a backwards coverage window are validation errors, never crashes',()=>{
  const cases={
    'assignment submission null':b=>{b.assignments[0].submission=null},
    'assignment feedback holds null':b=>{b.assignments[0].feedback=[null]},
    'resource availability null':b=>{b.resources[0].availability=null},
    'resource action is a string':b=>{b.resources[0].action='x'},
    'snapshot student null':b=>{b.snapshot.student=null},
    'coverage ids not strings':b=>{b.snapshot.coverage.includedCourseIds=[null]},
    'unusable time zone':b=>{b.snapshot.timeZone='Invalid/Zone'},
    'coverage window backwards':b=>{const c=b.snapshot.coverage;[c.windowStart,c.windowEnd]=[c.windowEnd,c.windowStart]},
  };
  for(const [name,breakIt] of Object.entries(cases)){
    const b=bundleFor('max');breakIt(b);let result;
    assert.doesNotThrow(()=>{result=validateBundle(b,'max')},name);
    assert.equal(result.ok,false,name);
  }
  for(const whole of [null,undefined,42,'x',[]]) assert.equal(validateBundle(whole,'max').ok,false);
  assert.equal(validateBundle(bundleFor('max'),'max').ok,true,'a good bundle still passes');
});

test('parent sign-in configuration stays outside Git and is validated before it is served', async () => {
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
  const {bundleFor}=require('./test-support/synthetic-capture.cjs');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-config-'));
  for(const id of ['max','adrian'])fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(bundleFor(id)));
  const read=async (options)=>{const server=createServer({snapshotDir:dir,...options});await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const body=await (await fetch('http://127.0.0.1:'+server.address().port+'/api/students')).json();
    await new Promise(r=>server.close(r));return body};
  assert.equal((await read({env:{}})).parentLogin,null,'no configuration means no parent link');
  assert.equal((await read({env:{HALLWAY_PARENT_LOGIN_URL:'http://canvas.test.example/login/saml/99'}})).parentLogin,null,'plain http is refused');
  assert.equal((await read({env:{HALLWAY_PARENT_LOGIN_URL:'not a url'}})).parentLogin,null,'junk is refused');
  assert.equal((await read({env:{HALLWAY_PARENT_LOGIN_URL:'https://canvas.test.example/login/saml/99'}})).parentLogin,'https://canvas.test.example/login/saml/99');
  fs.writeFileSync(path.join(dir,'config.json'),JSON.stringify({parentLoginUrl:'https://canvas.test.example/login/saml/98'}));
  assert.equal((await read({env:{}})).parentLogin,'https://canvas.test.example/login/saml/98','private config file is read');
  assert.ok(!fs.readFileSync('.gitignore','utf8').split('\n').every(l=>!l.includes('private-data')),'private-data stays git-ignored');
});
