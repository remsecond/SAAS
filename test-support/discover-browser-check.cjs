'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HALLWAY_PLAYWRIGHT_PATH||'playwright');
const {createServer}=require('../server.cjs');
const {bundleFor}=require('./synthetic-capture.cjs');
(async()=>{
 const privateDir=process.argv[2];const dir=privateDir?path.resolve(privateDir):fs.mkdtempSync(path.join(os.tmpdir(),'hallway-discover-test-'));
 if(!privateDir)for(const id of ['max','adrian'])fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(bundleFor(id)));
 const server=createServer({snapshotDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({headless:true,executablePath:process.env.HALLWAY_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});let combinations=0;
 for(const id of ['max','adrian']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-student="'+id+'"]').click();await page.locator('[data-tab="Discover"]').click();
 const expected=JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
 assert.equal(await page.locator('.discover-card').count(),expected.assignments.length,'Every captured assignment reachable');
 for(const width of [320,390])for(const size of [100,180])for(const theme of ['light','default','contrast']){
 await page.setViewportSize({width,height:844});await page.evaluate(({size,theme})=>{setSize(size);setTheme(theme)},{size,theme});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
 assert(await page.locator('[data-tab="Discover"]').isVisible(),'Discover navigation visible');combinations++;
 }
 await page.evaluate(()=>{setSize(100);setTheme('light')});
 const first=page.locator('.discover-card').first();assert.equal(await first.locator('[data-go]').count(),1,'One assignment entry action');
 const aid=await first.locator('[data-go]').getAttribute('data-go');const record=expected.assignments.find(a=>a.id===aid);assert(record,'Record is from selected bundle');
 await first.locator('[data-go]').click();assert.equal(await page.locator('.detail-title').textContent(),record.title,'Shared assignment title');
 await page.locator('[data-back]').click();assert.equal(await page.evaluate(()=>tab),'Discover');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.go),aid);
 const cid=record.courseId;await page.selectOption('#discover-course',cid);assert.equal(await page.locator('.discover-card').count(),expected.assignments.filter(a=>a.courseId===cid).length,'Course filter count');
 await page.locator('[data-tab="Settings"]').click();await page.locator('[data-profiles]').click();await page.locator('[data-student="'+(id==='max'?'adrian':'max')+'"]').click();await page.locator('[data-tab="Discover"]').click();assert.equal(await page.locator('#discover-course').inputValue(),'all','Profile resets filter');
 assert.deepEqual(errors,[],'No browser errors');await page.close();
 }
 console.log(JSON.stringify({PASS:true,environment:privateDir?'local private captures, no content emitted':'local synthetic captures',layoutCombinations:combinations,checks:'counts, scope, native shared detail, return focus, profile reset, themes/text/overflow'}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(()=>{console.error('FAIL Discover check. No private record content emitted.');process.exitCode=1});
