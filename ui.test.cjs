'use strict';
// These are JavaScript behavior tests with a minimal DOM adapter, not browser,
// layout, accessibility, or actual-phone tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const {bundleFor} = require('./test-support/synthetic-capture.cjs');
const STUDENTS=[{id:'max',displayName:'Max',available:true},{id:'adrian',displayName:'Adrian',available:true}];

// options.bundles: {max, adrian} bundles (or a function id=>response) · options.remembered: stored student
// options.fetch: full override · by default Max is remembered so tests start on his board.
async function createUI(options = {}) {
  const bundles = options.bundles || {max: bundleFor('max'), adrian: bundleFor('adrian')};
  const storage = new Map(options.remembered === null ? [] : [['hallway.student', options.remembered || 'max']]);
  if (options.prefs) storage.set('hallway.prefs', options.prefs);
  if (options.noteState) storage.set('hallway.notes.max', options.noteState);
  const clock = {now: options.now || '2026-09-21T16:00:00Z'};
  const timers = [];
  const requests = [];
  const elements = new Map();
  const listeners = {};
  let focused = null;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      id, innerHTML: '', textContent: '', value: id==='theme'?'system':id==='fresh'?'normal':'',
      dataset: {}, style: {}, hidden: false,
      classList: {contains: () => false, add() {}, remove() {}, toggle() {}},
      replaceChildren() {this.innerHTML='';},
      addEventListener(type, fn) {listeners[id+':'+type]=fn;},
      setAttribute() {}, removeAttribute() {}, scrollIntoView() {},
      focus() {focused=id;},
      querySelector(selector) {return element(selector);},
    });
    return elements.get(id);
  }
  const sandbox = {
    console, URL, Intl, Date:class extends Date {constructor(...a){if(a.length)super(...a);else super(clock.now)}}, CSS:{escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c)}, setTimeout: (fn, ms) => {timers.push({fn, ms, live:true});return timers.length;}, clearTimeout(id) {if(timers[id-1])timers[id-1].live=false;}, AbortController,
    document: {getElementById: element, querySelector: element, body:element('body')},
    window: {addEventListener(type,fn){listeners['window:'+type]=fn;},scrollY:17, scrollTo() {}, matchMedia: () => ({matches:false,addEventListener(){}})},
    location: {pathname:'/',search:'',hash:'',assign(url) {this.destination=url;}},
    ...(options.navigator?{navigator:options.navigator}:{}),
    localStorage: {getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>{storage.delete(k)}},
    fetch: options.fetch || (async url => {
      if (url === '/content/personality.json') return options.personality ? {ok:true,status:200,json:async()=>structuredClone(options.personality)} : {ok:false,status:404,json:async()=>({})};
      requests.push(url);
      if (url === '/api/students') return {ok:true,status:200,json:async()=>({students:structuredClone(STUDENTS)})};
      const id = new URL(url,'http://localhost').searchParams.get('student');
      const value = typeof bundles === 'function' ? await bundles(id) : bundles[id];
      if (value && value.ok === false) return value;
      if (!value) return {ok:false,status:503,json:async()=>({error:'snapshot_unavailable',explanation:'EXPLAINED-UNAVAILABLE'})};
      return {ok:true,status:200,json:async()=>structuredClone(value)};
    }),
  };
  sandbox.window.location=sandbox.location;
  const context=vm.createContext(sandbox);
  const html=fs.readFileSync(path.join(__dirname,'public/index.html'),'utf8');
  for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const source=match[1].match(/src=["']([^"']+)/);
    vm.runInContext(source?fs.readFileSync(path.join(__dirname,'public',source[1].replace(/^\//,'')),'utf8'):match[2],context);
  }
  const settle=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve));};
  await settle();
  return {context,settle,requests,storage,element,clock,timers,
    async fireTimeouts(){for(const x of timers.filter(x=>x.live&&x.ms>=5000)){x.live=false;x.fn();}await settle();},run:code=>vm.runInContext(code,context),html:()=>element('app').innerHTML,
    focused:()=>focused,
    windowEvent(type, event={}) {return listeners['window:'+type](event);},
    event(type, target) {return listeners['app:'+type]({target});},
    click(dataset,classes=[]) {const target={dataset,classList:{contains:c=>classes.includes(c)}};target.closest=()=>target;return listeners['app:click']({target});},
  };
}



test('each student sees only their own captured coursework, labeled, with no passcode',async()=>{
  const ui=await createUI();
  assert.match(ui.html(),/Max&#39;s coursework/);
  assert.doesNotMatch(ui.html(),/class="switcher"|aria-pressed="(true|false)" data-student|data-student="adrian"/,'no in-app student switcher once a profile is open');
  assert.doesNotMatch(ui.html(),/data-profiles|Change profile/,'no profile controls on Home; they live in Settings');
  assert.match(ui.html(),/data-tab="Settings"/);
  assert.match(ui.html(),/SYNTHETIC-M/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-A|passcode|type="password"|data-logout/);
  await ui.click({profiles:'1'});await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/Adrian&#39;s coursework/);
  assert.match(ui.html(),/SYNTHETIC-A/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
  assert.equal(ui.storage.get('hallway.student'),'adrian');
});
test('profile screen: Hallway / Choose your profile, reusable cards, Add user is Coming soon',async()=>{
  const ui=await createUI({remembered:null});
  const html=ui.html();
  assert.match(html,/<h1 class="brand">[\s\S]*?Hallway/);
  assert.match(html,/Choose your profile/);
  const cards=[...html.matchAll(/<button class="profile-card"[^>]*data-student="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  assert.deepEqual(cards.map(c=>c[1]),['max','adrian']);
  const shape=c=>c[2].replace(/>[^<]+</g,'><');
  assert.equal(shape(cards[0]),shape(cards[1]),'every profile uses the same card layout');
  assert.match(html,/data-add-user="1" aria-expanded="false"/);
  assert.match(html,/Add user/);assert.match(html,/Coming soon/);
  assert.match(html,/id="addUserNote"[^>]*hidden/);
  assert.doesNotMatch(html,/Moyer|boys|parent|family|your kids|Whose Hallway|class="switcher"/i);
  assert.doesNotMatch(html,/SYNTHETIC-/);
  assert.deepEqual(ui.requests,['/api/students']);
});
test('install tip shows only on an iPhone that has not added Hallway to the Home Screen',async()=>{
  const iphone='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)';
  assert.match((await createUI({remembered:null,navigator:{userAgent:iphone,standalone:false}})).html(),/Add to Home Screen/);
  assert.doesNotMatch((await createUI({remembered:null,navigator:{userAgent:iphone,standalone:true}})).html(),/Add to Home Screen/,'gone once installed');
  assert.doesNotMatch((await createUI({remembered:null,navigator:{userAgent:'Mozilla/5.0 (Windows NT 10.0)'}})).html(),/Add to Home Screen/,'not on a desktop');
  assert.doesNotMatch((await createUI({remembered:null})).html(),/Add to Home Screen/);
  const home=(await createUI({navigator:{userAgent:iphone,standalone:false}})).html();
  assert.doesNotMatch(home,/Add to Home Screen/,'only on the profile screen, never over coursework');
});

test('Add user explains Coming soon without a form, a request, or a new profile',async()=>{
  const ui=await createUI({remembered:null});
  await ui.click({addUser:'1'});
  const html=ui.html();
  assert.match(html,/aria-expanded="true"/);
  assert.match(html,/id="addUserNote" class="callout" role="status" >/);
  assert.match(html,/New profiles are not available yet/);
  assert.doesNotMatch(html,/<form|<input|<textarea|<select|type="password"|sign up here|register/i);
  assert.deepEqual(ui.requests,['/api/students'],'no request is made');
  assert.equal(ui.run('students.length'),2);assert.equal(ui.run('student'),null);assert.equal(ui.storage.has('hallway.student'),false);
  await ui.click({addUser:'1'});
  assert.match(ui.html(),/id="addUserNote"[^>]*hidden/);
});
test('each profile card opens that student\'s actual coursework; Change profile returns and forgets the choice',async()=>{
  for(const [id,own,other] of [['max','SYNTHETIC-M','SYNTHETIC-A'],['adrian','SYNTHETIC-A','SYNTHETIC-M']]){
    const ui=await createUI({remembered:null});
    await ui.click({student:id});await ui.settle();
    assert.match(ui.html(),new RegExp(own));assert.doesNotMatch(ui.html(),new RegExp(other));
    assert.doesNotMatch(ui.html(),/class="switcher"/);
    await ui.click({tab:'Settings'});assert.match(ui.html(),/<h1 class="screen-title">Settings/);assert.match(ui.html(),/data-profiles="1"/);
    await ui.click({profiles:'1'});
    assert.match(ui.html(),/Choose your profile/);
    assert.doesNotMatch(ui.html(),/SYNTHETIC-/);
    assert.equal(ui.run('student'),null);assert.equal(ui.run('bundle'),undefined);assert.equal(ui.storage.has('hallway.student'),false);
  }
});
test('a slow response arriving after returning to the profile screen is ignored',async()=>{
  const release={};
  const ui=await createUI({remembered:null,bundles:id=>new Promise(resolve=>{release[id]=()=>resolve(bundleFor(id));})});
  await ui.click({student:'max'});
  await ui.click({profiles:'1'});
  release.max();await ui.settle();
  assert.match(ui.html(),/Choose your profile/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
});
test('switching resets filters and navigation and never shows the previous student',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});await ui.click({period:'all'});
  ui.event('change',{id:'course',value:'c502',dataset:{}});
  await ui.click({go:'a9004'});
  await ui.click({student:'adrian'});
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/,'previous student cleared before the new one loads');
  assert.match(ui.html(),/Opening Adrian/);
  await ui.settle();
  assert.equal(ui.run('page'),'home');assert.equal(ui.run('tab'),'Today');
  assert.equal(ui.run('course'),'all');assert.equal(ui.run('period'),'7');assert.equal(ui.run('navStack.length'),0);
});
test('rapid switching ignores a slow response for the student no longer selected',async()=>{
  const release={};
  const ui=await createUI({bundles:id=>new Promise(resolve=>{release[id]=()=>resolve(bundleFor(id));})});
  await ui.settle();
  await ui.click({student:'adrian'});
  release.adrian();await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-A/);
  release.max();await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-A/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
  assert.equal(ui.run('bundle.snapshot.student.id'),'adrian');
});
test('drafts, checklists and follow-up notes stay with their student even for the same assignment id',async()=>{
  const ui=await createUI();
  await ui.click({go:'draft:a9001'});
  assert.match(ui.html(),/Nothing is sent/i);
  ui.event('input',{dataset:{draft:'a9001'},value:'Max <draft> & question'});
  await ui.click({home:'1'});
  await ui.click({go:'tracker:a9001'});
  ui.event('change',{dataset:{check:'a9001-0'},checked:true});
  await ui.click({home:'1'});await ui.click({go:'a9001'});await ui.click({sent:'a9001'});
  assert.match(ui.html(),/Follow-up noted/);
  await ui.click({student:'adrian'});await ui.settle();
  await ui.click({go:'draft:a9001'});
  assert.doesNotMatch(ui.html(),/Max &lt;draft&gt;/);
  ui.event('input',{dataset:{draft:'a9001'},value:'Adrian words'});
  await ui.click({home:'1'});await ui.click({go:'tracker:a9001'});
  assert.doesNotMatch(ui.html(),/data-check="a9001-0" checked/);
  await ui.click({home:'1'});await ui.click({go:'a9001'});
  assert.doesNotMatch(ui.html(),/Follow-up noted/);
  await ui.click({student:'max'});await ui.settle();
  await ui.click({go:'draft:a9001'});
  assert.match(ui.html(),/Max &lt;draft&gt; &amp; question/);
  assert.doesNotMatch(ui.html(),/Adrian words/);
  await ui.click({home:'1'});await ui.click({go:'tracker:a9001'});
  assert.match(ui.html(),/data-check="a9001-0" checked/);
});
test('a missing or mismatched bundle is an honest recoverable state, never example content',async()=>{
  const ui=await createUI({bundles:{max:bundleFor('max')}});
  await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/Adrian&#39;s coursework is not available/);
  assert.match(ui.html(),/EXPLAINED-UNAVAILABLE/);
  assert.match(ui.html(),/data-retry="snapshot"/);
  assert.match(ui.html(),/data-profiles="1"/,'Change profile stays available');
  assert.doesNotMatch(ui.html(),/SYNTHETIC-|No unfinished work|<nav/);
  await ui.click({student:'max'});await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-M/);
  const wrong=await createUI({bundles:{max:bundleFor('adrian'),adrian:bundleFor('adrian')}});
  assert.match(wrong.html(),/did not match Max/);
  assert.doesNotMatch(wrong.html(),/SYNTHETIC-A/);
  const example={...bundleFor('max'),exampleOnly:true};
  const refused=await createUI({bundles:{max:example}});
  assert.doesNotMatch(refused.html(),/SYNTHETIC-M/);
  for(const status of [401,500]){
    const down=await createUI({fetch:async()=>({ok:false,status,json:async()=>({})})});
    assert.match(down.html(),/Could not open Hallway/);assert.match(down.html(),/data-retry="students"/);
    assert.equal(down.context.location.destination,undefined);
  }
});
test('frozen clock, partial-coverage wording and submission states are truthful',async()=>{
  const ui=await createUI();
  const before=ui.html();
  ui.run('Date.now=()=>0;render()');
  assert.equal(ui.html(),before);
  assert.match(before,/Next deadline in this capture/);
  assert.match(before,/Captured from Canvas/);
  assert.match(before,/frozen sample, not live/);
  const attention=ui.run("data.filter(d=>d.attention).map(d=>d.id).sort().join()");
  assert.equal(attention,'a9001,a9002,a9003,a9006','submitted, graded-with-old-due-date, excused and past on-paper items are not unfinished');
  await ui.click({go:'a9005'});
  assert.match(ui.html(),/<b>Graded<\/b>/);assert.match(ui.html(),/Hallway does not show grades/);
  assert.doesNotMatch(ui.html(),/<span>Grade<\/span>|points possible|score/i);
  await ui.click({back:'1'});await ui.click({go:'a9007'});
  assert.match(ui.html(),/cannot tell whether it is done/);
  await ui.click({back:'1'});await ui.click({go:'a9006'});
  assert.match(ui.html(),/No due date is set in Canvas/);
  assert.match(ui.html(),/no written instructions in Canvas/);
  const empty=bundleFor('max');empty.assignments=[];
  const none=await createUI({bundles:{max:empty}});
  assert.match(none.html(),/No upcoming dated item is listed in this capture/);
  assert.match(none.html(),/not the same as no work/);
  await none.click({tab:'Courses'});
  assert.match(none.html(),/8 of 10 Canvas items are included/);
});
test('course and assessment filters retain selection across detail navigation',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});
  await ui.click({period:'all'});
  ui.event('change',{id:'course',value:'c502',dataset:{}});
  const expected=ui.run("data.filter(d=>d.courseId==='c502').length");
  assert.match(ui.html(),new RegExp(expected+' matching item'));
  await ui.click({go:'a9004'});
  await ui.click({back:'1'});
  assert.equal(ui.run('course'),'c502');
  assert.equal(ui.run('period'),'all');
  assert.match(ui.html(),/class="tiles list"/);
  await ui.click({boardView:'map'});
  assert.match(ui.html(),/class="board-map"/);
  await ui.click({focus:'assessments'});
  ui.event('change',{id:'course',value:'all',dataset:{}});
  assert.match(ui.html(),/1 matching item /);
  await ui.click({home:'1'});
  assert.equal(ui.run('course'),'all');
  assert.equal(ui.run('period'),'7');
});
test('captured material is readable, links are labeled, and nested Back returns to its assignment',async()=>{
  const ui=await createUI();
  await ui.click({go:'a9001'});
  assert.match(ui.html(),/Instructions from Canvas/);
  assert.match(ui.html(),/SYNTHETIC-M comment/);
  await ui.click({go:'prepare:a9001'});
  await ui.click({go:'resource:p501-synthetic-m-guide'});
  assert.match(ui.html(),/SYNTHETIC-M page body text/);
  assert.match(ui.html(),/From Canvas · copied/);
  await ui.click({back:'1'});
  assert.match(ui.html(),/Help me prepare/);
  await ui.click({go:'resource:p501-embed-only'});
  assert.match(ui.html(),/only holds an embedded slideshow/);
  assert.doesNotMatch(ui.html(),/From Canvas · copied/);
  assert.match(ui.html(),/href="https:\/\/docs\.google\.com\/presentation\/d\/test\/embed"/);
  await ui.click({back:'1'});
  await ui.click({go:'resource:l9001-1'});
  assert.match(ui.html(),/was not copied into Hallway/);
  assert.match(ui.html(),/href="https:\/\/docs\.google\.com\/document\/d\/test"/);
  await ui.click({back:'1'});await ui.click({back:'1'});
  assert.equal(ui.run('page'),'a9001');
  await ui.click({go:'does-not-exist'});
  assert.match(ui.html(),/Item unavailable/);
});
test('content and drafts are escaped and non-HTTPS source actions suppressed',async()=>{
  const bundle=bundleFor('max');
  bundle.assignments[0].title='<img src=x onerror=alert(1)>';
  bundle.sources.find(s=>s.id===bundle.assignments[0].sourceId).url='javascript:alert(1)';
  const ui=await createUI({bundles:{max:bundle}});
  await ui.click({tab:'Board'});await ui.click({period:'all'});
  assert.doesNotMatch(ui.html(),/<img src=x/);
  assert.match(ui.html(),/&lt;img src=x/);
  await ui.click({go:bundle.assignments[0].id});
  assert.doesNotMatch(ui.html(),/href="javascript:/);
  assert.equal(ui.run("safeUrl('https://example.com/a')"),'https://example.com/a');
  assert.equal(ui.run("safeUrl('data:text/html,hello')"),null);
});
test('Settings: text size and look apply at once, are remembered on the device, and carry no other student',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Settings'});
  const html=ui.html();
  assert.match(html,/This is Max&#39;s Hallway/);assert.match(html,/frozen copy, not live/);assert.match(html,/Add to Home Screen/);
  assert.doesNotMatch(html,/Adrian|SYNTHETIC-A|type="password"|<input|<form/);
  await ui.click({size:'150'});
  assert.equal(ui.element('phone').style.fontSize,'1.5rem');
  assert.match(ui.html(),/aria-pressed="true" data-size="150"/);
  await ui.click({themeChoice:'default'});
  assert.equal(ui.element('body').dataset.theme,'default');
  assert.deepEqual(JSON.parse(ui.storage.get('hallway.prefs')),{size:150,theme:'default'});
  await ui.click({size:'9000'});await ui.click({themeChoice:'javascript:alert(1)'});
  assert.deepEqual(JSON.parse(ui.storage.get('hallway.prefs')),{size:150,theme:'default'},'junk values are ignored');
});
test('saved text size and look are applied on the next open; bad saved values fall back',async()=>{
  const ui=await createUI({prefs:'{"size":180,"theme":"contrast"}'});
  assert.equal(ui.element('phone').style.fontSize,'1.8rem');assert.equal(ui.element('body').dataset.theme,'contrast');
  const bad=await createUI({prefs:'{"size":"huge","theme":"<script>"}'});
  assert.equal(bad.element('phone').style.fontSize,'1rem');assert.equal(bad.element('body').dataset.theme,'light');
  const broken=await createUI({prefs:'not json'});
  assert.equal(broken.element('body').dataset.theme,'light');
});
test('theme, width and large text controls change presentation',async()=>{
  const ui=await createUI();
  ui.element('size').oninput({target:{value:'180'}});
  assert.equal(ui.element('phone').style.fontSize,'1.8rem');
  ui.element('width').oninput({target:{value:'320'}});
  assert.equal(ui.element('phone').style.width,'320px');
  ui.element('theme').value='contrast';ui.element('theme').onchange();
  assert.equal(ui.element('body').dataset.theme,'contrast');
});
test('Home leads with the next deadline, then upcoming work; earlier items sit in a labeled disclosure; detail navigation stays',async()=>{
  const ui=await createUI();
  const html=ui.html();
  const hero=html.slice(html.indexOf('class="hero"'),html.indexOf('aria-label="Coming up"'));
  assert.match(hero,/Next deadline in this capture/);
  assert.match(hero,/Due Sun, Sep 20 · 7:35 PM/,'explicit Due, weekday, snapshot time zone');
  assert.match(hero,/reference time, Sep 18, 2026, 7:35 PM\. Not live\./,'absolute reference date next to the lead');
  assert.doesNotMatch(hero,/\btoday\b/i,'no today claim from frozen data');
  assert.match(hero,/data-go="a9001"/);
  const start=html.indexOf('aria-label="Coming up"');
  assert(start>=0 && start<html.indexOf('What changed'));
  const upcoming=html.slice(start,html.indexOf('</section>',start));
  assert.match(upcoming,/data-go="a9003"/);
  assert.doesNotMatch(upcoming,/data-go="a9001"/,'the hero item is not repeated');
  assert.doesNotMatch(upcoming,/data-go="a9002"/,'overdue work is never the lead');
  const earlier=html.slice(html.indexOf('<details class="earlier"'),html.indexOf('</details>',html.indexOf('<details class="earlier"')));
  assert.match(earlier,/<summary>Earlier items to check \(1\)<\/summary>/);
  assert.match(earlier,/recorded status can be out of date/);assert.match(earlier,/checking Canvas may be the next step/);
  assert.match(earlier,/data-go="a9002"/);
  assert.doesNotMatch(earlier,/data-go="a9004"|data-go="a9005"|data-go="a9007"|data-go="a9008"/,'finished and past on-paper items are not attention items');
  assert(html.indexOf('<details class="earlier"')>html.indexOf('aria-label="Coming up"'),'earlier items come after upcoming');
  assert.match(html,/1 unfinished item has no captured date\./);
  assert.match(html,/See all unfinished work \(3 dated, 1 with no date\)/);
  await ui.click({seeAttention:'1'});
  assert.equal(ui.run('tab'),'Board');assert.equal(ui.run('focus'),'attention');assert.equal(ui.run('period'),'all');
  assert.match(ui.html(),/4 matching items/);
  const board=ui.html();
  assert(board.lastIndexOf('data-go="a9002"')<board.lastIndexOf('data-go="a9001"')&&board.lastIndexOf('data-go="a9003"')<board.lastIndexOf('data-go="a9006"'),'board is soonest first with undated last');
  await ui.click({home:'1'});
  await ui.click({go:'a9002'});
  assert.match(ui.html(),/Next action/);
  await ui.click({back:'1'});
  assert.match(ui.html(),/aria-label="Coming up"/);
});
const AT=days=>new Date(Date.parse('2026-09-19T02:35:15.414Z')+days*86400000).toISOString();
function withAssignments(list){const b=bundleFor('max');const tpl=b.assignments.find(a=>a.id==='a9001');b.assignments=list.map(([id,courseId,dueAt,state])=>({...structuredClone(tpl),id,courseId,dueAt,title:'T-'+id,submission:{...tpl.submission,state}}));return b}
test('upcoming shows three after the hero, ordered by due date, then course, then assignment id',async()=>{
  const t=AT(3);
  const ui=await createUI({bundles:{max:withAssignments([['a5','c502',t,'not_submitted'],['a4','c501',t,'not_submitted'],['a3','c501',t,'not_submitted'],['a1','c501',AT(1),'not_submitted'],['a9','c501',AT(4),'not_submitted'],['a8','c501',AT(6),'not_submitted']])}});
  const html=ui.html(),start=html.indexOf('aria-label="Coming up"'),upcoming=html.slice(start,html.indexOf('</section>',start));
  const order=[...upcoming.matchAll(/data-go="(a\d)"/g)].map(m=>m[1]).join();
  assert.equal(order,'a3,a4,a5','ties break by course id, then assignment id; only three visible');
  assert.match(upcoming,/2 more upcoming in this capture\./);
  assert.match(html.slice(html.indexOf('class="hero"'),start),/data-go="a1"/);
  assert.doesNotMatch(html,/<details class="earlier"/,'no empty disclosure');
});
test('with no upcoming dated item, Home says so and still routes to earlier and undated work, never an all-clear',async()=>{
  const ui=await createUI({bundles:{max:withAssignments([['a1','c501',AT(-2),'missing'],['a2','c501',AT(-5),'not_submitted'],['a3','c502',null,'not_submitted'],['a4','c502',AT(-1),'submitted']])}});
  const html=ui.html();
  assert.match(html,/No upcoming dated item is listed in this capture/);
  assert.match(html,/not the same as no work/);
  assert.match(html,/8 of 10 Canvas items are included/,'coverage limitation stays visible');
  assert.match(html,/Earlier items to check \(2\)/);
  const earlier=html.slice(html.indexOf('<details class="earlier"'));
  assert(earlier.indexOf('data-go="a1"')<earlier.indexOf('data-go="a2"'),'most recent earlier item first inside the disclosure');
  assert.match(html,/1 unfinished item has no captured date\./);
  assert.doesNotMatch(html,/No unfinished work|all caught up|all clear/i);
  assert.doesNotMatch(html,/st-green[^]*Coming up/,'no green summary');
});
test('course color comes from course ids alone, stays distinct for up to ten classes, and survives filters, layout, renames and status changes',async()=>{
  const ui=await createUI();
  const tone=id=>ui.run(`data.find(d=>d.id===${JSON.stringify(id)}).courseTone`);
  assert.equal(tone('a9001'),tone('a9002'),'same course, same color');
  assert.equal(tone('a9001'),ui.run("courseTone('c501')"));
  assert.notEqual(ui.run("courseTone('c501')"),ui.run("courseTone('c502')"),'different classes get different colors');
  const many=bundleFor('max');many.courses=Array.from({length:10},(_,i)=>({...many.courses[0],id:'c'+(900+i*7)}));
  const wide=await createUI({bundles:{max:many}});
  assert.equal(new Set(wide.run('bundle.courses.map(c=>courseTone(c.id))')).size,10,'ten classes, ten colors');
  const cls=html=>(html.match(/class="tile card course-(\d)" data-go="a9003"/)||[])[1];
  await ui.click({period:'all'});
  const before=cls(ui.html());assert.ok(before!==undefined);
  await ui.click({layout:'yes'});assert.equal(cls(ui.html().replace('tile big card','tile card')),before);
  await ui.click({layout:'yes'});await ui.click({focus:'attention'});assert.equal(cls(ui.html()),before);
  const renamed=bundleFor('max');renamed.courses=renamed.courses.map(c=>({...c,title:'Renamed '+c.title}));for(const a of renamed.assignments)a.submission={...a.submission,state:'graded'};
  const other=await createUI({bundles:{max:renamed}});
  assert.equal(other.run("data.find(d=>d.id==='a9003').courseTone"),tone('a9003'),'names and status never pick the color');
});
test('status is a labeled marker in sentence case, separate from course color, and local checks never change it',async()=>{
  const ui=await createUI();
  await ui.click({period:'all'});
  const html=ui.html();
  assert.match(html,/st-amber" aria-hidden="true"><\/span><b>Marked missing at capture<\/b>/);
  assert.match(html,/st-green" aria-hidden="true"><\/span><b>Submitted in captured Canvas data<\/b>/);
  assert.match(html,/<b>Excused<\/b>/);assert.match(html,/<b>In class \/ on paper<\/b>/);
  assert.doesNotMatch(html,/MISSING|NOT SUBMITTED|TURNED IN|GRADED|EXCUSED|ON PAPER|STATUS UNKNOWN/,'no all-caps status');
  assert.doesNotMatch(html,/class="tile[^"]*\b(red|orange|blue)\b/,'status no longer paints the whole card');
  const card=html.match(/<button class="tile card[^>]*data-go="a9006">[\s\S]*?<\/button>/)[0];
  assert(card.indexOf('class-label')<card.indexOf('item-title')&&card.indexOf('item-title')<card.indexOf('class="due"')&&card.indexOf('class="due"')<card.indexOf('status-line'),'class, title, due, status');
  assert.match(card,/Date not captured/);
  ui.event('change',{dataset:{check:'a9001-0'},checked:true});
  await ui.click({go:'a9001'});
  assert.match(ui.html(),/<b>Not submitted in Canvas<\/b>/,'a local checkmark does not change recorded status');
});
test('due dates show the year only when it differs from the capture year',async()=>{
  const ui=await createUI({bundles:{max:withAssignments([['a1','c501','2027-01-05T18:00:00Z','not_submitted'],['a2','c501',AT(2),'not_submitted']])}});
  await ui.click({period:'all'});
  assert.match(ui.html(),/Due Tue, Jan 5, 2027 · 10:00 AM/);
  assert.match(ui.html(),/Due Sun, Sep 20 · 7:35 PM/);
});
test('undated work stays visible and an empty filter offers a reset',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});
  assert.match(ui.html(),/data-go="a9006"/);
  ui.event('change',{id:'course',value:'absent-course',dataset:{}});
  assert.match(ui.html(),/0 matching items/);
  assert.match(ui.html(),/Nothing matches these filters/);
  await ui.click({reset:'1'});
  assert.match(ui.html(),/data-go="a9006"/);
});
test('leaving the page clears every student\'s local edits',async()=>{
  const ui=await createUI();
  ui.event('input',{dataset:{draft:'a9001'},value:'private words'});
  ui.windowEvent('pagehide');
  assert.equal(ui.run('Object.keys(perStudent).length'),0);
  assert.equal(ui.html(),'');
});
module.exports={createUI};

