'use strict';
// The Canvas capture script runs in a signed-in browser tab. These tests run it against a fake Canvas
// to prove that a shortened read is reported as an error instead of passing as a clean capture.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, 'tools', 'canvas-capture.js'), 'utf8');

async function capture(routes) {
  const calls = [];
  const fakeDoc = {querySelectorAll: () => [], body: {textContent: ''}};
  const sandbox = {
    console: {log() {}}, URL, Date, JSON, Promise, Set, Number, Array, Object, String, Error,
    location: {origin: 'https://canvas.test', host: 'canvas.test'},
    DOMParser: class { parseFromString() { return fakeDoc; } },
    fetch: async url => {
      calls.push(url);
      const u = new URL(url, 'https://canvas.test'), key = u.pathname.replace('/api/v1', '');
      const hit = routes(key, u);
      if (!hit) return {ok: false, status: 404, headers: {get: () => null}, json: async () => ({})};
      return {ok: true, status: 200, headers: {get: h => h === 'Link' && hit.next ? `<${hit.next}>; rel="next"` : null}, json: async () => hit.body};
    },
  };
  sandbox.window = sandbox;
  await vm.runInNewContext(source, sandbox);
  return {calls, out: Object.fromEntries(Object.entries(sandbox.hallwayCapture).map(([k, v]) => [k, JSON.parse(v)]))};
}
const soon = new Date(Date.now() + 86400000).toISOString();
const assignment = id => ({id, name: 'A' + id, description: '', due_at: soon, html_url: 'https://canvas.test/a/' + id, submission: {user_id: 7, workflow_state: 'unsubmitted'}, submission_types: ['online_upload']});
const base = (key, extra) => {
  if (key === '/users/self/observees') return {body: [{id: 7, name: 'Testy McTest'}]};
  if (key === '/users/7/courses') return {body: [{id: 1, name: 'Course', enrollments: [{type: 'student', user_id: 7}], term: null, teachers: []}]};
  return extra(key);
};

test('capture: more pages than the cap is reported as an error, not a clean short list', async () => {
  const {out} = await capture((key, u) => base(key, k => {
    if (k === '/courses/1/assignments') { const page = Number(u.searchParams.get('page') || 1); return {body: [assignment(page)], next: `https://canvas.test/api/v1/courses/1/assignments?page=${page + 1}`}; }
    if (k === '/courses/1/modules') return {body: []};
    return null;
  }));
  const errors = out.testy.errors;
  assert.ok(errors.some(e => e.what === 'assignments' && e.err && e.err.error === 'pagination_exhausted'), JSON.stringify(errors));
});

test('capture: a normal multi-page list is read to the end with no error', async () => {
  const {out} = await capture((key, u) => base(key, k => {
    if (k === '/courses/1/assignments') { const page = Number(u.searchParams.get('page') || 1); return {body: [assignment(page)], next: page < 3 ? `https://canvas.test/api/v1/courses/1/assignments?page=${page + 1}` : null}; }
    if (k === '/courses/1/modules') return {body: []};
    if (/submissions/.test(k)) return {body: {user_id: 7, submission_comments: []}};
    return null;
  }));
  assert.deepEqual(out.testy.errors, []);
  assert.equal(out.testy.assignments.length, 3);
});

test('capture: a module that embeds fewer items than it has gets its full item list; a failed fetch is an error', async () => {
  const mods = [{id: 50, name: 'M', position: 1, items_count: 3, items: [{id: 1, title: 'one', type: 'Page', page_url: 'one'}]}, {id: 51, name: 'N', position: 2, items_count: 2}];
  const routes = ok => (key, u) => base(key, k => {
    if (k === '/courses/1/assignments') return {body: []};
    if (k === '/courses/1/modules') return {body: structuredClone(mods)};
    if (k === '/courses/1/modules/50/items') return {body: [1, 2, 3].map(i => ({id: i, title: 't' + i, type: 'Page', page_url: 'p' + i}))};
    if (k === '/courses/1/modules/51/items') return ok ? {body: [{id: 9, title: 'x', type: 'File', content_id: 4}, {id: 10, title: 'y', type: 'File', content_id: 5}]} : null;
    return null;
  });
  const good = await capture(routes(true));
  assert.deepEqual(good.out.testy.modules[1].map(m => m.items.length), [3, 2]);
  assert.deepEqual(good.out.testy.errors, []);
  const bad = await capture(routes(false));
  assert.ok(bad.out.testy.errors.some(e => e.what === 'module_items' && e.module === 51), JSON.stringify(bad.out.testy.errors));
});
