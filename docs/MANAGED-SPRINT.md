# Managed Sprint #7 delivery and verification

Canonical scope and item IDs: https://github.com/remsecond/SAAS/issues/7 . Codex owns this bounded implementation following Roberto's explicit reassignment. Claude receives integration/release handoff; no production publish is performed here.

## Run and inspect

Synthetic local preview (safe coursework fixtures, no production fallback):

    node test-support/preview.cjs --synthetic --port 4317

Private preview, only with the established saved bundle directory:

    node test-support/preview.cjs --snapshot-dir <private-directory> --port 4318

Both bind to 127.0.0.1 only. Do not expose the private listener through a public tunnel. Missing/invalid real bundles remain unavailable. Stop a preview with Ctrl+C. The production server and data configuration are unchanged.

Automated evaluation against a clean committed checkout:

    node tools/evaluate-build.cjs --expect-revision <commit> --out <new-external-directory>

Set HALLWAY_PLAYWRIGHT_PATH to an installed Playwright module and HALLWAY_CHROME_PATH if Chrome is not at the Windows default. Browser results include explicit geometry, scope interaction, filter keyboard, detail-return, undated and profile-isolation checks. A technical pass does not certify real Safari or human judgment of storytelling. Manual/live checks remain NOT RUN rather than being averaged away.

Opt-in actual-data checks, with no coursework output or screenshots:

    node test-support/private-browser-check.cjs --snapshot-dir <private-directory> --raw-dir <private-raw-directory>

Checks bundle validity, exact rebuild from saved raw (if supplied), both profiles, 36 current-fixture scope checks, class drilldown completeness, native link origins and detail/back. Does not authenticate to Canvas, establish current enrollment independently of the saved source, refresh captures or prove live deployment. Treat partial frozen data as partial frozen data.

Synthetic demo after starting port4317:

    node tools/demo-runner.cjs test-support/managed-sprint.storyboard.json --frames-only --out <external-path>/managed-sprint.mp4

The supplied complete clip is a 39.6-second storyboard assembled from actual browser frames, not continuous motion. All 15 interactions passed. Continuous recording finalized incompletely in this environment; --frames-only avoids that recorder and renders a 720p/5fps static-state walkthrough. Omit the flag to attempt continuous recording. Results distinguish step failures from video finalization.

Set NODE_PATH to an installed Playwright parent module directory, HALLWAY_CHROME_PATH to Chrome, and have ffmpeg on PATH. Install Playwright's recording dependency with its supported `playwright install ffmpeg` command when needed. --headed is a visible rehearsal, not automatic recording. The runner stores an MP4 and adjacent results JSON with checkout revision; its simulated phone is Chromium, not real iPhone Safari. Run from a clean candidate, retain original source attribution in Git history, and keep real-coursework videos private. The storyboard deliberately demonstrates actual Map/Week/List content, scope comparison, drilldown and undated access.

## Review notes

The Map is a class-group overview, not a weighted heat map. All-class view previews up to three dated items per class with a labeled Explore class route; class scope shows all dated items. Undated records stay in a counted expandable group. Course tints indicate class; status text/markers retain source meaning. No grade, workload or urgency inference is added.

Source review of prior Design vNext found hero exclusion from After that consistent with intended nonduplication. Course palette slots remain stable within a capture through filtering/renaming/layout; changing the set of course IDs at a future refresh can change slots. Do not claim cross-capture color permanence. No new persistence scheme is added in this bounded sprint.

## GitHub transport

This machine's existing Git Credential Manager and GitHub connector support branch push and issue/PR writes independently of Replit; the sprint push and PR are direct evidence. This does not grant the separate Claude session write capabilities. Claude must use a supported terminal/checkout connected to this host's approved authentication, or an independently authorized write-capable GitHub integration. Its execution environment is not exposed here, and gh is not installed here. No token was read, copied or created. S8 remains an external capability handoff until Claude verifies branch/PR/comment writes from its own environment; do not call Replit a solution to S8.

## Release handoff

Fetch latest main and review the sprint PR. Preserve all original commits, including the scorecard foundation from PR #6. Reconcile other writers before integration, then rerun tests on any combined revision. Review the local/private or Replit preview with the actual bundles. Obtain the release decision for the candidate under the existing operating model. Claude then deploys, verifies both live profiles and native links, and records deployment revision and recoverable code/data state. The previous deployment is not overwritten by any action in this sprint.

The separately reported nine-item post-beta document has not been located; issue #7 is the scoped nine-item sprint, not a claim that the older list has been reconciled. Data recapture, actual iPhone acceptance and Claude-session authentication can remain concrete external follow-ups; they must not be silently marked complete.