// ---- personality layer ----
const NOTES=n=>({version:1,enabled:true,entries:Array.from({length:n},(_,i)=>({id:'daily-'+String(i).padStart(2,'0'),text:'DAILY-LINE-'+i+'.',surfaces:['daily_extra'],kind:'joke',tone:'app',source:null})).concat([{id:'clear-0',text:'CLEAR-LINE-0.',surfaces:['all_clear'],kind:'joke',tone:'app',source:null}])});
const shown=html=>(html.match(/class="side-note-text">([^<]*)</)||[])[1]||null;
const stripNote=html=>html.replace(/<aside class="side-note"[\s\S]*?<\/aside>/,'');

test('personality: one side note on Home, below the real work, and nothing about it changes the coursework',async()=>{
  const plain=await createUI();
  const ui=await createUI({personality:NOTES(20)});
  assert.match(shown(ui.html()),/^DAILY-LINE-\d+\.$/);
  assert.equal((ui.html().match(/class="side-note"/g)||[]).length,1,'at most one line on Home');
  assert.ok(ui.html().indexOf('class="side-note"')>ui.html().indexOf('aria-label="Coming up"'),'sits below the practical information');
  assert.equal(stripNote(ui.html()),plain.html(),'titles, dates, status and order are identical with and without personality');
  for(const tab of ['Board','Courses','Settings']){await ui.click({tab});assert.equal(shown(ui.html()),null,tab+' has no side note');}
  await ui.click({tab:'Today'});await ui.click({go:'a9001'});assert.equal(shown(ui.html()),null,'never on an assignment');
});

