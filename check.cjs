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
for(const tracked of ['server.cjs','bundles.cjs','README.md']) assert(!/require\(['"]\.\/fixtures/.test(fs.readFileSync(tracked,'utf8')),`${tracked}: authored fixtures must not be loadable at runtime`);
assert(!fs.existsSync('fixtures.cjs'),'authored example coursework has been removed from the app');
const page=fs.readFileSync('public/index.html','utf8');
assert.equal((page.match(/new Date\(\)/g)||[]).length,1,'the real clock is read in exactly one place');
assert(/function todayKey\(\)\{.{0,260}new Date\(\)/.test(page),'that one place is todayKey, which only picks the side note');
assert(!/Date\.now|performance\.now/.test(page),'no other clock reads');
const ignore=fs.readFileSync('.gitignore','utf8');
for(const rule of ['private-data/','snapshots/']) assert(ignore.split(/\r?\n/).includes(rule),`.gitignore must keep ${rule} out of the repository`);
const {bundleFor}=require('./test-support/synthetic-capture.cjs');
const {validateBundle}=require('./bundles.cjs');
for(const id of ['max','adrian']) { const result=validateBundle(bundleFor(id),id); assert(result.ok,result.errors.join('; ')); }
console.log('PASS: script syntax, no private identifiers in public files, no runtime fixtures, private data ignored, builder output validates.');
