'use strict';
// Opt-in private local check: no coursework, screenshots or hashes in output.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HALLWAY_PLAYWRIGHT_PATH||'playwright');
const {createServer}=require('../server.cjs'),{validateBundle}=require('../bundles.cjs'),{buildBundle}=require('../tools/build-bundle.cjs');
const args=process.argv.slice(2),index=args.indexOf('--snapshot-dir');
if(index<0||!args[index+1])throw Error('Explicit --snapshot-dir <private directory> required.');
const dir=path.resolve(args[index+1]),rawIndex=args.indexOf('--raw-dir'),rawDir=rawIndex<0?null:path.resolve(args[rawIndex+1]);
(async()=>{
 const bundles={};
 for(const id of ['max','adrian']){
  const b=JSON.parse(fs.readFileSync(path.join(dir,id+'.json')));assert.equal(validateBundle(b,id).ok,true,'Private bundle validation failed');
  if(rawDir){const raw=JSON.parse(fs.readFileSync(path.join(rawDir,id+'.raw.json')));assert.equal(require('node:util').isDeepStrictEqual(buildBundle(id,raw,{reference:b.snapshot.demoNow}),b),true,'Private raw rebuild differs');}
  bundles[id]=b;
 }
 const server=createServer({snapshotDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.HALLWAY_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  let scopes=0,details=0;const errors=[];
  for(const id of ['max','adrian']){
   const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',()=>errors.push('page error'));
   await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-student="'+id+'"]').click();await page.locator('[data-tab="Board"]').click();
   assert.equal(await page.evaluate(id=>bundle.snapshot.student.id===id&&data.every(d=>d.studentId===id),id),true,'Profile isolation');
   for(const range of ['7','30','all']){
    await page.locator('#board-period').selectOption(range);
    for(const view of ['list','week','map']){
     await page.locator('[data-board-view="'+view+'"]').click();
     const ok=await page.evaluate(()=>{
      const expected=boardItems();const summary=document.querySelector('.result-count')?.textContent||'';
      return parseInt(summary,10)===expected.length && [...document.querySelectorAll('.board-results [data-go]')].every(el=>expected.some(d=>d.id===el.dataset.go));
     });assert.equal(ok,true,'View scope/count mismatch');scopes++;
    }
   }
   await page.locator('#board-period').selectOption('all');
   const courseValues=await page.locator('#course option').evaluateAll(options=>options.map(o=>o.value).filter(v=>v!=='all'));
   for(const courseId of courseValues){
    await page.locator('#course').selectOption(courseId);
    assert.equal(await page.evaluate(()=>{
     const actual=[...document.querySelectorAll('.board-results [data-go]')].map(e=>e.dataset.go).sort();
     return JSON.stringify(actual)===JSON.stringify(boardItems().map(d=>d.id).sort());
    }),true,'Class drilldown must contain every scoped record');scopes++;
   }
   await page.locator('#course').selectOption('all');
   const item=page.locator('.map-tile').first();if(await item.count()){
    const itemId=await item.getAttribute('data-go');await item.click();
    const a=page.getByRole('link',{name:'Sign in to Canvas',exact:false}),b=page.getByRole('link',{name:'Open this assignment in Canvas',exact:false});
    assert.equal(await a.count(),1,'Canvas sign-in missing');assert.equal(await b.count(),1,'Canvas assignment link missing');
    assert.equal(new URL(await a.getAttribute('href')).origin,new URL(await b.getAttribute('href')).origin,'Canvas origin mismatch');
    await page.locator('[data-back]').click();assert.equal(await page.evaluate(()=>boardView),'map');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.go),itemId);details++;
   }
   await page.close();
  }
  assert.equal(errors.length,0,'Unexpected browser error');
  console.log(JSON.stringify({PASS:true,profiles:2,scopeChecks:scopes,detailReturns:details,rawRebuildChecked:!!rawDir,limitations:'Saved partial captures; no fresh Canvas verification, real iPhone or official submission. No private screenshots or records emitted.'}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error('FAIL: '+(e.code==='ERR_ASSERTION'?e.message.split('\n')[0]:e.name+' during private browser operation')+'. No record details emitted.');process.exitCode=1});
