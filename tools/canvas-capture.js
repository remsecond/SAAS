// Hallway raw Canvas capture. Run in the browser console (or an automation
// tool) on a signed-in parent/observer tab at the school's Canvas site, e.g.
// https://<school>.instructure.com/api/v1/users/self/observees
//
// It only READS, through the signed-in session: no tokens, cookies or
// passwords are touched, and nothing is sent anywhere. The result stays in
// `window.hallwayCapture` — one JSON string per student first name — for you
// to copy into private-data/raw/<student>.raw.json, then build with
//   node tools/build-bundle.cjs <student> private-data/raw/<student>.raw.json private-data/snapshots/<student>.json
//
// Scope: work due from 7 days before to 14 days after the capture, older
// unfinished work, and undated unfinished work (unless a course has more than
// 10 undated items, which are counted and disclosed instead). No grades or
// scores are captured.
//
// Known Canvas quirk: for observers, `order_by=due_at` on the assignments
// endpoint returns an empty list, so it is deliberately not used.
(async () => {
  const DAY = 86400000, capturedAt = new Date().toISOString(), now = Date.parse(capturedAt);
  const cv = async path => {
    let url = path.startsWith('http') ? path : '/api/v1' + path, out = [];
    for (let i = 0; i < 20 && url; i++) {
      const r = await fetch(url, {headers: {Accept: 'application/json'}});
      if (!r.ok) return {error: r.status, url};
      const j = await r.json();
      if (!Array.isArray(j)) return j;
      out = out.concat(j);
      const m = (r.headers.get('Link') || '').match(/<([^>]+)>;\s*rel="next"/);
      url = m ? m[1] : null;
    }
    // More pages than the cap: say so loudly. A silently shortened list would look like a clean capture.
    if (url) return {error: 'pagination_exhausted', url, got: out.length};
    return out;
  };
  const parse = html => new DOMParser().parseFromString(html || '', 'text/html');
  const absolute = u => { try { return new URL(u, location.origin).href; } catch { return null; } };
  const linksOf = html => [...parse(html).querySelectorAll('a[href], iframe[src]')].map(e => ({text: (e.textContent || e.getAttribute('title') || '').trim().slice(0, 200), url: absolute(e.getAttribute('href') || e.getAttribute('src'))})).filter(l => l.url);
  const toText = html => {
    if (!html) return null;
    const d = parse(html);
    d.querySelectorAll('script,style').forEach(e => e.remove());
    d.querySelectorAll('li').forEach(e => e.prepend('• '));
    d.querySelectorAll('br').forEach(e => e.replaceWith('\n'));
    d.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,tr,ul,ol,table').forEach(e => e.append('\n'));
    d.querySelectorAll('td,th').forEach(e => e.append(' | '));
    d.querySelectorAll('iframe').forEach(e => e.replaceWith('[embedded: ' + (e.getAttribute('title') || e.getAttribute('src') || '') + ']'));
    return d.body.textContent.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() || null;
  };

  const observees = await cv('/users/self/observees?per_page=50');
  if (!Array.isArray(observees)) throw new Error('Could not read observees; is this a signed-in observer session?');
  const result = {}, report = {};
  for (const who of observees) {
    const sid = who.id, o = {studentId: sid, studentName: who.name, capturedAt, courses: [], excluded: {}, errors: [], assignments: [], modules: {}, pages: [], files: []};
    const courses = await cv(`/users/${sid}/courses?enrollment_state=active&include[]=term&include[]=teachers&per_page=100`);
    if (!Array.isArray(courses)) { o.errors.push({what: 'courses', err: courses}); result[who.name] = JSON.stringify(o); continue; }
    o.courses = courses.map(x => ({id: x.id, name: x.name, term: x.term && x.term.name, termEnd: x.term && x.term.end_at, enr: (x.enrollments || []).map(e => e.type + ':' + e.user_id).join(','), teachers: (x.teachers || []).map(t => t.display_name).join('; ')}));
    const wantPages = new Set(), wantFiles = new Set();
    for (const c of o.courses) {
      const list = await cv(`/courses/${c.id}/assignments?include[]=submission&include[]=observed_users&include[]=all_dates&per_page=100`);
      if (!Array.isArray(list)) { o.errors.push({what: 'assignments', course: c.id, err: list}); continue; }
      const undatedCount = list.filter(a => !a.due_at).length;
      const ex = o.excluded[c.id] = {total: list.length, undatedSkipped: 0, futureBeyondWindow: 0, olderFinished: 0};
      for (const a of list) {
        const s = (Array.isArray(a.submission) ? a.submission.find(x => x.user_id === sid) : a.submission) || null;
        const done = !!s && (s.excused || (['submitted', 'graded', 'pending_review'].includes(s.workflow_state) && !s.missing));
        const due = a.due_at ? Date.parse(a.due_at) : null;
        let keep;
        if (due === null) { keep = !done && undatedCount <= 10; if (!keep) ex.undatedSkipped++; }
        else if (due > now + 14 * DAY) { keep = false; ex.futureBeyondWindow++; }
        else if (due >= now - 7 * DAY) keep = true;
        else { keep = !done; if (!keep) ex.olderFinished++; }
        if (!keep) continue;
        o.assignments.push({id: a.id, courseId: c.id, name: a.name, description: toText(a.description), links: linksOf(a.description), dueAt: a.due_at, unlockAt: a.unlock_at, lockAt: a.lock_at, lockedForUser: !!a.locked_for_user, lockExplanation: a.lock_explanation || null, htmlUrl: a.html_url, submissionTypes: a.submission_types, isQuiz: !!a.is_quiz_assignment || !!a.quiz_id, published: a.published, submission: s ? {userId: s.user_id, state: s.workflow_state, submittedAt: s.submitted_at, missing: !!s.missing, late: !!s.late, excused: !!s.excused} : null});
      }
      const mods = await cv(`/courses/${c.id}/modules?include[]=items&per_page=50`);
      if (!Array.isArray(mods)) { o.errors.push({what: 'modules', course: c.id, err: mods}); continue; }
      // Canvas may embed only some (or none) of a module's items. Fetch the full list when the count says more exist.
      for (const x of mods) if (!Array.isArray(x.items) || (x.items_count || 0) > x.items.length) {
        const items = await cv(`/courses/${c.id}/modules/${x.id}/items?per_page=100`);
        if (Array.isArray(items)) x.items = items; else o.errors.push({what: 'module_items', course: c.id, module: x.id, err: items});
      }
      o.modules[c.id] = mods.map(x => ({id: x.id, name: x.name, position: x.position, itemsCount: x.items_count, itemsIncluded: Array.isArray(x.items), items: (x.items || []).map(i => ({id: i.id, title: i.title, type: i.type, contentId: i.content_id || null, pageUrl: i.page_url || null, htmlUrl: i.html_url || null, externalUrl: i.external_url || null}))}));
    }
    await Promise.all(o.assignments.map(async a => {
      const r = await cv(`/courses/${a.courseId}/assignments/${a.id}/submissions/${sid}?include[]=submission_comments`);
      if (!r || r.error || r.user_id !== sid) { a.comments = null; return; }
      a.comments = (r.submission_comments || []).map(c => ({author: c.author_name || (c.author && c.author.display_name) || null, authorId: c.author_id, text: c.comment, at: c.created_at}));
      for (const l of a.links) {
        let m = l.url.match(/\/courses\/(\d+)\/pages\/([^?#/]+)/); if (m && Number(m[1]) === a.courseId) wantPages.add(m[1] + '|' + m[2]);
        m = l.url.match(/\/files\/(\d+)/); if (m && l.url.includes(location.host)) wantFiles.add(a.courseId + '|' + m[1]);
      }
      for (const mod of o.modules[a.courseId] || []) if (mod.items.some(i => i.type === 'Assignment' && i.contentId === a.id)) for (const i of mod.items) {
        if (i.type === 'Page' && i.pageUrl) wantPages.add(a.courseId + '|' + i.pageUrl);
        if (i.type === 'File' && i.contentId) wantFiles.add(a.courseId + '|' + i.contentId);
      }
    }));
    await Promise.all([...wantPages].map(async k => { const [cid, slug] = k.split('|'); const p = await cv(`/courses/${cid}/pages/${slug}`); o.pages.push(p && !p.error ? {courseId: Number(cid), slug, title: p.title, body: toText(p.body), links: linksOf(p.body), updatedAt: p.updated_at, htmlUrl: p.html_url, locked: !!p.locked_for_user} : {courseId: Number(cid), slug, error: (p && p.error) || 'unreadable'}); }));
    await Promise.all([...wantFiles].map(async k => { const [cid, fid] = k.split('|'); const f = await cv(`/courses/${cid}/files/${fid}`); o.files.push(f && !f.error ? {courseId: Number(cid), id: f.id, name: f.display_name, contentType: f['content-type'], size: f.size, updatedAt: f.updated_at, htmlUrl: `${location.origin}/courses/${cid}/files/${f.id}`, locked: !!f.locked_for_user} : {courseId: Number(cid), id: Number(fid), error: (f && f.error) || 'unreadable'}); }));
    const first = who.name.trim().split(/\s+/)[0].toLowerCase();
    result[first] = JSON.stringify(o);
    report[first] = {courses: o.courses.length, assignments: o.assignments.length, pages: o.pages.length, files: o.files.length, errors: o.errors.length, bytes: result[first].length};
  }
  window.hallwayCapture = result;
  console.log('Hallway capture ready', JSON.stringify(report));
  return report;
})();
