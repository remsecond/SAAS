'use strict';
// Turns a raw Canvas capture (taken through authorized observer access) into a
// Hallway student bundle. Nothing is authored here: every title, instruction,
// date, status, comment and link comes from the capture. Where Canvas had
// nothing, the bundle says so with a reason.
//
//   node tools/build-bundle.cjs <student> <raw.json> <out.json> [--reference <ISO time>]
//
// Raw captures and built bundles belong in private-data/ (git-ignored).
const fs = require('node:fs');
const {STUDENTS, validateBundle} = require('../bundles.cjs');

const DAY = 86400000;
const TIME_ZONE = 'America/Los_Angeles';
const iso = v => (v ? new Date(v).toISOString() : null);
const unavailable = (reason, explanation) => ({state: 'unavailable', reason, explanation, evidenceSourceIds: []});

function submissionState(s, types) {
  if (!s) return 'unknown';
  if (s.excused) return 'excused';
  if (s.missing) return 'missing';
  if (s.state === 'graded') return 'graded';
  if (s.state === 'submitted' || s.state === 'pending_review') return 'submitted';
  if (s.state === 'unsubmitted') return (types || []).every(t => ['none', 'on_paper', 'not_graded'].includes(t)) ? 'not_tracked' : 'not_submitted';
  return 'unknown';
}

function classifyLink(url) {
  let host = '';
  try { const u = new URL(url); if (u.protocol !== 'https:') return null; host = u.host; } catch { return null; }
  if (/(^|\.)google\.com$/.test(host)) return {kind: 'google', label: 'Open in Google', explanation: 'This opens in Google with your school account. Its content was not copied into Hallway.'};
  if (/youtube\.com$|youtu\.be$/.test(host)) return {kind: 'video', label: 'Open video', explanation: 'This is a video link. Hallway saved the link, not the video.'};
  if (/instructure\.com$/.test(host)) return {kind: 'canvas', label: 'Open in Canvas', explanation: 'This opens in Canvas. Its content was not copied into Hallway.'};
  return {kind: 'web', label: 'Open link', explanation: 'This is a link your teacher included. Hallway saved the link, not the page.'};
}