test('personality: the real clock only picks the line; coursework stays on the frozen clock',async()=>{
  const ui=await createUI({personality:NOTES(20)});
  const first=ui.html();
  ui.clock.now='2026-10-31T16:00:00Z';ui.run('render()');
  assert.notEqual(shown(ui.html()),shown(first),'a new day brings a new line');
  assert.equal(stripNote(ui.html()),stripNote(first),'forty days later every coursework word is unchanged');
});

test('personality: the pick is stable through navigation and reload, and each profile keeps its own',async()=>{
  const ui=await createUI({personality:NOTES(20)});
  const line=shown(ui.html());
  await ui.click({tab:'Board'});await ui.click({tab:'Today'});ui.run('render()');
  assert.equal(shown(ui.html()),line);
  const saved=JSON.parse(ui.storage.get('hallway.notes.max'));
  assert.equal(saved.day,'2026-09-21');assert.equal(saved.history.length,1);
  assert.equal(ui.storage.has('hallway.notes.adrian'),false);
  assert.doesNotMatch(JSON.stringify(saved),/SYNTHETIC|a900|Max/,'no coursework or names are stored with the pick');
  await ui.click({tab:'Settings'});await ui.click({profiles:'1'});await ui.click({student:'adrian'});await ui.settle();
  await ui.click({noteHide:JSON.parse(ui.storage.get('hallway.notes.adrian')).pick.daily_extra});
  await ui.click({tab:'Settings'});await ui.click({profiles:'1'});await ui.click({student:'max'});await ui.settle();
  assert.equal(shown(ui.html()),line,"Max's line and history are untouched by what Adrian did");
  assert.deepEqual(JSON.parse(ui.storage.get('hallway.notes.max')).hidden,[]);
});

