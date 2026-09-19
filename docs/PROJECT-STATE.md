# Hallway single coordination state

This is the coordination entry point. Keep it short and current at workstream checkpoints. RELEASE.md, TEST_READINESS.md, detailed QA reports, and the decision log remain supporting evidence. This note does not start a background task or authorize publishing.

## Current checkpoint

```text
Updated at / by: 2026-09-19 (late evening Sept 18 Pacific) / Claude
Accountable lead: Claude (implementation and release), per Roberto's explicit handoff. Codex: independent reviewer and test contributor. Roberto: product owner.
Active outcome and scope: working beta in the students' hands at one stable URL. No feature work in flight.
Actual agent activity: stopped. Nothing runs between messages. No scheduled task exists.
Revisions:
  - GitHub main: this commit's parent chain = 5d6934b (published app) + 77d6c0a (Codex operating model, fast-forwarded, authorship preserved) + this state update. Documentation only after 5d6934b.
  - Published: app code 5d6934b. Evidence: Claude's live checks after publishing (below); Codex independently matched the live client script and both live bundles to 5d6934b.
  - Replit: main was 5d6934b when published; Replit adds an empty "Published your App" commit after each publish, so its main can sit one empty commit ahead of GitHub. Merge there with `git merge --no-edit`, never `--ff-only`.
  - Roberto's PC checkout: 5d6934b, clean (checked by Codex).
Completed checks (LIVE at 5d6934b unless noted): app tests 47/47 (Replit; Codex reran locally); Codex harness PASS both students, live bundles equal approved copies; 129 assignment/material pages clean at 320 px; Settings 66/66; personality 77/77; install tip 5/5 (emulated iPhone); stalled-request recovery at 12.4 s; malformed-bundle isolation (browser, synthetic copies); all-clear state (synthetic finished work only, since neither real profile is clear).
NOT RUN: real iPhone and Home Screen install; real Tab-key pass by a person; any Canvas read after the recorded captures.
Open findings and owner: none open from Codex's Sept 19 review (all three fixed in 8d09279).
Blocked on: nothing.
Next action / owner:
  1. Real-iPhone acceptance: Roberto, the boys where practical.
  2. Data refresh near use: Claude coordinates; Roberto signs in to Canvas and pastes two captures (a safety control stops Claude moving Canvas data between sites itself). Then rebuild, validate, harness with reconciled counts, smoke test, publish, verify live hashes.
  3. Post-beta backlog is in the Claude project status note; nothing there is a blocker.
Publication authorization or hold: no standing approval. Each publish so far followed an explicit instruction from Roberto for that change. The data refresh publish needs his go at the time.
Personality off switch: HALLWAY_PERSONALITY=off in Replit Secrets, then republish; or "enabled": false in content/personality.json.
Links: RELEASE.md, HANDOFF.md, TEST_READINESS.md, content/PERSONALITY-SPEC.md, docs/DECISIONS.md. Detailed QA evidence and the consolidated release report live outside the public repo (Claude project "SAAS Hallway" and Roberto's PC), because they sit beside private capture records.
```

History of this note: adopted from Codex's branch `codex/project-operating-model` (77d6c0a), which recorded the state at adoption. Correction carried from the consolidated report: Replit's feedback widget was blocked at first publish, allowed for two revisions (536e17f, bd1af36), then blocked again from 5fcedd3 on; it is "blocked in the current release", not "blocked since the first publish".

## State format for subsequent checkpoints

```text
Updated at / by:
Accountable lead:
Active outcome and scope:
Actual agent activity (running / ready for review / blocked / stopped):
Local / GitHub / Replit / published revisions, each with evidence:
Completed checks (environment and result):
Open findings and owner:
Blocked on (precise dependency):
Next action / owner:
Publication authorization or hold:
Links to current artifacts and decisions:
```
