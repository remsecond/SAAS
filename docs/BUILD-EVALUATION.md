# Build scorecard and sprint baseline

Run `node tools/evaluate-build.cjs --repo <clean-checkout> --expect-revision <commit> --out <new-external-directory>` from the evaluator checkout. The target must already be checked out at the requested commit; the script never changes branches, pulls, publishes or accesses private bundles. Use `git worktree add --detach <new-path> <commit>` to preserve current work. Only evaluate trusted repository code: test scripts execute locally.

Provide Playwright with HALLWAY_PLAYWRIGHT_PATH and Chrome with HALLWAY_CHROME_PATH if required. The existing browser harness defaults to Windows Chrome. Output: scorecard.md, scorecard.json, separate logs and synthetic browser screenshots. Share sanitized evidence only. Exit 1 means automated failure; exit 0 means no automated failure, NOT release approval. Read overall: missing evidence produces INCOMPLETE. A missing runtime is NOT RUN; an attempted failing browser check is FAIL.

## What exists today

- check.cjs: source/privacy/runtime-fixture checks and bundle-builder validation.
- security.test.cjs, ui.test.cjs, capture.test.cjs: server, profile isolation, capture pagination, status, navigation, calendar and other regressions.
- test-support/board-browser-check.cjs: 54 synthetic width/text/theme/view combinations plus selected interaction checks. It checks overflow, some text clipping and button dimensions, not whether controls and results form a usable comparison experience.
- Demo runner/storyboard: a separate local recording artifact; useful smoke walkthrough with Board viewport checks, not a substitute for the suite. Real-coursework recordings remain private. It is not required by this evaluator and does not run automatically.

## Current product baseline

At c8a7e40, Roberto's supplied real-phone screenshots and the inspected demo establish a phone usability failure: controls and results are separated by excessive scrolling. This is reported acceptance evidence, not a new automated result. Treat it as an open sprint requirement even if all automated checks pass. Do not mark NOT RUN as PASS or erase this known failure because the evaluator cannot reproduce human acceptance by itself.

## Sprint workflow

1. Pin the starting commit and run the scorecard. Attach sanitized artifact location/results to the work issue. Record known user-observed failures separately with source and reproduction.
2. Give every punch-list item an ID, owner, expected user outcome, acceptance steps, test/evidence path and implementing PR/commit. Claude owns integration; one writer per change. Track deferred items explicitly.
3. Run against each candidate commit, using a fresh output directory. Compare check IDs/results, not a percentage. New failures block readiness; unchanged NOT RUN rows stay visible.
4. Add phone acceptance evidence: at 390x844 and 320x700, useful content appears on entry; essential controls remain reachable with results; scope/view changes and back preserve context; large text remains readable; sticky controls do not cover focus/content. Verify with screenshots and interaction, not DOM presence alone. Add meaningful automated assertions as the redesigned layout is implemented.
5. Claude verifies both real bundles privately in preview and records exact revision/environment. Distinguish capture freshness from the reference clock. Real iPhone checks require real-device evidence.
6. Review the candidate and current release authorization, then publish through the release owner. Verify deployment identity/live behavior/recovery separately. A local scorecard never proves what's deployed.

Keep PROJECT-STATE.md as the single current state note; this document defines the evaluation method. Store one result set per run, not competing current-state documents. The initial runner is intentionally a local/synthetic foundation; live checks and historical scorecard comparison are future bounded additions.
