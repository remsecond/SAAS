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
  assert.equal(await page.locator('.card').count(),4);
  const box=await page.locator('.card').first().boundingBox();assert(box.y<320,'First assignment begins near controls');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  await page.getByRole('button',{name:'Help me prepare'}).first().click();
  await page.locator('[data-check="0"]').first().check();await page.locator('textarea').first().fill('Start with my results');
  await page.getByRole('button',{name:'Focus',exact:true}).click();assert.equal(await page.locator('.card').count(),1);
  await page.getByRole('button',{name:'Help me prepare'}).click();assert(await page.locator('[data-check="0"]').isChecked());assert.equal(await page.locator('textarea').inputValue(),'Start with my results');
  await page.getByRole('button',{name:'Next assignment'}).click();assert.match(await page.locator('h2').textContent(),/character/);
  await page.selectOption('#course','Art');assert.equal(await page.locator('.card').count(),1);assert(await page.getByText('No due date provided',{exact:true}).isVisible());
  await page.getByRole('button',{name:'Open in Canvas'}).click();assert(await page.getByText(/Nothing has been submitted/).isVisible());
  assert(await page.getByRole('button',{name:'Next assignment'}).isDisabled());
  await page.getByRole('button',{name:'Feed',exact:true}).click();await page.selectOption('#course','all');assert.equal(await page.locator('.card').count(),4);
  cases++;
 }
 await page.setViewportSize({width:390,height:844});await page.reload();
 if(process.env.HALLWAY_FEED_SCREENSHOT)await page.screenshot({path:process.env.HALLWAY_FEED_SCREENSHOT,fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS ${cases} phone/text combinations: visible first card, overflow, filtering, Feed/Focus, preparation retention, finite navigation, honest Canvas handoff; no page errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
