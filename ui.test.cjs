'use strict';
// These are JavaScript behavior tests with a minimal DOM adapter, not browser,
// layout, accessibility, or actual-phone tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const {getDemoSnapshot} = require('./fixtures.cjs');

async function createUI(snapshot = getDemoSnapshot(), response = {}) {
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



test('public demo has no identity gate, grades or clock drift',async()=>{
  const ui=await createUI();
  assert.doesNotMatch(ui.html(),/data-logout|passcode|Select.*student|Max|Adrian/);
  assert.equal(ui.context.location.destination,undefined);
  const before=ui.html();
  ui.run('Date.now=()=>0;render()');
  assert.equal(ui.html(),before);
  for(const assignment of getDemoSnapshot().assignments) {
    await ui.click({go:assignment.id});
    assert.doesNotMatch(ui.html(),/<span>Grade<\/span>|points possible/i);
  }
});
test('course and assessment filters retain selection across detail navigation',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});
  await ui.click({period:'all'});
  ui.event('change',{id:'course',value:'science',dataset:{}});
  const expected=ui.run("data.filter(d=>d.courseId==='science').length");
  assert.match(ui.html(),new RegExp(expected+' matching item'));
  await ui.click({go:'lab'});
  await ui.click({back:'1'});
  assert.equal(ui.run('course'),'science');
  assert.equal(ui.run('period'),'all');
  await ui.click({layout:'yes'});
  assert.match(ui.html(),/class="tiles list"/);
  await ui.click({home:'1'});
  assert.equal(ui.run('course'),'all');
  assert.equal(ui.run('period'),'7');
});
test('drafts and checklists retain edits during navigation without pretending to send',async()=>{
  const ui=await createUI();
  await ui.click({go:'draft:email'});
  assert.match(ui.html(),/Nothing is sent/i);
  ui.event('input',{dataset:{draft:'email'},value:'My own <draft> & question'});
  await ui.click({home:'1'});
  await ui.click({go:'draft:email'});
  assert.match(ui.html(),/My own &lt;draft&gt; &amp; question/);
  await ui.click({go:'tracker:email'});
  ui.event('change',{dataset:{check:'email-0'},checked:true});
  await ui.click({home:'1'});
  await ui.click({go:'tracker:email'});
  assert.match(ui.html(),/data-check="email-0" checked/);
});
test('related material is readable and nested Back returns to its assignment',async()=>{
  const demo=getDemoSnapshot();
  const assignment=demo.assignments.find(a=>a.resourceIds.some(id=>demo.resources.find(r=>r.id===id)?.body));
  const resource=demo.resources.find(r=>assignment.resourceIds.includes(r.id)&&r.body);
  const ui=await createUI(demo);
  await ui.click({go:assignment.id});
  await ui.click({go:'prepare:'+assignment.id});
  await ui.click({go:'resource:'+resource.id});
  assert(ui.html().includes(ui.run('esc('+JSON.stringify(resource.body)+')')));
  await ui.click({back:'1'});
  assert.match(ui.html(),/Help me prepare/);
  await ui.click({back:'1'});
  assert.equal(ui.run('page'),assignment.id);
  await ui.click({go:'does-not-exist'});
  assert.match(ui.html(),/Item unavailable/);
});
test('content and drafts are escaped and non-HTTPS source actions suppressed',async()=>{
  const demo=getDemoSnapshot();
  demo.assignments[0].title='<img src=x onerror=alert(1)>';
  demo.sources[0].url='javascript:alert(1)';
  const ui=await createUI(demo);
  await ui.click({tab:'Board'});await ui.click({period:'all'});
  assert.doesNotMatch(ui.html(),/<img src=x/);
  assert.match(ui.html(),/&lt;img src=x/);
  await ui.click({go:demo.assignments[0].id});
  assert.doesNotMatch(ui.html(),/href="javascript:/);
  assert.equal(ui.run("safeUrl('https://example.com/a')"),'https://example.com/a');
  assert.equal(ui.run("safeUrl('data:text/html,hello')"),null);
});
test('load failures show retry without introducing a login gate',async()=>{
  for(const status of [401,503]) {
    const ui=await createUI(undefined,{ok:false,status});
    assert.match(ui.html(),/Try again/);
    assert.equal(ui.context.location.destination,undefined);
    assert.doesNotMatch(ui.html(),/sign-in|href="\/login"/);
  }
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
module.exports={createUI};
test('undated work stays visible and an empty filter offers a reset',async()=>{
  const ui=await createUI();
  await ui.click({tab:'Board'});
  assert.match(ui.html(),/data-go="undated"/);
  ui.event('change',{id:'course',value:'absent-course',dataset:{}});
  assert.match(ui.html(),/0 matching items/);
  assert.match(ui.html(),/Nothing matches these filters/);
  assert.match(ui.html(),/data-reset="1"/);
  await ui.click({reset:'1'});
  assert.match(ui.html(),/data-go="undated"/);
});