function buildBundle(studentId, raw, {reference} = {}) {
  const student = STUDENTS.find(s => s.id === studentId);
  if (!student) throw new Error('Unknown student: ' + studentId);
  if (!Number.isInteger(raw.studentId)) throw new Error('Raw capture has no Canvas student id');
  const first = String(raw.studentName || '').trim().split(/\s+/)[0].toLowerCase();
  if (first !== student.displayName.toLowerCase()) throw new Error(`Capture is for "${raw.studentName}", not ${student.displayName}`);
  if ((raw.errors || []).length) throw new Error('Capture recorded fetch errors; re-capture before building: ' + JSON.stringify(raw.errors));
  for (const c of raw.courses) if (c.enr !== 'student:' + raw.studentId) throw new Error(`Course ${c.id} is not a student enrollment for this student`);
  const rawCourseIds = new Set(raw.courses.map(c => c.id));
  for (const a of raw.assignments) {
    if (!rawCourseIds.has(a.courseId)) throw new Error(`Assignment ${a.id} is in a course this student is not enrolled in`);
    if (a.submission && a.submission.userId !== raw.studentId) throw new Error(`Assignment ${a.id} carries another student's submission`);
  }

  const sid = student.id, capturedAt = iso(raw.capturedAt), demoNow = iso(reference || raw.capturedAt);
  const captureDay = new Intl.DateTimeFormat('en-US', {timeZone: TIME_ZONE, dateStyle: 'long'}).format(new Date(capturedAt));
  const provenance = what => `${what} captured from Canvas (Seattle Academy) through parent observer access on ${captureDay}. The course is one of ${student.displayName}'s own student enrollments.`;
  const sources = [], resources = [], resourceByKey = new Map();
  const addSource = (id, title, url, what) => { sources.push({id, studentId: sid, title, url: url || null, checkedAt: capturedAt, retrieval: {state: 'captured'}, provenance: provenance(what)}); return id; };

  const courses = raw.courses.map(c => ({id: 'c' + c.id, studentId: sid, title: c.name, description: c.teachers ? 'Teacher: ' + c.teachers : 'Teacher not listed in Canvas.', term: c.term || null}));

  function pageResource(p, relationship) {
    const key = 'page:' + p.courseId + ':' + p.slug;
    if (resourceByKey.has(key)) return resourceByKey.get(key);
    const id = `p${p.courseId}-${p.slug}`.slice(0, 80);
    const sourceId = addSource('src-' + id, p.title || 'Canvas page', p.htmlUrl, 'Canvas page');
    const embedOnly = !!p.body && !p.body.replace(/\[embedded:[^\]]*\]/g, '').trim();
    const body = embedOnly ? '' : p.body && p.body.trim();
    resources.push({id, studentId: sid, courseId: 'c' + p.courseId, title: p.title || 'Canvas page', kind: 'canvas_page', body: body || null, relationship,
      availability: body ? {state: 'available'} : embedOnly ? unavailable('not_in_snapshot', 'This Canvas page only holds an embedded slideshow or file. Hallway saved the link, not the slides. Open it with your school account.') : p.error ? unavailable('fetch_failed', 'Hallway could not read this Canvas page when the capture was taken. Open it in Canvas.') : p.locked ? unavailable('access_denied', 'This page is locked in Canvas right now.') : unavailable('empty_at_source', 'This Canvas page has no text on it.'),
      action: {kind: 'open', label: 'Open in Canvas', url: p.htmlUrl || null}, links: (p.links || []).filter(l => classifyLink(l.url)).map(l => ({text: l.text || l.url, url: l.url})), sourceId});
    resourceByKey.set(key, id);
    return id;
  }
  function fileResource(f, relationship) {
    const key = 'file:' + f.id;
    if (resourceByKey.has(key)) return resourceByKey.get(key);
    const id = 'f' + f.id, title = f.name || 'Canvas file';
    const sourceId = addSource('src-' + id, title, f.htmlUrl, 'File listing');
    resources.push({id, studentId: sid, courseId: 'c' + f.courseId, title, kind: 'canvas_file', body: null, relationship,
      availability: f.error ? unavailable('fetch_failed', 'Hallway could not read this file listing when the capture was taken.') : unavailable('not_in_snapshot', 'This file was not copied into Hallway. Open it in Canvas to read it.'),
      action: {kind: 'open', label: 'Open file in Canvas', url: f.htmlUrl || null}, sourceId});
    resourceByKey.set(key, id);
    return id;
  }
  function linkResource(a, l, n) {
    const info = classifyLink(l.url);
    if (!info) return null;
    const key = 'link:' + a.id + ':' + l.url;
    if (resourceByKey.has(key)) return resourceByKey.get(key);
    const id = `l${a.id}-${n}`, title = (l.text && l.text.trim()) || l.url;
    const sourceId = addSource('src-' + id, title, l.url, 'Link in the assignment instructions');
    resources.push({id, studentId: sid, courseId: 'c' + a.courseId, title, kind: info.kind + '_link', body: null, relationship: 'Linked in the assignment instructions.',
      availability: unavailable('not_in_snapshot', info.explanation), action: {kind: 'open', label: info.label, url: l.url}, sourceId});
    resourceByKey.set(key, id);
    return id;
  }

  const pages = new Map((raw.pages || []).map(p => [p.courseId + '|' + p.slug, p]));
  const files = new Map((raw.files || []).map(f => [String(f.id), f]));
  const assignments = raw.assignments.map(a => {
    const sourceId = addSource('src-a' + a.id, a.name, a.htmlUrl, 'Assignment');
    const resourceIds = [];
    const push = id => { if (id && !resourceIds.includes(id)) resourceIds.push(id); };
    (a.links || []).forEach((l, n) => {
      const page = l.url.match(/\/courses\/(\d+)\/pages\/([^?#/]+)/), file = l.url.match(/\/files\/(\d+)/);
      if (page && pages.has(page[1] + '|' + page[2])) push(pageResource(pages.get(page[1] + '|' + page[2]), 'Linked in the assignment instructions.'));
      else if (file && files.has(file[1])) push(fileResource(files.get(file[1]), 'Linked in the assignment instructions.'));
      else push(linkResource(a, l, n));
    });
    for (const mod of (raw.modules || {})[a.courseId] || []) {
      if (!mod.items.some(i => i.type === 'Assignment' && i.contentId === a.id)) continue;
      const relationship = `In the same Canvas module: ${mod.name}.`;
      for (const i of mod.items) {
        if (i.type === 'Page' && pages.has(a.courseId + '|' + i.pageUrl)) push(pageResource(pages.get(a.courseId + '|' + i.pageUrl), relationship));
        if (i.type === 'File' && files.has(String(i.contentId))) push(fileResource(files.get(String(i.contentId)), relationship));
      }
    }
    const state = submissionState(a.submission, a.submissionTypes);
    const record = {
      id: 'a' + a.id, studentId: sid, courseId: 'c' + a.courseId, title: a.name,
      kind: a.isQuiz || /\b(quiz|test|exam|assessment)\b/i.test(a.name) ? 'assessment' : 'assignment',
      dueAt: iso(a.dueAt), dueAvailability: a.dueAt ? {state: 'available'} : unavailable('empty_at_source', 'No due date is set in Canvas for this item.'),
      submission: {state, submittedAt: iso(a.submission && a.submission.submittedAt), late: !!(a.submission && a.submission.late), sourceId},
      description: a.description || null,
      feedback: a.comments === null ? [] : (a.comments || []).map(c => ({author: c.author || null, text: c.text || '', postedAt: iso(c.at), sourceId})),
      resourceIds, sourceId,
    };
    if (!record.description) record.descriptionAvailability = a.lockedForUser ? unavailable('access_denied', 'Canvas has this item locked right now, so its instructions could not be read.') : unavailable('empty_at_source', 'There are no written instructions in Canvas for this item.');
    if (a.comments === null) record.feedbackAvailability = unavailable('fetch_failed', 'Comments could not be read when the capture was taken.');
    return record;
  });

  const ex = Object.values(raw.excluded || {}).reduce((t, e) => ({total: t.total + e.total, undated: t.undated + e.undatedSkipped, future: t.future + e.futureBeyondWindow, older: t.older + e.olderFinished}), {total: 0, undated: 0, future: 0, older: 0});
  const bundle = {
    contractVersion: '0.2', exampleOnly: false,
    snapshot: {
      id: `canvas-${sid}-${capturedAt}`, mode: 'frozen_capture', student: {id: sid, displayName: student.displayName}, capturedAt, demoNow, timeZone: TIME_ZONE,
      coverage: {
        state: 'partial', windowStart: iso(new Date(capturedAt).getTime() - 7 * DAY), windowEnd: iso(new Date(capturedAt).getTime() + 14 * DAY),
        includedCourseIds: courses.map(c => c.id),
        counts: {coursesChecked: courses.length, assignmentsInCanvas: ex.total, assignmentsIncluded: assignments.length, laterThanWindow: ex.future, olderFinished: ex.older, undatedNotIncluded: ex.undated},
        explanation: `A sample of ${student.displayName}'s Canvas coursework captured ${captureDay}: work due in the week before and the two weeks after that day, plus older unfinished work. ${assignments.length} of ${ex.total} Canvas items are included. Not included: ${ex.future} due later, ${ex.older} older finished, ${ex.undated} undated. Anything teachers posted after the capture is not here.`,
      },
    },
    courses, assignments, resources, sources, changes: [],
  };
  const result = validateBundle(bundle, sid);
  if (!result.ok) throw new Error('Built bundle failed validation:\n' + result.errors.join('\n'));
  return bundle;
}

if (require.main === module) {
  const [studentId, rawPath, outPath, flag, reference] = process.argv.slice(2);
  if (!studentId || !rawPath || !outPath || (flag && flag !== '--reference')) { console.error('Usage: node tools/build-bundle.cjs <student> <raw.json> <out.json> [--reference <ISO time>]'); process.exit(2); }
  const bundle = buildBundle(studentId, JSON.parse(fs.readFileSync(rawPath, 'utf8')), {reference});
  fs.mkdirSync(require('node:path').dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, JSON.stringify(bundle), {mode: 0o600});
  const by = (list, f) => list.reduce((m, x) => { m[f(x)] = (m[f(x)] || 0) + 1; return m; }, {});
  console.log(JSON.stringify({student: studentId, capturedAt: bundle.snapshot.capturedAt, referenceClock: bundle.snapshot.demoNow, courses: bundle.courses.length, assignments: bundle.assignments.length, submissionStates: by(bundle.assignments, a => a.submission.state), withInstructions: bundle.assignments.filter(a => a.description).length, withComments: bundle.assignments.filter(a => a.feedback.length).length, resources: by(bundle.resources, r => r.kind + (r.availability.state === 'available' ? ':readable' : ':link-only')), coverage: bundle.snapshot.coverage.counts}, null, 1));
}
module.exports = {buildBundle, submissionState};
