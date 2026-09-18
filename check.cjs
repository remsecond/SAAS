'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
process.chdir(__dirname);
function walk(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const assets=walk('public');
for(const file of assets) {
  const source=fs.readFileSync(file,'utf8');
  assert(!/sk-proj-|appgprj_|saas\.instructure|Zeinemann/.test(source),`${file}: known private source identifiers absent`);
  if(file.endsWith('.html')) for(const match of source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new Function(match[1]);
  if(file.endsWith('.js'))new Function(source);
  assert(!/Example lab reflection|Example welcome note/.test(source),`${file}: server fixture records must not be bundled publicly`);
}
const {getFixture}=require('./fixtures.cjs');
for(const id of ['max','adrian']) {
  const fixture=getFixture(id);
  assert.equal(fixture.exampleOnly,true);
  assert.equal(fixture.snapshot.student.id,id);
  assert.equal(fixture.snapshot.capturedAt,null,'fictional fixtures must not claim a capture');
  assert(Number.isFinite(Date.parse(fixture.snapshot.demoNow)),'fixed reference clock required');
  for(const collection of ['courses','assignments','resources','sources','changes']) {
    for(const record of fixture[collection])assert.equal(record.studentId,id,`${collection} ownership`);
  }
}
console.log('PASS: script syntax, public fixture separation, fictional snapshot identity and clock.');