test('personality: no repeats inside 14 days while alternatives exist; when the pool runs out, the least recently shown comes back',async()=>{
  const ui=await createUI({personality:NOTES(15)});
  const seen=[shown(ui.html())];
  for(let d=22;d<=30;d++){ui.clock.now=`2026-09-${d}T16:00:00Z`;ui.run('render()');seen.push(shown(ui.html()));}
  for(let d=1;d<=4;d++){ui.clock.now=`2026-10-0${d}T16:00:00Z`;ui.run('render()');seen.push(shown(ui.html()));}
  assert.equal(new Set(seen).size,14,'14 days, 14 different lines');
  const small=await createUI({personality:NOTES(3)});
  const order=[shown(small.html())];
  for(let d=22;d<=26;d++){small.clock.now=`2026-09-${d}T16:00:00Z`;small.run('render()');order.push(shown(small.html()));}
  assert.ok(order.every(Boolean),'never fails or goes blank when the pool is small');
  assert.equal(new Set(order.slice(0,3)).size,3);
  assert.deepEqual(order.slice(3),order.slice(0,3),'then cycles, least recently shown first');
});

test('personality: Not this one removes the line for that profile for good, without a replacement slot machine',async()=>{
  const ui=await createUI({personality:NOTES(20)});
  const line=shown(ui.html()),id=JSON.parse(ui.storage.get('hallway.notes.max')).pick.daily_extra;
  await ui.click({noteHide:id});
  assert.equal(shown(ui.html()),null);assert.match(ui.html(),/Got it\. That one won&#39;t come back\./);
  assert.equal(ui.focused(),'#noteGone');
  ui.run('render()');assert.equal(shown(ui.html()),null,'no reroll today');assert.doesNotMatch(ui.html(),/Got it/);
  for(let d=22;d<=30;d++){ui.clock.now=`2026-09-${d}T16:00:00Z`;ui.run('render()');assert.ok(shown(ui.html()));assert.notEqual(shown(ui.html()),line);}
  ui.clock.now='2026-12-01T16:00:00Z';ui.run('render()');assert.notEqual(shown(ui.html()),line,'still gone months later');
});

test('personality: Keep it straightforward turns it off everywhere for that profile and leaves no empty card',async()=>{
  const plain=await createUI();
  const ui=await createUI({personality:NOTES(20)});
  await ui.click({tab:'Settings'});
  assert.match(ui.html(),/Side notes/);assert.match(ui.html(),/aria-pressed="true" data-notes="on"/);
  await ui.click({notes:'off'});
  assert.match(ui.html(),/aria-pressed="true" data-notes="off"/);
  await ui.click({tab:'Today'});
  assert.equal(ui.html(),plain.html(),'Home is exactly the practical Home');
  await ui.click({tab:'Settings'});await ui.click({notes:'on'});await ui.click({tab:'Today'});
  assert.ok(shown(ui.html()));
  assert.doesNotMatch((await (async()=>{const p=await createUI();await p.click({tab:'Settings'});return p})()).html(),/Side notes/,'no switch is offered when personality is off at the server');
});

test('personality: all-clear needs real, finished work; empty, failed, mismatched and filtered states never qualify',async()=>{
  const done=bundleFor('max');for(const a of done.assignments)a.submission={...a.submission,state:'submitted'};
  const ui=await createUI({bundles:{max:done},personality:NOTES(5)});
  assert.match(ui.html(),/No unfinished work is listed in this snapshot\./);
  assert.match(ui.html(),/check Canvas for anything newer/);
  assert.equal(shown(ui.html()),'CLEAR-LINE-0.');
  assert.ok(ui.html().indexOf('No unfinished work is listed')<ui.html().indexOf('CLEAR-LINE-0.'),'the truthful status comes first');
  assert.doesNotMatch(ui.html(),/everything is done|all caught up|we checked/i);
  const whole=structuredClone(done);whole.snapshot.coverage.state='complete';
  const full=await createUI({bundles:{max:whole},personality:NOTES(5)});
  assert.match(full.html(),/No unfinished work between /);assert.doesNotMatch(full.html(),/listed in this snapshot/);
  const open=await createUI({personality:NOTES(5)});
  assert.doesNotMatch(open.html(),/No unfinished work|CLEAR-LINE/);assert.match(shown(open.html()),/^DAILY-LINE/);
  const empty=bundleFor('max');empty.assignments=[];
  const none=await createUI({bundles:{max:empty},personality:NOTES(5)});
  assert.doesNotMatch(none.html(),/No unfinished work is listed|CLEAR-LINE/);assert.match(none.html(),/not the same as no work/);
  const failed=await createUI({bundles:{},personality:NOTES(5)});
  assert.match(failed.html(),/not available/);assert.doesNotMatch(failed.html(),/side-note|CLEAR-LINE|DAILY-LINE/,'an error is never decorated');
  const wrong=await createUI({bundles:{max:bundleFor('adrian')},personality:NOTES(5)});
  assert.doesNotMatch(wrong.html(),/side-note|CLEAR-LINE|DAILY-LINE/);
  await open.click({tab:'Board'});await open.click({focus:'assessments'});await open.click({period:'7'});
  assert.doesNotMatch(open.html(),/No unfinished work is listed|CLEAR-LINE|side-note/,'an empty filter is a filter state');
});

test('personality: broken storage, a corrupt saved state and hostile text are all harmless',async()=>{
  const ui=await createUI({personality:NOTES(20)});
  ui.context.localStorage.setItem=()=>{throw new Error('full')};ui.context.localStorage.getItem=()=>{throw new Error('blocked')};
  ui.run('render()');const line=shown(ui.html());assert.ok(line);
  ui.run('render()');assert.equal(shown(ui.html()),line,'stable in memory when storage is blocked');
  assert.match(ui.html(),/SYNTHETIC-M/,'coursework is unaffected');
  const bad=await createUI({personality:NOTES(20),noteState:'{"day":5,"pick":"x","history":[1,{"id":2}],"hidden":"all","off":"yes"}'});
  assert.ok(shown(bad.html()));
  const evil=await createUI({personality:{version:1,enabled:true,entries:[{id:'x',text:'<img src=x onerror=alert(1)>',surfaces:['daily_extra'],kind:'fact',source:'javascript:alert(1)'}]}});
  assert.match(evil.html(),/&lt;img src=x onerror=alert\(1\)&gt;/);assert.doesNotMatch(evil.html(),/<img|javascript:/);
  for(const junk of [{enabled:true},{enabled:true,entries:'no'},{enabled:false,entries:NOTES(3).entries},{enabled:true,entries:[null,{id:1},{id:'x',text:'y'}]}]){
    const off=await createUI({personality:junk});assert.doesNotMatch(off.html(),/side-note/);assert.match(off.html(),/SYNTHETIC-M/);}
});

// ---- Codex independent review, Sept 19: a stalled request must never trap a student on Loading ----
const stall=(_url,opts={})=>new Promise((_,reject)=>opts.signal?.addEventListener('abort',()=>reject(new Error('aborted'))));
const okJson=value=>({ok:true,status:200,json:async()=>structuredClone(value)});

test('a snapshot request that never answers times out into Try again and Change profile, and both work',async()=>{
  let mode='stall';
  const ui=await createUI({remembered:null,fetch:async(url,opts)=>{
    if(url==='/content/personality.json')return {ok:false,status:404,json:async()=>({})};
    if(url==='/api/students')return okJson({students:STUDENTS});
    const id=new URL(url,'http://localhost').searchParams.get('student');
    return mode==='stall'&&id==='max'?stall(url,opts):okJson(bundleFor(id));}});
  await ui.click({student:'max'});await ui.settle();
  assert.match(ui.html(),/Opening Max&#39;s coursework/);
  assert.ok(ui.timers.some(x=>x.live&&x.ms>=5000&&x.ms<=20000),'a bounded timeout is armed');
  await ui.fireTimeouts();
  assert.match(ui.html(),/taking too long/);assert.match(ui.html(),/data-retry="snapshot"/);assert.match(ui.html(),/data-profiles="1"/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC|Coming up|Earlier items/,'nothing fake is shown');
  await ui.click({retry:'snapshot'});await ui.settle();await ui.fireTimeouts();
  assert.match(ui.html(),/taking too long/,'a second stall ends the same way');
  await ui.click({profiles:'1'});assert.match(ui.html(),/Choose your profile/);
  await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-A/,'the other profile is reachable while one is stalled');
  await ui.click({tab:'Settings'});await ui.click({profiles:'1'});mode='ok';
  await ui.click({student:'max'});await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-M/,'and the stalled one recovers when the connection does');
  assert.equal(ui.timers.filter(x=>x.live&&x.ms>=5000).length,0,'finished requests leave no timeout behind');
});

