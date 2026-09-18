'use strict';
// These are JavaScript behavior tests with a minimal DOM adapter, not browser,
// layout, accessibility, or actual-phone tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const {getFixture} = require('./fixtures.cjs');

async function createUI(snapshot = getFixture('max'), response = {}) {
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
    fetch: async () => ({ok:true,status:200,json:async()=>structuredClone(snapshot),...response}),
  };
  sandbox.window.location=sandbox.location;
  const context=vm.createContext(sandbox);
  const html=fs.readFileSync(path.join(__dirname,'public/index.html'),'utf8');
  for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const source=match[1].match(/src=["']([^"']+)/);
    vm.runInContext(source?fs.readFileSync(path.join(__dirname,'public',source[1].replace(/^\//,'')),'utf8'):match[2],context);
  }
  await new Promise(resolve=>setImmediate(resolve));
  return {context,element,run:code=>vm.runInContext(code,context),html:()=>element('app').innerHTML,
    focused:()=>focused,
    windowEvent(type, event={}) {return listeners['window:'+type](event);},
    event(type, target) {return listeners['app:'+type]({target});},
    click(dataset,classes=[]) {const target={dataset,classList:{contains:c=>classes.includes(c)}};target.closest=()=>target;return listeners['app:click']({target});},
  };
}


test('frozen reference clock and capture status remain explicit',async()=>{
  const ui=await createUI();
  assert.match(ui.html(),/Fictional sample data · no personal snapshot captured/);
  assert.match(ui.html(),/Frozen demo clock:/);
  assert.match(ui.html(),/1h 17m from the frozen clock/);
  const before=ui.html();
  ui.run('Date.now=()=>0;render()');
  assert.equal(ui.html(),before,'wall clock must not change deadlines');
});
test('filters apply immediately, keep overdue/undated items, and explain empty views',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});
  ui.event('change',{id:'course',value:'science',dataset:{}});
  assert.match(ui.html(),/3 matching items/);
  assert.match(ui.html(),/data-go="welcome"/);
  assert.match(ui.html(),/data-go="undated"/);
  assert.doesNotMatch(ui.html(),/class="tile[^>]*data-go="outline"/);
  await ui.click({focus:'assessments'});
  assert.match(ui.html(),/0 matching items/);
  assert.match(ui.html(),/not an all-clear/);
  await ui.click({reset:'1'});
  assert.match(ui.html(),/5 matching items/);
  await ui.click({period:'all'});
  assert.match(ui.html(),/7 matching items/);
  await ui.click({layout:'yes'});
  assert.match(ui.html(),/class="tiles list"/);
});
test('nested Back restores logical focus target and Home resets filters',async()=>{
  const ui=await createUI();
  await ui.click({go:'reflection'});
  await ui.click({go:'prepare:reflection'});
  await ui.click({go:'resource:lab-preview'});
  assert.match(ui.html(),/Prepared fictional example/);
  await ui.click({back:'1'});
  assert.match(ui.html(),/Help me prepare/);
  assert.equal(ui.focused(),'[data-go="resource\\:lab-preview"]');
  await ui.click({back:'1'});
  assert.match(ui.html(),/Teacher feedback/);
  await ui.click({home:'1'});
  assert.equal(ui.run('navStack.length'),0);
  assert.equal(ui.run('page'), 'home');
  assert.equal(ui.run('period'), '7');
});
test('drafts, checklists and follow-up notes persist across navigation without clearing school flags',async()=>{
  const ui=await createUI();
  await ui.click({go:'welcome'});
  await ui.click({sent:'welcome'});
  assert.match(ui.html(),/MISSING/);
  assert.match(ui.html(),/school status has not changed/);
  await ui.click({go:'draft:welcome'});
  ui.event('input',{dataset:{draft:'welcome'},value:'My own <draft> & question'});
  await ui.click({home:'1'});
  await ui.click({go:'draft:welcome'});
  assert.match(ui.html(),/My own &lt;draft&gt; &amp; question/);
  await ui.click({go:'tracker:welcome'});
  ui.event('change',{dataset:{check:'welcome-0'},checked:true});
  await ui.click({home:'1'});
  await ui.click({go:'tracker:welcome'});
  assert.match(ui.html(),/data-check="welcome-0" checked/);
});
test('unknown source values never become zero grades or reassuring all-clear',async()=>{
  const ui=await createUI();
  await ui.click({go:'undated'});
  assert.match(ui.html(),/No due date is included/);
  assert.match(ui.html(),/STATUS UNKNOWN/);
  assert.match(ui.html(),/this does not mean zero/);
  assert.match(ui.html(),/No feedback captured; this does not establish that none exists/);
  await ui.click({go:'resource:lab-source'});
  assert.match(ui.html(),/original material is not included/);
  assert.match(ui.html(),/No verified external destination/);
  await ui.click({go:'does-not-exist'});
  assert.match(ui.html(),/Item unavailable/);
  await ui.click({home:'1'});
  assert.match(ui.html(),/History has not been collected yet/);
});
test('school text and drafts are escaped and non-HTTPS source actions are suppressed',async()=>{
  const fixture=getFixture('max');
  fixture.assignments[0].title='<img src=x onerror=alert(1)>';
  fixture.sources[0].url='javascript:alert(1)';
  fixture.snapshot.student.displayName='<script>alert(1)</script>';
  const ui=await createUI(fixture);
  assert.doesNotMatch(ui.html(),/<img src=x|<script>alert/);
  assert.match(ui.html(),/&lt;img src=x/);
  await ui.click({go:'welcome'});
  assert.doesNotMatch(ui.html(),/href="javascript:/);
  assert.equal(ui.run("safeUrl('https://example.com/a')"),'https://example.com/a');
  assert.equal(ui.run("safeUrl('data:text/html,hello')"),null);
});
test('load failures and expired sessions do not produce an empty work board',async()=>{
  const failed=await createUI(undefined,{ok:false,status:503});
  assert.match(failed.html(),/Could not open your snapshot/);
  assert.match(failed.html(),/does not mean that no work is due/);
  const expired=await createUI(undefined,{ok:false,status:401});
  assert.equal(expired.context.location.destination,'/login');
});
test('theme and large text controls update settings; logout navigates only on success',async()=>{
  const ui=await createUI();
  ui.element('size').oninput({target:{value:'180'}});
  assert.equal(ui.element('phone').style.fontSize,'1.8rem');
  ui.element('theme').value='contrast';ui.element('theme').onchange();
  assert.equal(ui.element('body').dataset.theme,'contrast');
  await ui.click({logout:'1'});
  assert.equal(ui.context.location.destination,'/login');
});
module.exports={createUI};

test('graded and excused work is complete and is not presented as needing attention',async()=>{
  const fixture=getFixture('max');
  fixture.assignments.find(a=>a.id==='practice').submission.state='graded';
  fixture.assignments.find(a=>a.id==='quiz').submission.state='excused';
  const ui=await createUI(fixture);
  await ui.click({tab:'Board'});await ui.click({period:'all'});
  assert.match(ui.html(),/GRADED/);assert.match(ui.html(),/EXCUSED/);
  await ui.click({focus:'attention'});
  assert.doesNotMatch(ui.html(),/data-go="practice"|data-go="quiz"/);
});
test('pagehide erases personal UI and local drafts; persisted return reloads authorization',async()=>{
  const ui=await createUI();
  await ui.click({go:'draft:welcome'});
  ui.event('input',{dataset:{draft:'welcome'},value:'Personal draft'});
  ui.windowEvent('pagehide');
  assert.equal(ui.html(),'');
  assert.equal(ui.run('bundle'),undefined);
  assert.equal(ui.run('data.length'),0);
  assert.equal(ui.run('Object.keys(drafts).length'),0);
  ui.context.fetch=async()=>({ok:false,status:401});
  ui.windowEvent('pageshow',{persisted:true});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(ui.context.location.destination,'/login');
  assert.doesNotMatch(ui.html(),/Personal draft|Example welcome note/);
});

test('a late snapshot response cannot refill a page after it is hidden',async()=>{
  const ui=await createUI();
  let finish;
  ui.context.fetch=()=>new Promise(resolve=>{finish=resolve;});
  const loading=ui.run('loadSnapshot()');
  ui.windowEvent('pagehide');
  finish({ok:true,status:200,json:async()=>getFixture('max')});
  await loading;
  assert.equal(ui.html(),'');
  assert.equal(ui.run('bundle'),undefined);
});
