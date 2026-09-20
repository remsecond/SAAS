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
  cases++;
 }
 await page.setViewportSize({width:390,height:844});await page.reload();
 if(process.env.HALLWAY_FEED_SCREENSHOT)await page.screenshot({path:process.env.HALLWAY_FEED_SCREENSHOT,fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS ${cases} phone/text combinations: visible first story, overflow, mixed cards, class/saved filtering, note retention, empty saved state, expandable sources, honest Canvas handoff; no page errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