test('a late answer after the timeout, or after moving on, never replaces the current screen',async()=>{
  let release;
  const ui=await createUI({remembered:null,fetch:async url=>{
    if(url==='/content/personality.json')return {ok:false,status:404,json:async()=>({})};
    if(url==='/api/students')return okJson({students:STUDENTS});
    const id=new URL(url,'http://localhost').searchParams.get('student');
    return id==='max'?new Promise(resolve=>{release=()=>resolve(okJson(bundleFor('max')))}):okJson(bundleFor(id));}});
  await ui.click({student:'max'});await ui.settle();await ui.fireTimeouts();
  assert.match(ui.html(),/taking too long/);
  release();await ui.settle();
  assert.match(ui.html(),/taking too long/,'the slow answer is ignored once the app has given up on it');
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
  await ui.click({profiles:'1'});await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-A/);assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
});

test('a profile list that never answers times out into Try again, which recovers',async()=>{
  let mode='stall';
  const ui=await createUI({remembered:null,fetch:async(url,opts)=>{
    if(url==='/content/personality.json')return {ok:false,status:404,json:async()=>({})};
    if(url==='/api/students')return mode==='stall'?stall(url,opts):okJson({students:STUDENTS});
    return okJson(bundleFor(new URL(url,'http://localhost').searchParams.get('student')));}});
  assert.match(ui.html(),/Opening Hallway/);
  await ui.fireTimeouts();
  assert.match(ui.html(),/Could not open Hallway/);assert.match(ui.html(),/data-retry="students"/);
  mode='ok';await ui.click({retry:'students'});await ui.settle();
  assert.match(ui.html(),/Choose your profile/);
});

