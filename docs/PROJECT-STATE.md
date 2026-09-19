# Hallway single coordination state

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
