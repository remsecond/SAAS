'use strict';
// Loads and validates each student's captured coursework bundle.
// Bundles live outside the repository (private-data/snapshots by default).
// There is deliberately no fallback to authored fixtures: a missing or invalid
// bundle is reported as unavailable, never replaced with example content.
const fs = require('node:fs');
const path = require('node:path');

const STUDENTS = Object.freeze([
  Object.freeze({id: 'max', displayName: 'Max'}),
  Object.freeze({id: 'adrian', displayName: 'Adrian'}),
]);
const REASONS = ['not_in_snapshot', 'access_denied', 'empty_at_source', 'not_recorded', 'not_yet_posted', 'fetch_failed', 'unsupported', 'unknown', 'not_built'];
const SUBMISSION_STATES = ['missing', 'not_submitted', 'submitted', 'graded', 'excused', 'not_tracked', 'unknown'];
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isTime = v => typeof v === 'string' && ISO_WITH_OFFSET.test(v) && Number.isFinite(Date.parse(v));
function httpsOrNull(v) {
  if (v === null || v === undefined) return true;
  try { return new URL(v).protocol === 'https:'; } catch { return false; }
}
function checkAvailability(a, where, errors) {
  if (!isObject(a)) return errors.push(`${where}: availability missing`);
  if (a.state === 'available') return;
  if (a.state !== 'unavailable') return errors.push(`${where}: availability state invalid`);
  if (!REASONS.includes(a.reason)) errors.push(`${where}: unavailable reason invalid`);
  if (typeof a.explanation !== 'string' || !a.explanation.trim()) errors.push(`${where}: unavailable explanation required`);
}

