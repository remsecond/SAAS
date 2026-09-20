# Hallway single coordination state

## Current reconciliation — September 20, 2026, 11:58 Pacific / Codex

This checkpoint supersedes earlier current-state claims below. Codex owns coordination and the existing design fork; Claude remains production implementation/integration/release lead.

- **Local Canvas candidate:** c3503e7 on codex/parent-canvas-login, based on cdaedd3. No blocking review findings. Local-only verification harness and this checkpoint follow that candidate; they do not change production code.
- **GitHub:** fresh fetch still main cdaedd3; PR #11 open at c3503e7. Review and browser results posted directly on PR #11. A comment alone is not execution evidence.
- **Published:** fresh HTTP nonempty inline script matches 2025a9b after line-ending/outer-whitespace normalization; generic /login remains, parent /login/saml/11 absent. This identifies client content, not server/deployment SHA. Both live snapshot objects deep-equal approved local copies, 25/33 assignments; capturedAt remains September 19 UTC (September 18 Pacific). No refresh.
- **Claude coordination:** directly messaged existing Canvas login review updates task through signed-in browser. Observed acknowledgement and commands: Claude said it would integrate, verify real data, and stop at publication gate. Browser transport then closed twice. Later activity, Replit revision, integration completion and preview result are UNVERIFIED. No assertion of continued background execution.
- **Canvas PASS / Windows local c3503e7:** npm run check 59/59. Independent browser reviewer: 240 actual-data screen checks (all 58 assignments, 320/390px, 100/180% text, Settings, original URLs, parent route, touch target, overflow, focus); synthetic repeat 72 checks. Parent clicks intercepted locally; no external authentication. Reproduce with test-support/canvas-handoff-browser-check.cjs and external Playwright; optional private directory argument never copied/logged.
- **Design delivered locally:** codex/feed-sandbox 023a6f2 in hallway-feed-sandbox/experiments/feed/index.html. Prior dirty work preserved. Simple List / Boom Card List / Heatmap Card share records, filters, details and now all instruction/study/Canvas actions. Saved-note synchronization, return focus, narrow-dialog wrapping and Show matching assignments completed. Local commit only, not pushed/published. README and reproducible experiment harness updated.
- **Design PASS / Windows local 023a6f2:** 320/390/430px × normal/larger text × both actual profiles × all three presentations. Save → journal → reopen, profile isolation, shared filters/order, checklist retention, source status unchanged, focus, no horizontal overflow. Material/original URLs checked. Private screenshot reviewed. Notes reset on reload, explicitly disclosed. Private captures/screenshots remain outside Git.
- **NOT RUN:** real parent authentication (reported account/SAML errors unresolved), real iPhone Safari/Home Screen, post-release acceptance. Correct route is not proof of authentication.
- **Precise blocker / next action:** reconnect browser extension to inspect Claude's prepared result and finish coordination directly; request sent to Roberto. Claude has imposed a final specific-change publish gate, so obtain its completed preview/evidence before requesting that approval. No publication performed. Experimental design has no publication authorization.

Coordination: https://github.com/remsecond/SAAS/pull/11 ; Claude task https://claude.ai/cowork/cse_01F62FhSDF9fQNcHPSDTGrJd . Codex's bounded delegates finished; no Codex background work implied after this checkpoint.

## Historical checkpoints


## RELEASED September 20, 2026, early Pacific / Claude — Discover live for both profiles

Published app code = `2025a9b` (Codex's `800f7de` from PR #10, plus Claude's ordering fix). GitHub main = `2025a9b` (fast-forward from `fbbd45c`); branch `claude/discover`. Replit main = merge `537ec3a` over its own publish/asset commits, which stay off GitHub. Previous live code: `fbbd45c`. Rollback: republish Replit's previous deployment, or check out `fbbd45c` on Replit and republish. Private bundles and snapshot path untouched.

Integration finding, fixed before release: `discover()` sorted with `byDueCourseId`, which reads a null `dueAt` as 1970 and put undated work at the top while the count line promises "dated first, then undated". New `byDueThenUndated` keeps the Board's course/assignment tiebreak; `ui.test.cjs` now asserts the order, that every captured record is reachable, and that no scores or points appear.

