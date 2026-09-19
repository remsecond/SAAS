'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
process.chdir(__dirname);
function walk(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk('public')) {
  const source=fs.readFileSync(file,'utf8');
  assert(!/sk-proj-|appgprj_|saas\.instructure|Zeinemann/.test(source),`${file}: private source identifiers absent`);
  if(file.endsWith('.html')) for(const match of source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new Function(match[1]);
  if(file.endsWith('.js'))new Function(source);
}
const {getDemoSnapshot}=require('./fixtures.cjs');
const demo=getDemoSnapshot();
assert(Number.isFinite(Date.parse(demo.snapshot.demoNow)),'fixed reference clock required');
assert(demo.courses.length>=5,'demo should cover multiple classes');
assert(demo.assignments.length>=8,'demo should contain a useful work board');
assert(demo.resources.filter(r=>r.body).length>=5,'demo should include readable material');
for(const record of demo.assignments) {
  assert(!Object.hasOwn(record,'grade'),'no grades in the public design demo');
  assert(demo.courses.some(c=>c.id===record.courseId),'assignment course resolves');
  assert(demo.sources.some(s=>s.id===record.sourceId),'assignment source resolves');
  for(const id of record.resourceIds) assert(demo.resources.some(r=>r.id===id),'related material resolves');
}
console.log('PASS: script syntax, useful demo content, no grades, and resolving references.');