function validateBundle(bundle, expectedStudentId) {
  const errors = [];
  if (!isObject(bundle)) return {ok: false, errors: ['bundle is not an object']};
  if (bundle.exampleOnly !== false) errors.push('bundle must be a real capture (exampleOnly: false)');
  const snap = bundle.snapshot;
  if (!isObject(snap)) return {ok: false, errors: [...errors, 'snapshot missing']};
  const sid = snap.student?.id;
  if (sid !== expectedStudentId) errors.push('snapshot student does not match the requested student');
  if (!STUDENTS.some(s => s.id === sid && s.displayName === snap.student?.displayName)) errors.push('snapshot student is not a known student');
  if (!isTime(snap.capturedAt)) errors.push('capturedAt must be an ISO timestamp with offset');
  if (!isTime(snap.demoNow)) errors.push('demoNow (reference clock) must be an ISO timestamp with offset');
  if (typeof snap.timeZone !== 'string' || !snap.timeZone) errors.push('timeZone required');
  else { try { new Intl.DateTimeFormat('en-US', {timeZone: snap.timeZone}); } catch { errors.push('timeZone is not one the app can format dates in'); } }
  const cov = snap.coverage;
  if (!isObject(cov)) errors.push('coverage missing');
  else {
    if (!['partial', 'complete'].includes(cov.state)) errors.push('coverage state must be partial or complete');
    if (!isTime(cov.windowStart) || !isTime(cov.windowEnd)) errors.push('coverage window required');
    else if (Date.parse(cov.windowStart) > Date.parse(cov.windowEnd)) errors.push('coverage window ends before it starts');
    if (typeof cov.explanation !== 'string' || !cov.explanation.trim()) errors.push('coverage explanation required');
    if (!Array.isArray(cov.includedCourseIds) || !cov.includedCourseIds.every(id => typeof id === 'string')) errors.push('coverage includedCourseIds must be a list of ids');
  }
  for (const key of ['courses', 'assignments', 'resources', 'sources', 'changes']) if (!Array.isArray(bundle[key])) errors.push(`${key} must be an array`);
  if (errors.length) return {ok: false, errors};
  // Every row must be a plain object before anything below reads a field from it.
  // (Independent review, Sept 19: a single null row used to throw and take the profile list down.)
  for (const key of ['courses', 'assignments', 'resources', 'sources', 'changes']) {
    bundle[key].forEach((r, i) => { if (!isObject(r)) errors.push(`${key}[${i}]: not a record`); });
  }
  if (errors.length) return {ok: false, errors};

  const ids = list => new Set(list.map(r => r.id));
  const courseIds = ids(bundle.courses), resourceIds = ids(bundle.resources), sourceIds = ids(bundle.sources), assignmentIds = ids(bundle.assignments);
  for (const [key, set] of [['courses', courseIds], ['assignments', assignmentIds], ['resources', resourceIds], ['sources', sourceIds]]) {
    if (set.size !== bundle[key].length) errors.push(`${key}: duplicate ids`);
  }
  for (const key of ['courses', 'assignments', 'resources', 'sources', 'changes']) {
    bundle[key].forEach((r, i) => {
      if (!isObject(r) || typeof r.id !== 'string' || !r.id) return errors.push(`${key}[${i}]: id required`);
      if (r.studentId !== sid) errors.push(`${key}[${i}]: belongs to a different student`);
    });
  }
  for (const id of cov.includedCourseIds) if (!courseIds.has(id)) errors.push(`coverage course ${id} does not resolve`);
  for (const s of bundle.sources) {
    if (!httpsOrNull(s.url)) errors.push(`source ${s.id}: url must be https`);
    if (typeof s.provenance !== 'string' || !s.provenance.trim()) errors.push(`source ${s.id}: provenance required`);
    if (s.checkedAt !== null && !isTime(s.checkedAt)) errors.push(`source ${s.id}: checkedAt invalid`);
  }
  for (const a of bundle.assignments) {
    const where = `assignment ${a.id}`;
    if (typeof a.title !== 'string' || !a.title.trim()) errors.push(`${where}: title required`);
    if (!courseIds.has(a.courseId)) errors.push(`${where}: course does not resolve`);
    if (!sourceIds.has(a.sourceId)) errors.push(`${where}: source does not resolve`);
    if (a.dueAt !== null && !isTime(a.dueAt)) errors.push(`${where}: dueAt invalid`);
    if (a.dueAt === null) checkAvailability(a.dueAvailability, `${where} due date`, errors);
    if (!a.description) checkAvailability(a.descriptionAvailability, `${where} description`, errors);
    if (!isObject(a.submission) || !SUBMISSION_STATES.includes(a.submission.state)) errors.push(`${where}: submission state invalid`);
    if (Object.hasOwn(a, 'grade') || Object.hasOwn(a, 'score')) errors.push(`${where}: grades are not part of this release`);
    if (!Array.isArray(a.feedback)) errors.push(`${where}: feedback must be an array`);
    else for (const f of a.feedback) if (!isObject(f) || !sourceIds.has(f.sourceId) || typeof f.text !== 'string') errors.push(`${where}: feedback needs text and a resolving source`);
    if (!Array.isArray(a.resourceIds)) errors.push(`${where}: resourceIds must be an array`);
    else for (const id of a.resourceIds) if (!resourceIds.has(id)) errors.push(`${where}: resource ${id} does not resolve`);
  }
  for (const r of bundle.resources) {
    const where = `resource ${r.id}`;
    if (typeof r.title !== 'string' || !r.title.trim()) errors.push(`${where}: title required`);
    if (!sourceIds.has(r.sourceId)) errors.push(`${where}: source does not resolve`);
    checkAvailability(r.availability, where, errors);
    if (r.availability?.state === 'available' && !(typeof r.body === 'string' && r.body.trim())) errors.push(`${where}: available material needs captured content`);
    if (r.action != null && !isObject(r.action)) errors.push(`${where}: action must be a record`);
    else if (!httpsOrNull(r.action?.url)) errors.push(`${where}: action url must be https`);
  }
  for (const c of bundle.changes) if (!assignmentIds.has(c.assignmentId) || !sourceIds.has(c.sourceId)) errors.push(`change ${c.id}: references do not resolve`);
  return {ok: errors.length === 0, errors};
}

function createStore({dir} = {}) {
  const root = path.resolve(dir || process.env.HALLWAY_SNAPSHOT_DIR || path.join(__dirname, 'private-data', 'snapshots'));
  function read(id) {
    const student = STUDENTS.find(s => s.id === id);
    if (!student) return {status: 'unknown_student'};
    let text;
    try { text = fs.readFileSync(path.join(root, student.id + '.json'), 'utf8'); }
    catch { return {status: 'missing', student}; }
    let bundle;
    try { bundle = JSON.parse(text); } catch { return {status: 'invalid', student, errors: ['not valid JSON']}; }
    let result;
    try { result = validateBundle(bundle, student.id); }
    catch (error) { result = {ok: false, errors: ['validation could not finish: ' + (error && error.message || 'unknown problem')]}; }
    return result.ok ? {status: 'ok', student, bundle} : {status: 'invalid', student, errors: result.errors};
  }
  return {
    root,
    read,
    list: () => STUDENTS.map(s => {
      const r = read(s.id);
      return {id: s.id, displayName: s.displayName, available: r.status === 'ok', capturedAt: r.status === 'ok' ? r.bundle.snapshot.capturedAt : null};
    }),
  };
}

module.exports = {STUDENTS, validateBundle, createStore};