| Check | Result |
| --- | --- |
| `npm run check` on the integrated revision | PASS 58/58 (cloud and Replit) |
| `test-support/discover-browser-check.cjs` (synthetic, cloud Chromium) | PASS, 24 combinations |
| `test-support/board-browser-check.cjs` (synthetic, cloud Chromium) | PASS, 54 combinations |
| Actual-data Replit dev preview, both profiles (unpublished) | PASS: 25/33 cards = captured counts, undated last (1/14), class filter counts, shared detail + back to Discover with focus restored, Canvas sign-in link, 100/180% text x 3 looks at 390 px, no overflow, no nav button under 44 px |
| LIVE `2025a9b`, both profiles, 390 and 320 px | PASS: same checks live, plus Board List/Week/Map counts and calm Home unchanged; `/api/students` and both snapshot hashes byte-identical to before the publish |
| Real iPhone Safari / Home Screen | NOT RUN (Roberto) |
| Independent review of `2025a9b` | NOT RUN. Claude reviewed `800f7de` as integrator; that is not an independent review |

Published on Roberto's instruction for this change, at the existing URL. No second demo URL, no server, capture or official-action change.

## September 20 / real-coursework Discover candidate — Codex

Roberto explicitly requested moving from sandbox to actual coursework so the boys can try the existing shared URL. Codex owns this bounded candidate on codex/real-discover from main fbbd45c; Claude remains release operator/integration lead. Added Discover using existing validated bundle and shared assignment detail; preserved Home/Board/Courses/Settings. No server, private capture, or official-action changes. Sandbox PR #9 stays separate.

PASS: 57 regressions/source/security checks; existing Board Chromium 54 combinations; Discover synthetic and private saved captures each 24 combinations (both profiles, 320/390px, 100/180% text, three themes), counts/filter/shared detail/return focus/profile reset. Private captures validated locally, remain frozen September 18 Pacific (25/33 assignments). No private records emitted or committed. Real-iPhone and post-deployment checks NOT RUN.

Publication is requested for this outcome, but not performed: Replit browser bridge returned Transport closed and no Replit API tool is available. Concrete operator handoff: docs/DISCOVER-RELEASE.md. GitHub delivery is not Claude acknowledgement. Do not tell students this candidate is live until deployment verified.


## Current checkpoint: RELEASED September 19, 2026, evening Pacific / Claude

This block is the current state; everything below it is history.

**Released on Roberto's explicit "Publish today" (this session), for this change only.** Published app code = `4fc1e7b` (Design vNext `81dbfba` + `2a18c2c`, Codex's Board views `4fc1e7b`, spec `faedbb7`). GitHub main = `4fc1e7b` (fast-forward from `ccdfa18`; all original commits and authorship preserved), so PRs #2, #4 and #5 are contained in main. Replit adds its usual empty "Published your App" commit on its own main afterward. Previous live code: `5c8b6bc`. Rollback: republish Replit's previous deployment, or reset Replit to `ccdfa18` (code-identical to `5c8b6bc`) and republish. Data configuration unchanged (same private bundles).

| Check | Result |
| --- | --- |
| `npm run check` on the integrated revision | PASS 56/56 (Replit and cloud) |
| `test-support/board-browser-check.cjs` (synthetic, cloud Chromium) | PASS, 54 combinations + interactions |
| Actual-data Replit dev preview, both profiles (unpublished) | PASS: isolation, List/Map counts, Week per-day counts (reference/next/previous week), undated route, day to List, Map detail and back, Canvas links, 320 px x 100/180% x 3 looks with no overflow and no button under 44 px |
| LIVE `4fc1e7b`, both profiles, 320 and 390 px | PASS: served page = `4fc1e7b` `public/index.html` except Replit's injected widget tag; widget still blocked by CSP; `/api/students` byte-identical to before the publish (captures unchanged); 54 Board combinations per profile per width with counts matching and no overflow; Map detail and back; Canvas sign-in + open links; Settings; calm Home hero, "After that", "Earlier items to check"; no page errors |
| Real iPhone Safari / Home Screen | NOT RUN (Roberto) |
| Independent review of `81dbfba`/`2a18c2c` (Codex) and of `4fc1e7b` (non-Codex) | NOT RUN. Claude read the #5 diff as integrator; that is not an independent review. Released on Roberto's go with this gap known |

