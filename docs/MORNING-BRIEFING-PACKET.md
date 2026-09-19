# Morning briefing: one useful starting point

Status: proposed experiment, ready for Claude’s scope review. Preparing this packet is authorized; implementation and publication have not started. **In. Out. Laugh. Feel settled.**

## Ownership and scope

Codex owns packet delivery, orchestration and independent review. Claude owns implementation, integration and release. Roberto owns product acceptance and publication authority.

Base: main `061f279`, with pending direction/kickoff `71224c5`. Documentation branch: `codex/morning-brief-packet`. Before implementation, Claude must fetch and inspect Replit HEAD, local changes and pending checkpoints. Current allowed actions are documentation and read-only review. Candidate implementation files after scope acceptance: `public/index.html`, relevant `public/saas.css`, `ui.test.cjs`. No server, capture schema, access or personality collection change is needed.

Outcome: a student opening Home can identify one captured item to check and open it in one tap, while understanding this is a frozen capture.

## Smallest useful experiment

Use the existing Home hero for “Start here in this capture,” followed by the existing Needs you list and optional side note. No additional priority list, modal, notification or greeting sequence.

Proposed deterministic rule: consider only captured assignments marked `missing` or `not_submitted`. Select the earliest dated item; break ties by course ID then assignment ID. If only undated candidates exist, use course ID then assignment ID and say “Date not captured.” This is a reproducible starting suggestion, not inferred importance. Unknown/on-paper items remain visible elsewhere; they are not proven unfinished work. Do not change existing Board/status logic incidentally.

Show captured title, course, absolute due date and recorded status as of capture. For missing: “Canvas marked this missing when captured; check whether you already handed it in.” For not submitted: “Canvas did not show a submission when captured.” Action: “Open captured instructions” when present, otherwise “Check assignment details,” retaining the availability explanation. Open the existing detail/source surface. No invented first exercise, extracted instructional plan or guessed original URL.

No eligible item: “No starting item selected from this capture. Check the board and Canvas for anything newer.” This is not an all-clear. Selection uses the full active-profile bundle, independent of Board filters. Do not claim unknown, on-paper or excluded undated items are complete.

## Source and freshness contract

Every version of this slice is a capture briefing, including same-day captures. Show the absolute capture date/time and “Frozen copy; changes after capture are not included.” This avoids inventing a freshness threshold or adding a wall-clock dependency. A Friday capture opened Monday remains Friday’s capture. Never say “today’s work,” “due this afternoon,” “you are caught up,” or “the rest can wait.” `demoNow` is a reference clock, not freshness evidence; personality rotation is separate.

Use only validated active-profile records and existing source links. Preserve partial-coverage disclosures. Missing instructions/date/link need distinct explanations. Missing, corrupt, wrong-profile and timed-out bundles retain the existing unavailable/retry path; no briefing is fabricated. A true current-day briefing needs a later freshness/coverage design and demonstrated permitted access.

## Acceptance checks for later implementation

1. Synthetic selection cases cover missing/not-submitted, tied dates, undated-only, completed/excused, unknown/on-paper-only and empty records. Stable result, qualified status, no invented task facts.
2. Friday capture opened Monday and differing `demoNow` retain absolute capture wording. Same-day and partial captures cannot imply current completeness. Invalid metadata follows existing bundle rejection.
3. Missing instructions/link and hostile title text preserve honest fallback, escaping and safe links. CTA opens the correct assignment and source for the active profile.
4. Late response during profile switching, reload and filter changes preserve isolation and stable selection. Existing draft/checklist isolation stays intact.
5. Keep it straightforward and Not this one remain functional. At most the existing single Home side note; useful action precedes humor. No new behavior storage or network destination.
6. Run `npm run check` on the proposed integration revision. Claude checks preview at 320/390 px, 180% text, themes, keyboard/focus and touch targets. Codex independently reviews the diff and regressions. Report synthetic, browser, real-data preview and real-phone evidence separately as PASS / FAIL / NOT RUN.
7. Return implementation PR/commit, base and integration revision, capture metadata only, evidence and limitations. Link this packet. No publication without Roberto’s authorization for the concrete change.

Learning: voluntary feedback on whether the student knew where to start and found the text useful. A second voluntary open is a hypothesis to learn about, not an event to instrument. No mandatory survey or engagement target.

## Non-goals and diagnostics

No notifications, audio/video, model calls, automatic refresh, persistence expansion, Canvas writes, message sending, passcodes, new accounts, other-student Home controls or parent reports. Preserve school-style profiles and independent preferences.

This slice adds no diagnostics. A separate reproducible operational failure may justify minimal failure categories after defining destination, access, fields and retention. Avoid student IDs, assignment paths/content and per-profile events. Clicks, sessions and stickiness analytics need reconciliation with disclosure and the no-reporting-upward promise; pseudonyms do not anonymize two known students. Historical telemetry-first prompts do not authorize this work.

## Handoff and stop conditions

Claude reviews the documentation PR, confirms or narrows scope, and records any authorized implementation in PROJECT-STATE. Stop and return to review if the actual base/schema differs, writers overlap, new permissions/data transfers are required, or wording needs unproven freshness. Do not blindly apply a pending Replit task. GitHub delivery is not Claude acknowledgement or proof that work is running.

Evidence inspected at `061f279`: `public/index.html:14–16,37,55–57,77` (clock, generic action, existing Home/status mapping, load guard); `tools/build-bundle.cjs:118–145` (no nextAction, partial coverage); `tools/canvas-capture.js:62–69` (undated exclusions); `check.cjs:17–20` and `ui.test.cjs:392–397` (frozen-clock invariants). Independent read-only delegate findings were checked against the source by Codex. No private records were shared.
