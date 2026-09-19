# Design update: get oriented, choose a next step

Status: Roberto requested this specification and delegated build on September 19, 2026. Authorizes the bounded first preview below, not publication or every vNext idea. Product source: the discussion of neutral storytelling, a navigable scoreboard, consistent typography and meaningful card color. **In. Out. Laugh. Feel settled.**

## Experience contract

Home is a place to get your bearings, not a collection notice. Keep relevant unfinished work discoverable without making the oldest unresolved assignment the permanent headline. Use calm factual language, a stable overview, and a clear route to details and the original source. Never infer effort, emotion or ability from status.

The intended hierarchy is overview → explanation → source/action. A student should be able to stop when they have enough information. No engagement scores, streaks, parent activity reporting or pressure to turn every square green.

## First build: typography, colored cards, calm Home

This is a working preview in the existing app, preserving current data and navigation. No new service or data capture is needed.

### Type roles

Keep the bundled Figtree and Montserrat families. Use explicit shared style tokens, not independent sizing per component. At normal text size, start with these values; scale with the existing text-size preference and verify reflow.

| Role | Family / weight | Starting size / line height | Rule |
| --- | --- | --- | --- |
| Brand | Montserrat 900 | Existing brand size | Reserve the heaviest weight for branding |
| Page heading | Montserrat 700 | 24px / 1.25 | One clear page heading |
| Section heading | Montserrat 700 | 18px / 1.35 | Consistent Home/detail/Settings rhythm |
| Assignment title | Figtree 700 | 18px / 1.4 | Strongest card text; wrap fully |
| Class label | Figtree 700 | 14px / 1.4 | Sentence case; stable position above title |
| Due date | Figtree 400 | 16px / 1.45 | Explicit “Due”; never an unexplained number |
| Status and provenance | Figtree 400, label 700 | 14px / 1.5 | Supporting hierarchy, still readable |

Use relative units in implementation. Remove competing all-caps and letter spacing in coursework metadata. Keep a consistent card order: class → title → due date → labeled recorded status. Date format: “Due Mon, Sep 21 · 3:00 PM,” with year when needed for disambiguation, snapshot timezone and no invented time/date. Null dates say “Date not captured” with the existing explanation available. List and card views use the same roles and ordering; detail pages retain a larger title. Titles and dates must not be ellipsized to fit decorative tiles.

### Card color has a job

Use a stable course color on a visible header strip/edge and a subtle card tint in light mode. Keep the main reading surface quiet. Assign color deterministically from course ID with a fixed palette, never from source text, names or assignment status; do not reshuffle on filtering or switching layouts. Collisions are acceptable because the class label remains authoritative. Tune dark/high-contrast variants; no need to preserve tint if it reduces legibility.

Separate course identity from status: use a small labeled status marker. Submitted can be green and say “Submitted in captured Canvas data”; graded retains its recorded label; excused has its own label. Unknown/on-paper/missing dates use neutral treatment and honest text. Missing may use a restrained amber marker labeled “Marked missing at capture,” not a full red card. Not-submitted does not mean not-started. Brand red remains a brand/action color, not a universal debt signal.

No total green score and no new completion inference. Keep original submission-state mapping; local checks, opened links and return navigation never change official state. Every state must be understandable without color. Meet 4.5:1 normal-text contrast and 3:1 meaningful control boundaries/focus indications; don't rely on decorative class color to convey meaning.

### Home opening and overdue work

Reuse the existing hero footprint rather than inserting another competing hero. Preserve the captured-scope banner and an absolute reference-date explanation close to the lead. Retain the existing next upcoming captured deadline selection relative to `demoNow`; call it “Next deadline in this capture.” No “today” claim based on frozen data. Do not add generated briefing prose in this slice.

Below it, separate upcoming dated attention items from earlier recorded items. Upcoming: dueAt >= demoNow, ordered by dueAt then course ID then assignment ID; up to three visible. Earlier dated attention items: dueAt < demoNow, available through a clearly labeled disclosure with count, “Earlier items to check.” Its explanatory text must say recorded status can be out of date; checking with Canvas may be the next step. This is reversible grouping, not hiding or deleting records. Show an undated-items route/count separately; unknown and on-paper status remain qualified. Existing Board “All” remains accessible and complete within captured scope.

If there is no upcoming item, say “No upcoming dated item is listed in this capture”; still show routes to earlier/undated/unknown records as applicable and the coverage limitation. Never turn empty filters, missing data or absence of upcoming work into a green all-clear. Do not strengthen existing all-clear claims or infer completion from absence of attention. Keep the existing single optional side note below practical information and retain both personality controls.

## Explorations after this first preview

These are future design candidates, not included in the build delegation: classes × days matrix; zoomable class/assignment map; pivot lenses for submission, preparation and materials; source-grounded briefing prose; preparation artifacts. A future lens must define exactly what size and color measure. Personal readiness, official submission and available materials are different states. Unknown remains visibly unknown.

A showcase carousel may later hold optional study resources; never hide essential deadlines or the only next-action button in it. No autoplay. Compare it with a static stack before committing. Do not copy financial figures or account information from the reference image into fixtures.

## Delegated implementation packet

- Delivery and integration owner: Claude. Claude may delegate bounded implementation to Replit Agent after inspecting actual current work; one writer per overlapping file. Codex owns independent review and evidence quality.
- Base/environment: fetched GitHub main `ccdfa18`; app release `5c8b6bc`. Inspect Replit HEAD, dirty files and pending checkpoints before editing. Use an isolated feature branch and an unpublished preview. Preserve original authorship and all user work.
- Allowed files: `public/saas.css`, relevant rendering/formatting/grouping in `public/index.html`, `ui.test.cjs`, and related design/status docs. Broader file changes need a concrete explanation to Codex before expanding scope. No server, authentication, snapshot schema or private record changes.
- Preserve: actual separate profiles; no passcodes; Canvas sign-in and native-action block; private drafts; source disclosures; loading/error recovery; Settings/preferences; no external AI calls or tracking.
- Definition of done: implemented preview, implementation commit/PR linked to this spec, concise screenshots using synthetic records for public review, tests and explicit limitations; Codex review before integration closure. Publication remains Roberto's decision for the reviewed result.
- Required checks: `npm run check`; focused synthetic tests for upcoming/earlier/undated/no-candidate and tie ordering, filters, profile isolation and no false completion. Browser checks at 320/390px and desktop, 100/180% text, light/dark/high contrast, long titles/dates, grayscale readability, keyboard/disclosure focus, 44px touch controls, Canvas handoff preservation. Separate automated, browser, actual-data preview and real-iPhone PASS/FAIL/NOT RUN evidence.
- Stop/escalate: competing writer, unexpected base/schema, need for new credentials/data transfers, private data in public artifact, or a new interpretation of official status. Resolve routine layout choices directly; don't ask Roberto to ferry prompts.
- Return: base/delivery/integration revisions, changed files, preview evidence, tests and open findings. A GitHub assignment means delivered, not acknowledged/running; acknowledge and record activity in PROJECT-STATE when execution actually begins.

## Supersession and private context

This specification answers the earlier packet review: reuse/replace the existing hero, not add one; reject earliest-overdue-first as the morning lead. `MORNING-BRIEFING-PACKET.md` remains historical proposed prose/selection work where it differs. This preview does not authorize that broader prose feature.

Public requirements should state observable behavior and acceptance checks. Private family discussions may motivate them, but names, diagnoses, accommodations and personal explanations must not enter public documentation or test fixtures. When attribution is useful, “Product owner request” is sufficient and truthful. This document contains only general product requirements.
