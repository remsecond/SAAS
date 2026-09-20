'use strict';
// Local-only browser verification. Optional private bundle directory is never copied or logged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HALLWAY_PLAYWRIGHT_PATH||'playwright');
const {createServer}=require('../server.cjs');
const {bundleFor}=require('./synthetic-capture.cjs');
(async()=>{
 const privateDir=process.argv[2],dir=privateDir?path.resolve(privateDir):fs.mkdtempSync(path.join(os.tmpdir(),'hallway-canvas-check-'));
 if(!privateDir)for(const id of ['max','adrian']){const b=bundleFor(id);for(const s of b.sources)if(s.url)s.url=s.url.replace('canvas.test.example','saas.instructure.com');fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(b));}
 const server=createServer({snapshotDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 let combinations=0,assignments=0,interceptedClicks=0;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.HALLWAY_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  for(const id of ['max','adrian']){
   const context=await browser.newContext(),page=await context.newPage(),errors=[];
   page.on('pageerror',()=>errors.push('browser error'));
   // Never reach Canvas or another external service, including when checking actual link clicks.
   await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Intercepted local test</title>'}));
   await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-student="'+id+'"]').click();await page.locator('[data-tab="Discover"]').click();
   const expected=JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
   const parent=()=>page.getByRole('link',{name:'Parent sign-in to Canvas'});
   async function inspect(){
    assert.equal(await parent().getAttribute('href'),'https://saas.instructure.com/login/saml/11','School parent route');
    assert.equal(await parent().getAttribute('target'),'_blank','Native new-tab link');
    assert.match(await parent().getAttribute('rel'),/noopener/);
    assert(await page.getByText('Students: use your usual school Canvas sign-in.',{exact:false}).isVisible(),'Student distinction');
    assert.equal(await page.locator('a[href="https://saas.instructure.com/login"]').count(),0,'No generic school login');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
    const box=await parent().boundingBox();assert(box&&box.height>=44&&box.width>=44,'Parent action touch target');
    combinations++;
   }
   for(const width of [320,390])for(const size of [100,180]){
    await page.setViewportSize({width,height:844});await page.evaluate(size=>setSize(size),size);
    await page.locator('[data-tab="Settings"]').click();await inspect();
    await page.locator('[data-tab="Discover"]').click();
    const buttons=await page.locator('.discover-card [data-go]').evaluateAll(nodes=>nodes.map(n=>n.dataset.go));
    for(const aid of buttons){
     await page.locator('[data-go="'+aid+'"]').click();
     const record=expected.assignments.find(a=>a.id===aid),source=expected.sources.find(s=>s.id===record.sourceId);
     assert.equal(await page.getByRole('link',{name:'Open this assignment in Canvas'}).getAttribute('href'),source.url,'Original assignment URL preserved');
     await inspect();assignments++;
     await page.locator('[data-back]').click();
     assert.equal(await page.evaluate(()=>document.activeElement?.dataset.go),aid,'Return focus');
    }
   }
   await page.locator('[data-tab="Settings"]').click();
   const popupPromise=context.waitForEvent('page');await parent().click();const popup=await popupPromise;await popup.waitForLoadState();
   assert.equal(popup.url(),'https://saas.instructure.com/login/saml/11','Actual click destination (intercepted)');interceptedClicks++;await popup.close();
   // Isolated in-memory edge cases; no capture or server file is modified.
   const edges=await page.evaluate(()=>{
    const original=bundle;
    try{
     bundle={assignments:[],sources:[]};const absent=canvasSignIn();
     bundle={assignments:[{sourceId:'synthetic'}],sources:[{id:'synthetic',url:'https://other.instructure.com/courses/1/assignments/2'}]};const other=canvasSignIn();
     bundle={assignments:[{sourceId:'synthetic'}],sources:[{id:'synthetic',url:'javascript:alert(1)'}]};const unsafe=canvasSignIn();
     return {absent,other,unsafe};
    }finally{bundle=original;}
   });
   assert.equal(edges.absent,'');assert.equal(edges.unsafe,'');assert.match(edges.other,/https:\/\/other\.instructure\.com\/login"/);assert(!edges.other.includes('/saml/11'));
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log(JSON.stringify({PASS:true,environment:privateDir?'local private captures; no contents emitted':'local synthetic captures',screenCombinations:combinations,assignmentDetailChecks:assignments,interceptedParentClicks:interceptedClicks,checks:'both profiles, 320/390 px, 100/180% text, Settings and every assignment, original URLs, touch target, overflow, return focus, missing/unsafe/non-school sources',notRun:'real authentication, live deployment, real iPhone'}));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));if(!privateDir)fs.rmSync(dir,{recursive:true,force:true});}
})().catch(()=>{console.error('FAIL Canvas handoff browser check. No private record content emitted.');process.exitCode=1});
