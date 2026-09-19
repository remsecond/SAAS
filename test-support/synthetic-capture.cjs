'use strict';
// Synthetic raw captures for automated tests ONLY. Obviously artificial on
// purpose ("SYNTHETIC"), never served by the app, and shaped exactly like the
// raw Canvas capture that tools/build-bundle.cjs consumes. Both students share
// assignment id 9001 so isolation bugs cannot hide behind distinct ids.
const {buildBundle} = require('../tools/build-bundle.cjs');
const CAPTURED_AT = '2026-09-19T02:35:15.414Z';
const at = days => new Date(Date.parse(CAPTURED_AT) + days * 86400000).toISOString();
function rawCapture(who) {
  const max = who === 'max', studentId = max ? 1111 : 2222, course = max ? 501 : 601, other = max ? 502 : 602, tag = max ? 'SYNTHETIC-M' : 'SYNTHETIC-A';
  const sub = (state, extra = {}) => ({userId: studentId, state, submittedAt: null, missing: false, late: false, excused: false, ...extra});
  const a = (id, courseId, name, dueAt, submission, more = {}) => ({id, courseId, name, dueAt, unlockAt: null, lockAt: null, lockedForUser: false, lockExplanation: null, htmlUrl: `https://canvas.test.example/courses/${courseId}/assignments/${id}`, submissionTypes: ['online_upload'], isQuiz: false, published: true, submission, description: `${tag} instructions for ${name}`, links: [], comments: [], ...more});
  return {
    studentId, studentName: max ? 'Max Testperson' : 'Adrian Testperson', capturedAt: CAPTURED_AT, errors: [],
    courses: [{id: course, name: `${tag} Course One`, term: 'Test Term', enr: 'student:' + studentId, teachers: 'Teacher Placeholder'}, {id: other, name: `${tag} Course Two`, term: 'Test Term', enr: 'student:' + studentId, teachers: ''}],
    excluded: {[course]: {total: 9, undatedSkipped: 1, futureBeyondWindow: 2, olderFinished: 1}, [other]: {total: 1, undatedSkipped: 0, futureBeyondWindow: 0, olderFinished: 0}},
    assignments: [
      a(9001, course, `${tag} shared-id essay`, at(2), sub('unsubmitted'), {links: [{text: `${tag} page`, url: `https://canvas.test.example/courses/${course}/pages/${tag.toLowerCase()}-guide`}, {text: `${tag} doc`, url: 'https://docs.google.com/document/d/test'}, {text: 'teacher@school.test', url: 'mailto:teacher@school.test'}, {text: 'insecure', url: 'http://insecure.test/x'}], comments: [{author: 'Teacher Placeholder', authorId: 1, text: `${tag} comment`, at: at(-1)}]}),
      a(9002, course, `${tag} overdue missing`, at(-10), sub('unsubmitted', {missing: true})),
      a(9003, course, `${tag} unit test`, at(5), sub('unsubmitted')),
      a(9004, other, `${tag} turned in`, at(-2), sub('submitted', {submittedAt: at(-3)})),
      a(9005, other, `${tag} graded old due`, at(-3), sub('graded')),
      a(9006, other, `${tag} undated`, null, sub('unsubmitted'), {description: null}),
      a(9007, course, `${tag} on paper`, at(-1), sub('unsubmitted'), {submissionTypes: ['on_paper']}),
      a(9008, course, `${tag} excused`, at(-4), sub('graded', {excused: true})),
    ],
    modules: {[course]: [{id: 1, name: `${tag} Module`, position: 1, itemsCount: 3, itemsIncluded: true, items: [{id: 1, title: 'x', type: 'Assignment', contentId: 9001}, {id: 2, title: 'f', type: 'File', contentId: 77}, {id: 3, title: 'p', type: 'Page', pageUrl: `${tag.toLowerCase()}-guide`}, {id: 4, title: 'e', type: 'Page', pageUrl: 'embed-only'}]}], [other]: []},
    pages: [{courseId: course, slug: 'embed-only', title: `${tag} slides page`, body: '[embedded: embedded content]', htmlUrl: `https://canvas.test.example/courses/${course}/pages/embed-only`, locked: false, links: [{text: 'embedded content', url: 'https://docs.google.com/presentation/d/test/embed'}]}, {courseId: course, slug: `${tag.toLowerCase()}-guide`, title: `${tag} guide page`, body: `${tag} page body text`, htmlUrl: `https://canvas.test.example/courses/${course}/pages/${tag.toLowerCase()}-guide`, locked: false, links: []}],
    files: [{courseId: course, id: 77, name: `${tag} handout.pdf`, contentType: 'application/pdf', size: 1, htmlUrl: `https://canvas.test.example/courses/${course}/files/77`, locked: false}],
  };
}
const bundleFor = who => buildBundle(who, rawCapture(who));
module.exports = {rawCapture, bundleFor, CAPTURED_AT};
