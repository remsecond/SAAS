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
    console, URL, Intl, Date:class extends Date {}, CSS:{escape:s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c)}, setTimeout: () => 1, clearTimeout() {},
    document: {getElementById: element, querySelector: element, body:element('body')},
    window: {addEventListener(type,fn){listeners['window:'+type]=fn;},scrollY:17, scrollTo() {}, matchMedia: () => ({matches:false,addEventListener(){}})},
    location: {pathname:'/',search:'',hash:'',assign(url) {this.destination=url;}},
    localStorage: {getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v))},
    fetch: options.fetch || (async url => {
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
  return {context,settle,requests,storage,element,run:code=>vm.runInContext(code,context),html:()=>element('app').innerHTML,
    focused:()=>focused,
    windowEvent(type, event={}) {return listeners['window:'+type](event);},
    event(type, target) {return listeners['app:'+type]({target});},
    click(dataset,classes=[]) {const target={dataset,classList:{contains:c=>classes.includes(c)}};target.closest=()=>target;return listeners['app:click']({target});},
  };
}



test('each student sees only their own captured coursework, labeled, with no passcode',async()=>{
  const ui=await createUI();
  assert.match(ui.html(),/Max&#39;s coursework/);
  assert.match(ui.html(),/data-student="max" aria-pressed="true"/);
  assert.match(ui.html(),/data-student="adrian" aria-pressed="false"/);
  assert.match(ui.html(),/SYNTHETIC-M/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-A|passcode|type="password"|data-logout/);
  await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/Adrian&#39;s coursework/);
  assert.match(ui.html(),/SYNTHETIC-A/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-M/);
  assert.equal(ui.storage.get('hallway.student'),'adrian');
});
test('first visit asks who is looking instead of guessing a student',async()=>{
  const ui=await createUI({remembered:null});
  assert.match(ui.html(),/Whose Hallway\?/);
  assert.doesNotMatch(ui.html(),/SYNTHETIC-/);
  assert.deepEqual(ui.requests,['/api/students']);
  await ui.click({student:'adrian'});await ui.settle();
  assert.match(ui.html(),/SYNTHETIC-A/);
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
  assert.match(ui.html(),/data-student="max"/,'switcher stays usable');
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
  assert.match(before,/Next deadline in this sample/);
  assert.match(before,/Captured from Canvas/);
  assert.match(before,/frozen sample, not live/);
  const attention=ui.run("data.filter(d=>d.attention).map(d=>d.id).sort().join()");
  assert.equal(attention,'a9001,a9002,a9003,a9006','submitted, graded-with-old-due-date, excused and past on-paper items are not unfinished');
  await ui.click({go:'a9005'});
  assert.match(ui.html(),/GRADED/);assert.match(ui.html(),/Hallway does not show grades/);
  assert.doesNotMatch(ui.html(),/<span>Grade<\/span>|points possible|score/i);
  await ui.click({back:'1'});await ui.click({go:'a9007'});
  assert.match(ui.html(),/cannot tell whether it is done/);
  await ui.click({back:'1'});await ui.click({go:'a9006'});
  assert.match(ui.html(),/No due date is set in Canvas/);
  assert.match(ui.html(),/no written instructions in Canvas/);
  const empty=bundleFor('max');empty.assignments=[];
  const none=await createUI({bundles:{max:empty}});
  assert.match(none.html(),/No upcoming deadline in this sample/);
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
  await ui.click({layout:'yes'});
  assert.match(ui.html(),/class="tiles "/);
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
test('theme, width and large text controls change presentation',async()=>{
  const ui=await createUI();
  ui.element('size').oninput({target:{value:'180'}});
  assert.equal(ui.element('phone').style.fontSize,'1.8rem');
  ui.element('width').oninput({target:{value:'320'}});
  assert.equal(ui.element('phone').style.width,'320px');
  ui.element('theme').value='contrast';ui.element('theme').onchange();
  assert.equal(ui.element('body').dataset.theme,'contrast');
});
test('Home puts unfinished work first, soonest first, and keeps detail navigation',async()=>{
  const ui=await createUI();
  const html=ui.html();
  const start=html.indexOf('aria-label="Needs you"');
  assert(start>=0 && start<html.indexOf('What changed'));
  const attention=html.slice(start,html.indexOf('</section>',start));
  assert(attention.indexOf('data-go="a9002"')<attention.indexOf('data-go="a9001"'));
  assert.doesNotMatch(attention,/data-go="a9004"/);
  await ui.click({go:'a9002'});
  assert.match(ui.html(),/Next action/);
  await ui.click({back:'1'});
  assert.match(ui.html(),/aria-label="Needs you"/);
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
