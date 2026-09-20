// Local synthetic artifact verification only; no external browser/session or school data.
const { chromium } = require(process.env.HALLWAY_PLAYWRIGHT_PATH || 'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.HALLWAY_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 let cases=0;const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,430])for(const large of [false,true]){
  await page.setViewportSize({width,height:844});await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  if(large)await page.evaluate(()=>document.body.classList.add('large'));
  assert.equal(await page.locator('.story').count(),7);
  const box=await page.locator('.story').first().boundingBox();assert(box.y<340,'First story visible near controls');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  await page.locator('[data-save]').first().click();
  await page.locator('[data-note]').first().click();await page.locator('textarea').first().fill('Ask about charcoal');
  await page.locator('#saved').click();assert.equal(await page.locator('.story').count(),1);
  await page.locator('[data-note]').click();assert.equal(await page.locator('textarea').inputValue(),'Ask about charcoal');
  await page.locator('article summary').click();await page.locator('[data-native]').click();assert(await page.getByText(/Nothing has been sent or submitted/).isVisible());
  await page.locator('[data-save]').click();assert.equal(await page.locator('.story').count(),0);assert(await page.locator('.empty').isVisible());
  await page.locator('#saved').click();await page.selectOption('#class','Science');assert.equal(await page.locator('.story').count(),2);
  await page.selectOption('#class','all');assert.equal(await page.locator('.story').count(),7);
  for(const story of await page.locator('.story').all()){
   await story.scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Story overflow');
   await story.locator('summary').click();
  }
  await page.getByRole('button',{name:'Back to top'}).click();assert.equal(await page.evaluate(()=>document.activeElement.id),'class');
  await page.locator('[data-page="work"]').click();
  await page.locator('#work-items .workrow').first().click();assert(await page.locator('#item-detail').isVisible());
  await page.locator('#shared-note').fill('Shared across views');await page.locator('#close-detail').click();
  await page.locator('[data-page="discover"]').click();await page.locator('.detail-open').first().click();
  assert.equal(await page.locator('#shared-note').inputValue(),'Shared across views');await page.keyboard.press('Escape');
  await page.locator('[data-page="prepare"]').click();assert(await page.locator('#prepare-items .workrow').count()>0);
  await page.locator('[data-page="work"]').click();await page.locator('#work-items .workrow').last().click();assert(await page.locator('#detail-body').getByText('No due date provided.',{exact:true}).isVisible());await page.keyboard.press('Escape');
  await page.locator('[data-preview="Map"]').click();assert(await page.locator('#view-preview').isVisible());
  await page.locator('[data-page="settings"]').click();assert(await page.locator('#text').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Shell overflow');
  cases++;
 }
 await page.setViewportSize({width:390,height:844});await page.reload();
 if(process.env.HALLWAY_FEED_SCREENSHOT)await page.screenshot({path:process.env.HALLWAY_FEED_SCREENSHOT,fullPage:false});
 assert.deepEqual(errors,[]);console.log(`PASS ${cases} phone/text combinations: visible first story, overflow, mixed cards, class/saved filtering, note retention, empty saved state, expandable sources, honest Canvas handoff, shell routes, shared detail/notes, sparse record, preview labels; no page errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
