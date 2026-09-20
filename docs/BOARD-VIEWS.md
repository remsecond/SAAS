# Board views implementation packet

Base: `claude/design-vnext-preview` at `2a18c2c`. Continues issue #3 and the latest Board Views sandbox direction. Codex contributes bounded implementation and verification because the design session reported read-only GitHub and no runtime; Claude retains integration, Replit preview and release ownership. No publish is authorized.

## Scope

Keep Home / Board / Courses / Settings. On Board replace the layout toggle with List / Week / Map. Preserve the existing coursework filter and status semantics and the typography/course-color changes in the base. Home's existing layout control is independent.

- List remains the complete readable representation of the selected scope.
- Week uses the snapshot timezone and reference clock, includes all seven days, supports previous/next week and opens the matching day in List. Explicit routes account for undated and dated work outside the displayed week. Missing data never becomes an all-clear.
- Map groups equal-size assignment cards by course. Area does not claim points, workload, grade impact or importance. The current data contract has no verified points. Preserve text status labels and course identity.
- Class/status/range filters apply consistently; any selected-day or other subset is visible and removable. Range/reset/Home/profile changes clear stale day state. Detail return preserves Board view, filters, focus and scroll through the existing navigation machinery.

No capture/schema/server change, external service, new official action, tracking, grade calculation or publication. No synthetic fallback in the product. Synthetic data is used only by test tools.

## Verification and handoff

Run the existing check suite plus focused synthetic regressions covering timezone midnight/DST, filter counts, view changes, dates outside the visible grid, unknown dates, day/range reset, detail return, profile isolation and unchanged official status. Browser-check all three Board views at 320/390/desktop widths, 100/180% text and supported themes. Record browser evidence separately from VM behavior tests and real-data/Replit/iPhone checks.

Deliver a draft PR targeting `claude/design-vnext-preview`, with exact revision and evidence. Claude reviews the combined result, checks Replit's current state before integrating, and provides the real-data unpublished preview. Codex cannot describe its own integration review as independent; an independent reviewer receives the actual diff separately. This packet does not imply another session has acknowledged or is running.

## Same-day release sequence for Claude

Roberto requested a complete package today that enables Claude to ship. Codex owns this bounded Board contribution; Claude owns the combined release. This request establishes urgency and the handoff outcome, not proof that preview, integration or publication has occurred.

1. **Accept and reconcile.** Acknowledge on issue #3. Fetch GitHub, inspect Replit branch/HEAD and dirty files, and compare this PR with PR #2. Preserve newer work and original commits. Do not run a competing Board implementation or apply stale Replit Agent changes.
2. **Integrate for preview.** Review this draft PR into `claude/design-vnext-preview`; resolve conflicts normally. Record the exact combined commit. Run `npm run check` on it. Run `test-support/board-browser-check.cjs` with available Playwright/Chrome, or record an equivalent browser check and its limits. Stop for real failures; do not waive them because the contribution passed locally.
3. **Verify actual data privately.** Confirm each profile's verified bundle and student/course ownership, capture/reference dates, coverage and counts. Exercise List, Week and Map for each profile, filters, undated/earlier work, detail/back and Canvas links. Verify profile isolation. Do not publish bundles, screenshots of coursework, identifiers or private hashes into GitHub. Record sanitized PASS/FAIL evidence and exact preview revision.
4. **Review the unpublished preview.** Give Roberto one preview URL and a short change summary. Check narrow phone layout and large text, then real iPhone Safari/Home Screen and Canvas account sign-in if available. Report real-device checks NOT RUN when unavailable; do not substitute desktop emulation for them. Ask only for the concrete release decision or genuinely unavailable device/authentication action.
5. **Prepare recovery, then release within current authorization.** Identify the last working deployment, its code revision and private data configuration. Confirm a usable restore path for code and data; a Git branch alone is not tested rollback. Preserve pending edits. After approval for the reviewed result, integrate the intended branch to main using normal history, align Replit to the exact release commit, rerun checks if the combined code changed, and publish through the existing release workflow.
6. **Verify production and close.** At the existing production URL verify both profile views, metadata, Board modes, Settings and Canvas handoffs. Record release commit, deployment identifier/time, check results and any outstanding real-device limitation in PROJECT-STATE.md and issue #3. If release verification fails, restore the confirmed prior code/data state and report what happened.

No release claim is valid until step 6. A comment delivered on GitHub is a handoff, not evidence Claude has acknowledged it. Keep the scope to this Board slice and the already prepared design base; learning tools, telemetry, points models and external AI transfer are later work.
