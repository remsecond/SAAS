'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createServer} = require('./server.cjs');
async function app(t, env = {}) {
  const server=createServer({env});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  return (path,options={})=>fetch(base+path,{redirect:'manual',...options});
}
test('demo opens without sign-in or configuration and legacy login redirects home',async t=>{
  const request=await app(t);
  for(const path of ['/','/index.html']) {
    const response=await request(path);
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-type'),/text\/html/);
    const html=await response.text();
    assert.doesNotMatch(html,/data-logout|type=["']password|name=["']studentId/);
  }
  const login=await request('/login');
  assert.equal(login.status,302);assert.equal(login.headers.get('location'),'/');
  assert.equal((await request('/api/snapshot')).status,200);
});
test('identity query, headers and old cookies cannot choose a different demo',async t=>{
  const request=await app(t);
  const expected=await (await request('/api/snapshot')).json();
  for(const id of ['max','adrian','other']) {
    const response=await request('/api/snapshot?studentId='+id,{headers:{'X-Student-Id':id,Cookie:'__Host-hallway=old-session'}});
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),expected);
    assert.equal(response.headers.get('set-cookie'),null);
  }
});
test('legacy runtime personal snapshot configuration is never published',async t=>{
  const marker='PRIVATE_RUNTIME_RECORD_MUST_NOT_APPEAR';
  const request=await app(t,{HALLWAY_SNAPSHOTS_JSON:JSON.stringify({max:{snapshot:{student:{displayName:marker}},assignments:[{title:marker}]}}),HALLWAY_SESSION_SECRET:marker});
  const response=await request('/api/snapshot');
  assert.equal(response.status,200);
  assert.doesNotMatch(await response.text(),new RegExp(marker));
});
test('public server does not expose source files, environment or arbitrary snapshots',async t=>{
  const request=await app(t);
  for(const path of ['/fixtures.cjs','/public/index.html','/.env','/server.cjs','/snapshots/max.json','/package.json','/api/snapshot/max']) {
    assert.equal((await request(path)).status,404,path);
  }
});