**Open, with owners**
1. Codex: review the released Design vNext commits; answer the two questions on PR #4 (course color slot by position among the capture's course IDs; hero not repeated in "After that"). Fixes go on a new branch.
2. Roberto: real-iPhone check of Home, Board (List/Week/Map) and the Canvas sign-in.
3. Data re-capture before the boys rely on it: Claude coordinates; needs Roberto at a signed-in Canvas tab.
4. Pre-existing: bottom-nav labels break mid-word at 180% text on 390 px.

No standing publication approval.

## Board views contribution — September 19, 2026 / Codex

The design session reported a read-only GitHub integration (403 creating refs) and no runtime. Codex completed the bounded code contribution in `codex/board-views`, based on Claude's `claude/design-vnext-preview` at `2a18c2c`. Claude remains integration, Replit-preview and release lead. Coordination is posted on issue #3. No credential changes, real-data capture, integration to main or publication performed.

Scope: Board List / Week / equal-size Map; school-timezone calendar using the snapshot reference clock; week navigation and explicit undated/earlier/outside-week routes; shared filters and labeled day selections; preserve existing Home and native Canvas actions. The current bundle has no verified points. See [BOARD-VIEWS.md](BOARD-VIEWS.md).

Evidence on this contribution, Windows/local, synthetic records only:
- PASS: `npm run check`, 56/56 (53 base plus 3 focused Board regressions).
- PASS: headless Chrome via Playwright, 54 combinations (320/390/1280px × 100/180% text × light/dark/high-contrast × List/Week/Map): no page horizontal overflow, checked card text not clipped, visible buttons at least 44px (1px measurement tolerance). Interaction checks cover map-detail/back focus, native Canvas link presence, keyboard week navigation and undated/range reset. This is not a complete accessibility certification.
- PASS: independent read-only delegate reviewed the actual diff; no actionable correctness findings. Delegate did not run tests/browser; those checks were performed separately by Codex.
- NOT RUN: real iPhone, actual-data Board preview, Replit runtime and integrated revision. Existing published app is unaffected.

Reproducible browser harness: `test-support/board-browser-check.cjs`; provide external Playwright through HALLWAY_PLAYWRIGHT_PATH and Chrome executable through HALLWAY_CHROME_PATH when defaults do not apply. No new production dependency. Harness creates clearly synthetic bundles in an OS temp directory and binds the existing server to loopback only. Public evidence must remain synthetic.

Next: Claude reviews the draft PR against `claude/design-vnext-preview`, reconciles any newer commits, runs combined checks and supplies the unpublished Replit preview. No other session is claimed to be running after this handoff. Publication requires Roberto's instruction for the reviewed result.

Earlier checkpoint below remains history where it differs from this contribution.

## Design preview build — September 19, 2026 (evening Pacific) / Claude, implementation-integration-release lead

**Acknowledged and executing.** Assignment acknowledged on issue #3. Execution began after checking Replit: `main` at `ccdfa18`, no uncommitted files, same as GitHub main. The agent panel still shows the old "Publish Hallway at a stable HTTPS address" task and audit text, as recorded below; I did not act on either. Replit Agent is not writing any file in this slice. Claude is the only writer.

**Branch.** `claude/design-vnext-preview`, based on `codex/design-vnext` (`faedbb7`, spec) on top of `ccdfa18`. Changed files: `public/index.html`, `public/saas.css`, `ui.test.cjs`, this file. Everything else is unchanged: server, authentication, snapshot schema, bundles, private data, Canvas sign-in and handoff code, personality.

**What changed**
- Type roles are shared tokens (`--t-page`, `--t-section`, `--t-title`, `--t-class`, `--t-due`, `--t-status`), set in em so the Text size setting scales them. Headings use Montserrat 700; only the brand uses 900. Assignment titles use Figtree 700. Coursework metadata is no longer all caps.
- One card structure everywhere (Home rows, Board tiles, Board list): class → title → "Due Mon, Sep 21 · 3:00 PM" → labeled recorded status. The year appears only when it differs from the capture year. A missing date reads "Date not captured"; the detail page keeps the explanation.
- Course color is a fixed 10-color palette. A course's slot is its position among the capture's course IDs (numeric order), so up to ten classes never share a color; names, status, filters and layout never affect it. (A pure hash put 9 real classes into 5 colors, so this refines "from course ID"; flagged for Codex review.) It shows as a top strip on tiles and a left edge on rows, courses and the detail header, with a subtle tint in light mode only. Dark and high-contrast modes use a lighter edge and no tint.
- Status is a small marker plus a sentence-case label: "Submitted in captured Canvas data" (green), "Graded" (green), "Excused", "Marked missing at capture" (amber), "Not submitted in Canvas", "In class / on paper" and "Status not captured" (neutral). The submission-state mapping, attention rule and `done` rule are unchanged.
- Home reuses the hero, now labeled "Next deadline in this capture", with the absolute reference time next to it. "After that" shows up to three upcoming attention items, ordered by due date, then course ID, then assignment ID; hero items are not repeated. After that comes an "Earlier items to check (N)" disclosure, most recent first, which says recorded status can be out of date. Then the undated count, "See all unfinished work", the side note, and the rest of Home unchanged. With nothing upcoming, the hero says "No upcoming dated item is listed in this capture" and shows the coverage limitation; the earlier and undated routes still show. The all-clear logic is unchanged.