test('links out to Canvas say that sign-in is needed and offer the school sign-in page, taken from the data',async()=>{
  const ui=await createUI();
  await ui.click({go:'a9001'});
  const html=ui.html();
  assert.match(html,/Open this assignment in Canvas/);assert.doesNotMatch(html,/Open original assignment/);
  assert.match(html,/If Canvas says you are not authorized, sign in first/);
  const origin=new URL(bundleFor('max').sources.find(s=>/\/courses\/\d+\/assignments\//.test(s.url||'')).url).origin;
  assert.ok(html.includes('href="'+origin+'/login"'),'sign-in goes to the same Canvas the coursework came from');
  assert.ok(html.indexOf('Sign in to Canvas')<html.indexOf('Open this assignment in Canvas'),'sign in is offered first');
  assert.match(html,/href="[^"]+\/login" target="_blank" rel="noopener noreferrer"/);
  await ui.click({back:'1'});await ui.click({tab:'Settings'});
  assert.match(ui.html(),/Hallway never sees your Canvas password/);assert.ok(ui.html().includes('href="'+origin+'/login"'));
  const none=bundleFor('max');for(const s of none.sources)s.url=null;
  const bare=await createUI({bundles:{max:none}});
  await bare.click({go:'a9001'});assert.doesNotMatch(bare.html(),/Sign in to Canvas|In Canvas<\/h3>/,'no Canvas address captured means no sign-in link is invented');
  await bare.click({back:'1'});await bare.click({tab:'Settings'});assert.doesNotMatch(bare.html(),/Sign in to Canvas/);
});


test('Board views share scope, keep undated and earlier records reachable, and never infer completion',async()=>{
  const ui=await createUI(); await ui.click({tab:'Board'}); await ui.click({period:'all'});
  const ids=()=>JSON.parse(ui.run('JSON.stringify(boardItems().map(d=>d.id))'));
  const expected=ids(), states=ui.run('JSON.stringify(data.map(d=>d.submission.state))');
  for(const view of ['list','week','map']) {await ui.click({boardView:view});assert.deepEqual(ids(),expected);assert.match(ui.html(),/No captured date/);assert.match(ui.html(),/Earlier items/);}
  assert.doesNotMatch(ui.html(),/Grade impact|Size by points/);
  await ui.click({boardSlice:'undated'});assert.deepEqual(ids(),['a9006']);assert.match(ui.html(),/Selected: No captured date/);
  await ui.click({boardView:'map'});assert.deepEqual(ids(),['a9006']);
  await ui.click({period:'7'});assert.equal(ui.run('boardSlice'),'all');
  await ui.click({boardSlice:'earlier'});assert(ids().includes('a9002'));assert(!ids().includes('a9004'),'submitted earlier item remains outside the original seven-day filter');
  await ui.click({reset:'1'});assert.equal(ui.run('period'),'all');assert.equal(ids().length,8);
  assert.equal(ui.run('JSON.stringify(data.map(d=>d.submission.state))'),states);
});

test('Board calendar uses school dates across UTC midnight and DST; day filters clear with range and profile',async()=>{
  const b=bundleFor('max'); b.snapshot.demoNow='2026-11-01T08:30:00Z'; b.snapshot.timeZone='America/Los_Angeles';
  b.assignments[0].dueAt='2026-11-02T07:30:00Z'; // Sunday locally, Monday UTC
  const ui=await createUI({bundles:{max:b,adrian:bundleFor('adrian')}});
  await ui.click({tab:'Board'});await ui.click({period:'all'});await ui.click({boardView:'week'});
  assert.equal(ui.run("schoolDay('2026-11-02T07:30:00Z')"),'2026-11-01');
  assert.equal(ui.run('boardWeek()[0]'),'2026-10-26');assert.equal(ui.run('boardWeek()[6]'),'2026-11-01');
  await ui.click({boardSlice:'2026-11-01'});assert.equal(ui.run('boardView'),'list');assert.equal(ui.run('boardItems()[0].id'),'a9001');
  await ui.click({go:'a9001'});await ui.click({back:'1'});assert.equal(ui.run('boardSlice'),'2026-11-01');
  await ui.click({period:'30'});assert.equal(ui.run('boardSlice'),'all');
  await ui.click({boardView:'week'});await ui.click({week:'1'});assert.equal(ui.run('boardWeek()[0]'),'2026-11-02');
  await ui.click({home:'1'});assert.equal(ui.run('weekOffset'),0);assert.equal(ui.run('boardSlice'),'all');
  await ui.click({tab:'Settings'});await ui.click({profiles:'1'});await ui.click({student:'adrian'});await ui.settle();
  assert.equal(ui.run('boardView'),'list');assert.equal(ui.run('boardSlice'),'all');assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
});

test('Board count and week cells honor class and assessment filters; map detail returns to map',async()=>{
  const ui=await createUI();await ui.click({tab:'Board'});await ui.click({period:'all'});
  ui.event('change',{id:'course',value:'c501',dataset:{}});await ui.click({focus:'assessments'});
  for(const view of ['list','week','map']) {await ui.click({boardView:view});assert.equal(ui.run('boardItems().length'),1);assert.match(ui.html(),/1 matching item/);}
  await ui.click({go:'a9003'});await ui.click({back:'1'});assert.equal(ui.run('boardView'),'map');assert.equal(ui.run('course'),'c501');assert.equal(ui.run('focus'),'assessments');assert.match(ui.html(),/board-map/);
  ui.event('change',{id:'course',value:'c502',dataset:{}});assert.match(ui.html(),/Nothing matches these filters/);assert.doesNotMatch(ui.html(),/No unfinished work/);
});
