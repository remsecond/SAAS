# Hallway single coordination state

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