**Evidence**

| Check | Result |
| --- | --- |
| `npm run check` | PASS, 53/53 in the cloud workspace and in the Replit shell (48 existing, 3 updated for new wording, 5 new: grouping and tie order, no-upcoming, course-color stability and distinctness, status labels and card order, year display) |
| Browser, Chromium: 320/390/1280 px × 100/180% text × light/dark/high contrast (18 combinations, synthetic data, local server) | PASS 76/76: no horizontal scroll, titles and dates never clipped, card text contrast ≥ 4.5:1, Home controls ≥ 44 px, visible keyboard focus on the disclosure, Enter opens and closes it, detail keeps "Sign in to Canvas" and "Open this assignment in Canvas" |
| Grayscale screenshot | Every state is readable from its text label |
| Unpublished preview on Replit with actual data (dev URL, not the published app) | PASS at 390 px (first profile: light, dark and high contrast at 100%; second profile: light at 100% and 180%): each profile sees only its own coursework; 9/9 classes get distinct colors; no horizontal scroll; no clipped titles or dates; Home controls ≥ 44 px. Home shows the hero, then 3 upcoming items, then "Earlier items to check" (9 for one profile, 4 for the other) and the undated count. Only facts are recorded here; no screenshots of real coursework leave Replit |
| Real iPhone | NOT RUN (Roberto's device) |

**Known limitation, not changed here.** At 180% text on a 390 px screen, the bottom navigation labels break mid-word ("Course s"). This happened before this change.

**Replit afterwards.** After the preview, Replit's workspace went back to `main`, so the published app and the workspace match again. To see the preview again: `git checkout claude/design-vnext-preview`, then run the app. Do not Republish from that branch without Roberto's go.

**Next.** Implementation PR → Codex review. Publication is Roberto's decision after that review.


## Design-preview delegation — September 19, 2026 / Codex

Latest explicit request from Roberto: write the design update and delegate the build. [DESIGN-VNEXT.md](DESIGN-VNEXT.md) defines the authorized first preview: consistent type hierarchy, stable course color with separate status labels, and calm Home grouping. Claude is delivery/integration/release owner; Codex owns spec and independent review. Broader heat-map/carousel/AI ideas remain exploratory. No publication authorized.

Base fetched: origin/main `ccdfa18`; app release remains `5c8b6bc`. Documentation prepared in isolated branch `codex/design-vnext`; no app files changed here. The complete build packet is delivered through GitHub with this spec. Claude acknowledgement/execution is not yet confirmed; no direct Claude-session wakeup bridge is available. Next: Claude acknowledges, checks current Replit state and builds the unpublished preview, then Codex reviews it. No routine prompt relay requested from Roberto.

Earlier briefing questions resolved by this spec: reuse the hero footprint; never default the lead to oldest overdue work. The broad prose briefing remains unstarted. Existing independent Canvas-change review and real-iPhone acceptance remain open, not claimed completed by this documentation checkpoint. Earlier checkpoint blocks below are history where they conflict with this authorized preview scope.

## Current checkpoint: September 19, 2026 (afternoon Pacific) / Claude, implementation-integration-release lead

This block is the current state. Codex's checkpoint below is preserved as written and is now history where this block differs. Nothing here authorizes implementation or publication. No agent is running after this commit; no scheduled task exists.

**Roles (Roberto, explicit, Sept 19):** Roberto: product acceptance and publication authority; involved only for authentication or a necessary product/publication decision. Codex: strategic orchestration, independent review, evidence quality. Claude: implementation, integration, release. Coordination runs through GitHub. One execution owner per workstream.

**Revisions, each with its evidence**

| Place | Revision | Evidence |
| --- | --- | --- |
| GitHub main | this commit, on top of `f06773a` (merge of PR #1) on top of `8464476` | Pushed from Replit's Git pane; verified through the GitHub API after the push |
| Original Canvas sign-in commit | `5c8b6bc`, original SHA and parent `061f279` preserved | VERIFIED on GitHub main. Not recreated, not cherry-picked |
| Replit main before this integration | `8464476` = `5c8b6bc` + Replit's empty "Published your App" marker; clean, no stash, no untracked files | VERIFIED in the Replit shell |
| Published app code | `5c8b6bc` | VERIFIED: live client contains the sign-in helper; Claude's live checks below. The publish marker `8464476` records the deploy; it changes no file |
| Capture metadata (separate from code) | Max `2026-09-19T03:30:21.534Z`, Adrian `2026-09-19T02:44:32.969Z` | VERIFIED: live `/api/students` and harness deep-compare. Frozen Friday-evening captures. Signing in to Canvas does not refresh them |

**How GitHub alignment was recovered.** The Replit shell's saved GitHub credential expired overnight (`git push` refused: invalid username or token; retried twice, same result). Replit's Git pane holds a separate, still-valid GitHub connection. Its Push sent the existing commits unchanged. No credential was typed by anyone and Roberto did not need to act. Future pushes from Replit should use the Git pane until the shell credential is renewed. Correction accepted from Codex: pushing the original objects from another authorized place preserves history; only rebuilding or cherry-picking creates a different commit. Claude's earlier note that any other pusher would "split the history" was too broad.

**Replit's agent panel.** It still shows an old audit ("fictional fixtures", "server ignores HALLWAY_SNAPSHOTS_JSON") and an "Active task: Publish Hallway at a stable HTTPS address". That text predates the takeover. Current files contradict it: `fixtures.cjs` does not exist, the server reads validated per-student bundles, and the live site serves both real captures. The panel was not acted on, applied or dismissed. The publishing pane can show a stale "Promote" spinner after a finished publish; the live site is the evidence, not the spinner.

**Evidence for `5c8b6bc`**

| Check | Result | By / where |
| --- | --- | --- |
| App tests | PASS 48/48 | Claude, Replit and cloud workspace |
| All 58 assignment pages: "Sign in to Canvas" then "Open this assignment in Canvas", same Canvas origin, 44 px, no overflow, 320 and 390 px | PASS on LIVE | Claude, emulated iPhone in cloud Chromium |
| Harness (contract + live HTTP deep-compare), 129-page walk, Settings 66/66 | PASS on LIVE | Claude |
| Sign-in labels and helper present in live client; no qualifying link yields no button | VERIFIED by source inspection | Codex (independent) |
| School `/login` exists and redirects | VERIFIED (redirect observed from a signed-in desktop tab, credentials omitted) | Claude |
| Original commit diff reviewed by Codex | NOT RUN: commit is now on GitHub for that review | next: Codex |
| Real iPhone: Safari sign-in, Home Screen mode, whether they share a Canvas session | NOT RUN: human acceptance | Roberto; short test in the closing note of this session |
| Cause of Roberto's phone error | REPORTED, not proven: consistent with the phone's browser not being signed in to Canvas; all outbound links are plain canonical addresses (checked). Resolution on the actual device is unverified |

**PR #1.** Reviewed against recovered code and merged by ordinary merge (`f06773a`); Codex's four commits are intact. D15 note reconciled in `docs/DECISIONS.md`. D16 (orchestration) and D17 (companion shell, native authority) accepted as recorded; D15 is an instance of D17. Review questions on the briefing packet were posted on the PR, not settled here.

**Morning briefing.** Stays a scoped proposal: `docs/MORNING-BRIEFING-PACKET.md`. Claude's scope review is on PR #1. Not authorized, not started, no branch exists for it.

**Open, with owners**
1. Real-iPhone Safari/Home Screen sign-in check: Roberto.
2. Independent review of `5c8b6bc`: Codex.
3. Answers to the two packet questions on PR #1, then Roberto's go/no-go on building it: Codex, then Roberto.
4. Data refresh before the students rely on it: Claude coordinates; needs Roberto at a signed-in Canvas tab. Not scheduled.
5. Replit shell GitHub credential: expired; harmless while the Git pane works. Renew only if it becomes a blocker.

No standing publication approval. Delivery of this state through GitHub is not proof that any other agent has read it.

---

Checkpoint: September 19, 2026 / Codex. This is the coordination entry point; it does not authorize implementation or publication.

## Owners and activity

Roberto explicitly assigned Codex cross-team orchestration, strategic review, bounded delegation and evidence quality. Claude remains implementation/integration/release lead. Roberto retains product acceptance and publication authority. This supersedes older passive-review-only wording without creating a second implementation lead.

Current outcome: state reconciliation and the smallest useful morning-briefing packet. [Packet](MORNING-BRIEFING-PACKET.md) is ready for scope review. No app changes, refresh, schedule or deployment started. A read-only independent code reviewer completed its bounded investigation; no implementation activity is confirmed. Nothing is implied to run after this response.

Delivery: `codex/morning-brief-packet`, one documentation PR to main including the pending kickoff/direction at `71224c5`. GitHub delivery is not acknowledgement by Claude. No supported direct Claude-session bridge is exposed. Claude’s next action is to review the complete GitHub packet, confirm scope and record any authorized implementation here. Roberto need not ferry routine micro-prompts.

## Reconciled evidence

### Later checkpoint: Canvas sign-in release reported and live client confirmed

This update supersedes the earlier live-client match below. Roberto supplied Claude's detailed status note: Claude reports Canvas sign-in code `5c8b6bc` deployed on the same URL, present in Replit main and backed up in Claude's workspace, but not pushed because Replit's GitHub credential expired. Fresh fetch still shows GitHub main `061f279`; `5c8b6bc` is not an available object locally. No exact commit/server attribution or ancestry verification is possible from the live HTML alone.

Verified here via live HTTP/client inspection: client differs from main; contains “Sign in to Canvas” and “Open this assignment in Canvas”; old “Open original assignment” label absent. The helper derives an origin from an assignment-linked source URL and appends `/login`; no qualifying link yields no sign-in button. This is source inspection, not browser rendering, successful authentication or independent validation of the school login endpoint.

Reported by Claude, not rerun here: 48/48 app tests; 58 assignment pages at 320/390 px; harness, page walk and Settings 66/66. Real iPhone Safari/Home Screen authentication and session sharing remain NOT RUN. Signing into Canvas enables native access; it does not refresh Hallway's frozen captures. The supplied note attributes the phone error to absent sign-in; actual-device resolution remains unverified.

Next action: Roberto reconnects GitHub in Replit through its normal authentication UI; Claude then inspects refs and pushes the original commit, confirms remote alignment and provides its exact diff for Codex review. Replit credentials are not needed in chat. There is no demonstrated direct Claude-session bridge here, and no recovery task is running. Reconnection does not authorize another publish.

History correction: a different authorized pusher does not inherently duplicate commits. Transferring and pushing the original Git objects with preserved parents/SHA can preserve history; rebuilding/cherry-picking the change can create a different commit. No alternate transfer is attempted here. If ordinary reconnection remains blocked, inspect the reported original-commit backup before proposing recovery; never recreate from live HTML.

Decision collision reconciled: reserve D15 for Claude's original Canvas sign-in decision, pending recovery of `5c8b6bc`; renumber our unmerged orchestration and shell decisions to D16/D17. Claude's older role wording and older `5d6934b` current-release line in the supplied note are superseded by the explicit orchestration assignment and its newer release block. Preserve the note as attributed historical evidence, not instructions overriding Roberto's current request.

PR integration dependency: recover/fetch `5c8b6bc` before merging the documentation PR, then reconcile its decision/state edits with this checkpoint. Do not overwrite the deployment record or treat the earlier morning-packet base as current app code.

### Earlier checkpoint, before the new supplied release note

| Check | Result / environment |
| --- | --- |
| Local and GitHub | PASS: fetched origin; SAAS main and origin/main both `061f279`, clean. Original hallway-orchestrator clean at `71224c5`, still unmerged. New isolated documentation worktree starts at `71224c5`. |
| Operating model | PASS: `77d6c0a` and D10–D14 are already integrated. |
| App code | PASS: tracked public/server/bundle/personality paths unchanged between `5d6934b` and `061f279`. |
| Live client | PASS: root HTTP 200; inline script matches local `061f279` after CRLF normalization. This does not establish deployed server revision or browser correctness. |
| Capture metadata | PASS: live `/api/students` reports both available; Max `2026-09-19T03:30:21.534Z`, Adrian `2026-09-19T02:44:32.969Z`, Friday evening Pacific. No later capture advertised. Full bundle/hash validation and current Canvas read NOT RUN here. |
| GitHub coordination | Open-PR search returned none before this packet. No confirmed active implementation task. |
| Replit | Current checkout/checkpoints NOT RUN; Claude must inspect before integration. Choose merge strategy from actual ancestry, not an unconditional old command. |
| App QA | Historical 47/47 at `5d6934b`: reported by Claude and previously rerun by Codex. Not rerun for this documentation change. Browser/real-phone checks NOT RUN here. |

Historical capture totals, not refreshed: Max 9 courses / 25 assignments / 34 resources; Adrian 9 / 33 / 37. Private captures remain outside public Git. Real iPhone/Home Screen acceptance and fresh Canvas reads remain unverified here. Claude-project `claude/hallway-release-status.md` is unavailable in this checkout.

## Implications and next actions

New explicit product decision: D17 records Hallway as a potential primary companion shell with permitted read-only analysis/preparation and native-service authority for official actions. The morning-briefing packet now carries that boundary. Roberto reports lost iPhone access while PC access remains; the affected access path and cause are not established. The supplied screenshot demonstrates an original-assignment handoff, not an iPhone diagnosis. No access fix is claimed or running. Claude's scope review should preserve this boundary in any proposed implementation.

Home already shows next captured deadline and three attention items. Builder supplies no task-specific nextAction; drafts/checklists/follow-up state reset on reload. Unknown/on-paper states require care in prose. The packet proposes one specific navigation action, not an inferred homework plan.

Keep manual captures until sanctioned durable access is demonstrated. Prior notes report a transfer control requiring Roberto’s participation; it has not been retested or lifted here. Telemetry-first historical prompts are superseded by the newer priority guide; no usage logging starts.

Older RELEASE/TEST_READINESS/HANDOFF sections contain superseded switcher, icon, publication and personality-branch statements. D10–D14 and this checkpoint establish current state; those sections remain historical evidence, not instructions to rebuild or publish.

No standing publication approval. Next owner: Claude for scope/integration review; Codex for independent review of returned implementation. Limitation: shared GitHub delivery is supported; Claude acknowledgement/wakeup is not confirmed.

Supporting records: [decisions](DECISIONS.md), [operating model](OPERATING-MODEL.md), [direction](PRODUCT-DIRECTION-BEST-OF-BOTH.md), [kickoff](CODEX-ORCHESTRATOR-KICKOFF.md), [personality](../content/PERSONALITY-SPEC.md). Detailed earlier QA and consolidated report remain outside public Git alongside private evidence.

## 2026-09-20 parent Canvas handoff — reworked by Claude from Codex's PR #11

Codex prepared `codex/parent-canvas-login` (`c3503e7`) after Roberto forwarded the school's instructions for parent Canvas access. Claude integrated it with two changes, on Roberto's decision:

1. **No school identifiers in this repository.** Codex's version wrote the school's Canvas host and parent path into `public/index.html` and the tests, and relaxed `check.cjs`'s private-identifier scan to permit them. This repository is public. The scan is restored unchanged, and the parent address is now site configuration read at runtime from `HALLWAY_PARENT_LOGIN_URL` or `private-data/config.json` — both outside Git — and served to the page through `/api/students`. Nothing school-specific is committed.
2. **Students keep their own sign-in link.** Codex's version replaced the existing "Sign in to Canvas" link with a parent-only route wherever the captured host matched. The students are the users; the ordinary link stays, and the parent link is offered next to it.

The parent link appears only when the configured URL is https and its origin equals the captured Canvas origin, so a wrong or stale setting cannot send anyone to an unrelated site. Assignment deep links are unchanged. No capture, bundle, schema or official-action change.

**This is a routing correction, not an authentication fix.** The reported parent-account problems (Canvas account not found; Google `app_not_configured_for_user`) are unresolved and are not addressed by changing which page the button opens.

PASS: `npm run check` 60/60 (59 existing plus a server test covering missing, non-https, malformed, env and private-file configuration); Discover harness 24 combinations; Board harness 54 combinations. NOT RUN: real parent authentication, real iPhone.

Next: Claude records the integration and deployment revisions here after the release. Publication of this specific change was authorized by Roberto in the Cowork session on 2026-09-20, after preview verification.
