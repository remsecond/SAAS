'use strict';
// Synthetic, loopback-only Chrome checks. Desktop emulation is not real-iPhone acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HALLWAY_PLAYWRIGHT_PATH || 'playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'hallway-board-evidence-'));
const {bundleFor}=require('./synthetic-capture.cjs'),{createServer}=require('../server.cjs');
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const snapshots=fs.mkdtempSync(path.join(os.tmpdir(),'hallway-synthetic-'));
  for(const id of ['max','adrian']){
    const b=bundleFor(id);
    b.assignments[0].title+=' — a deliberately long assignment title to check wrapping and readability';
    // The small base fixture cannot expose grouping, long-scroll or undated-clutter failures.
    const dated=b.assignments[0],undated=b.assignments.find(a=>!a.dueAt);
    for(let i=0;i<12;i++)b.assignments.push({...structuredClone(dated),id:'synthetic-extra-'+i,title:'SYNTHETIC additional task '+i});
    for(let i=0;i<8;i++)b.assignments.push({...structuredClone(undated),id:'synthetic-undated-'+i,title:'SYNTHETIC undated task '+i});
    fs.writeFileSync(path.join(snapshots,id+'.json'),JSON.stringify(b));
  }
  const server=createServer({snapshotDir:snapshots});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;const checks=[],errors=[];
  const record=(id,details)=>checks.push({id,status:'PASS',details});
  try{
    browser=await chromium.launch({executablePath:process.env.HALLWAY_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-student="max"]').click();
    await page.locator('[data-tab="Board"]').click();let combos=0;
    const visibleResult=async(label)=>{
      const evidence=await page.evaluate(()=>{
        const toolbar=document.querySelector('.board-toolbar')?.getBoundingClientRect();
        const nav=document.querySelector('nav')?.getBoundingClientRect();
        const top=Math.max(0,toolbar?.bottom||0),bottom=Math.min(innerHeight,nav?.top||innerHeight);
        const candidates=[...document.querySelectorAll('.board-results [data-go],.board-results .week-day')];
        return {top,bottom,visible:candidates.filter(e=>{const r=e.getBoundingClientRect();const label=e.querySelector(".item-title,span")?.getBoundingClientRect();return e.checkVisibility()&&Math.min(r.bottom,bottom)-Math.max(r.top,top)>=44&&label&&Math.min(label.bottom,bottom)-Math.max(label.top,top)>=Math.min(label.height,24)}).length};
      });
      assert(evidence.visible>0,label+': useful item/day must be visible below controls and above navigation '+JSON.stringify(evidence));
    };
    for(const width of [320,390,1280])for(const size of [100,180])for(const theme of ['light','default','contrast'])for(const view of ['list','week','map']){
      await page.setViewportSize({width,height:width===320?700:width===390?844:900});await page.evaluate(({size,theme})=>{setSize(size);setTheme(theme)}, {size,theme});
      await page.locator('[data-board-view="'+view+'"]').click();await page.locator('[data-tab="Today"]').click();await page.locator('[data-tab="Board"]').click();await page.evaluate(()=>document.fonts.ready);
      const label=JSON.stringify({width,size,theme,view});
      const issues=await page.evaluate(()=>{
        const app=document.getElementById('app'),visible=e=>e.checkVisibility();
        const brokenNav=[...app.querySelectorAll('nav button')].filter(button=>{
          const nodes=[...button.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim().length>1);
          return nodes.some(n=>{const r=document.createRange();r.selectNodeContents(n);return new Set([...r.getClientRects()].map(x=>Math.round(x.top))).size>1});
        }).map(e=>e.textContent.trim());
        return {overflow:document.documentElement.scrollWidth>innerWidth+1,clipped:[...app.querySelectorAll('.item-title,.due,.class-label,.map-title,.week-day')].filter(e=>visible(e)&&e.scrollWidth>e.clientWidth+2).map(e=>e.className),small:[...app.querySelectorAll('button,select,summary')].filter(e=>visible(e)&&e.getBoundingClientRect().height<43).map(e=>e.textContent.trim()),brokenNav};
      });
      assert.equal(issues.overflow,false,label+JSON.stringify(issues));assert.deepEqual(issues.clipped,[],label+JSON.stringify(issues));assert.deepEqual(issues.small,[],label+JSON.stringify(issues));assert.deepEqual(issues.brokenNav,[],label+JSON.stringify(issues));
      await visibleResult(label);combos++;
      if(width===390&&theme==='light')await page.screenshot({path:path.join(out,'board-'+view+'-'+size+'.png'),fullPage:false});
    }
    record('phone-layout-and-first-result',{combinations:combos,widths:[320,390,1280],heights:{320:700,390:844,1280:900},textSizes:[100,180],themes:['light','default','contrast'],views:['list','week','map'],assertions:'Useful item/day visible; no horizontal overflow or checked text clipping; controls >=44px with 1px tolerance; navigation labels do not split midword.'});
    for(const width of [320,390])for(const theme of ['light','default','contrast']){
      await page.setViewportSize({width,height:width===320?700:844});await page.evaluate(theme=>{setSize(180);setTheme(theme)},theme);
      await page.locator('[data-board-filters][aria-expanded]').click();await page.locator('[data-focus="attention"]').click();
      const clipped=await page.locator('.board-view-row button').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent));
      assert.deepEqual(clipped,[],JSON.stringify({width,theme,case:'active filter control label'}));await visibleResult('active work filter '+width+' '+theme);
      await page.locator('[data-board-filters][aria-expanded]').click();await page.locator('[data-focus="all"]').click();
    }
    record('active-filter-large-text','Needs attention filter remains visible and its toolbar label unclipped at 320/390px, 180% text, all three themes.');
    await page.setViewportSize({width:390,height:720});await page.evaluate(()=>{setSize(100);setTheme('light')});
    await page.locator('[data-board-view="list"]').click();await page.locator('#board-period').selectOption('all');
    await page.evaluate(()=>window.scrollTo(0,600));
    const toolbar=await page.locator('.board-toolbar').boundingBox();assert(toolbar.y>=-1&&toolbar.y+toolbar.height<620,'toolbar stays within viewport after scrolling');
    await page.locator('#course').selectOption('c501');await visibleResult('class selection while scrolled');
    await page.locator('#board-period').selectOption('30');await visibleResult('range selection while scrolled');
    for(const view of ['map','week','list']){await page.locator('[data-board-view="'+view+'"]').click();await visibleResult('compare '+view);assert.equal(await page.locator('#course').inputValue(),'c501');assert.equal(await page.locator('#board-period').inputValue(),'30');}
    record('phone-comparison-interactions','Scrolled list → class/range selection → Map/Week/List: useful result remains visible with scope retained; no scripted scroll-to-result.');
    const filters=page.locator('[data-board-filters][aria-expanded]');await filters.click();assert.equal(await filters.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await filters.getAttribute('aria-expanded'),'false');assert.equal(await filters.evaluate(e=>e===document.activeElement),true);
    await filters.click();await page.locator('[data-focus="attention"]').click();assert.equal(await filters.getAttribute('aria-expanded'),'false');await visibleResult('work filter');
    await filters.click();await page.locator('[data-reset]').click();
    record('secondary-filter-keyboard','Expand, Escape/focus return, work-filter apply closes panel, clear scope.');
    await page.locator('[data-board-view="map"]').click();
    const card=page.locator('.map-tile').first(),aid=await card.getAttribute('data-go');await card.click();assert.equal(await page.getByRole('link',{name:'Sign in to Canvas',exact:false}).count(),1);await page.locator('[data-back]').click();assert.equal(await page.evaluate(()=>boardView),'map');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.go),aid);
    record('detail-return','Map assignment → Canvas links → back restores Map and exact item focus.');
    const undated=page.locator('#board-undated');assert.equal(await undated.getAttribute('open'),null,'undated clutter begins collapsed');await undated.locator('summary').click();
    assert.equal(await undated.locator('[data-go]').count(),9,'all nine synthetic undated records remain reachable');
    const uid=await undated.locator('[data-go]').last().getAttribute('data-go');await undated.locator('[data-go]').last().click();await page.locator('[data-back]').click();assert.notEqual(await undated.getAttribute('open'),null);assert.equal(await page.evaluate(()=>document.activeElement?.dataset.go),uid);
    record('undated-access-and-return','Nine undated records collapsed as one counted group; expand reaches every record; detail/back retains disclosure and focus.');
    await page.locator('[data-board-view="week"]').click();await page.locator('[data-week="1"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>weekOffset),1);
    await page.locator('[data-tab="Settings"]').click();await page.locator('[data-profiles]').click();await page.locator('[data-student="adrian"]').click();assert.equal(await page.locator('#app').getByText('SYNTHETIC-M',{exact:false}).count(),0);
    assert.deepEqual(errors,[]);record('calendar-keyboard-and-profile-isolation','Keyboard week advance works; switching profile does not retain the previous synthetic coursework; no page errors.');
    const result={PASS:true,layoutCombinations:combos,scope:'Local synthetic Chrome emulation; no actual records, external sign-in, production or real-iPhone certification.',checks,screenshots:out};
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
