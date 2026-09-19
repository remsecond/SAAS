# Hallway beta — release record, snapshot location, recovery

Beta punch list, then ship. No new features before release; everything else goes on the post-beta list at the bottom.

## Release revision

- The published revision is recorded in `TEST_READINESS.md` and in the Claude project's release status note. `cf77fb2` added the profile screen; later app changes were two fixes found on the live site: the Content-Security-Policy allowance for Replit's feedback widget, and removal of the in-app student switcher at Roberto's direction.
- GitHub `main` and Replit `main` must match before publishing: on Replit run `git fetch origin && git status -sb` (no "ahead"/"behind") and `git status --short` (empty).
- Codex's commits `9833c25` and `7df2844` keep their original authorship. Do not rewrite history to clear GitHub's "Unverified" label. No force-pushes.
- A Git push does **not** deploy. Only Publish/Republish in Replit changes the live site, and only on Roberto's explicit "publish".

## Where the coursework snapshots live

| What | Where | In Git? |
| --- | --- | --- |
| Built bundles the app serves | Replit `private-data/snapshots/max.json`, `adrian.json` | No (git-ignored) |
| Raw Canvas captures they were built from | Replit `private-data/raw/max.raw.json`, `adrian.raw.json` | No (git-ignored) |
| Second copy of all four files | Roberto's PC: `Documents\SAAS Canvas App\hallway-private\` | No (outside the repo) |
| SHA-256 of each file, counts, capture times | `HALLWAY-QA-REPORT-2026-09-18.md` (PC and Claude project) | — |

The repository is public. Never commit captures or bundles. `npm run check` fails if `private-data/` or `snapshots/` stop being ignored.

## Refreshing the data (before the boys use it)

1. In Chrome, signed in to Canvas as the parent observer, run `tools/canvas-capture.js`.
2. Save each capture to `private-data/raw/<student>.raw.json` and verify its SHA-256 against the one computed in the Canvas tab.
3. `node tools/build-bundle.cjs <student> private-data/raw/<student>.raw.json private-data/snapshots/<student>.json` for `max` and `adrian`. The builder refuses wrong-student, mixed or incomplete captures.
4. Reconcile per-course totals with Canvas, update the expected counts in `qa/manifest.local.json`, then run `node qa/snapshot-check.cjs qa/manifest.local.json` and `npm run check`.
5. Smoke test: open both profiles, switch, open one assignment and one material.
6. The live site only gets the new data after the next Republish. Copy the new files to the PC folder as well.

## Recovery

- **Live site shows "not available" for a student right after publishing.** The deployment did not get that bundle. The page is telling the truth; nothing fake is shown. First confirm the files exist on Replit (`ls -la private-data/snapshots`) and pass the harness. If they do, the deployment snapshot is leaving out git-ignored files: move the bundles to a location the deployment is documented to reach (Replit App Storage, or deployment secrets), point `HALLWAY_SNAPSHOT_DIR`/the loader at it, verify on the preview, and publish again.
- **A bundle is damaged or wrong.** The server refuses it and shows "not available". Rebuild from the raw capture (step 3 above). If the raw file is damaged too, restore both from the PC folder and compare SHA-256 with the QA report.
- **Replit workspace lost.** Re-import from GitHub, restore `private-data/` from the PC folder, run `npm run check` and the harness, press Run.
- **A release misbehaves.** In Replit's Publishing pane, roll back to the previous deployment. For code, `pre-claude-merge-backup` on Replit is the state before the September 18 merge; `cbc2680` is the last revision before the profile screen.
- **Preview pane says "crashed" with `EADDRINUSE`.** A stray server is holding port 5000: `pkill -f 'node server.cjs'`, then press Run.

## After "publish": verify before sharing

1. Open the permanent URL, https://hallway-robmoyer.replit.app. Both profiles load real coursework with the expected capture times; "Change profile" at the bottom of Home returns to the profile screen and the other profile then opens its own coursework.
2. One assignment and one material open for each profile; links open.
3. If Replit's feedback widget is on the published app, send one "QA TEST — please discard" note with no student content and confirm exactly one entry arrives.
4. On the iPhone: add the URL to the Home Screen, open it from there, pick each profile, open an assignment, go Back and Home.
5. Only then share the URL.

## Post-beta feedback list (not before release)

- A lock. If wanted: checked on the server, one code per profile, typed by Roberto into Replit Secrets. Not birthdays.
- Home Screen icon. There is none yet, so iOS uses a screenshot of the page. Needs an agreed image; no school logo is to be invented.
- Working "Add user".
- Automatic or one-click refresh instead of capture-paste-build.
- Content of linked Google Docs and Slides (needs each student's own school Google sign-in).
- Assignments whose Canvas instructions are only an embedded document currently show the embed marker plus the link.
- Change history ("what changed") once there is more than one capture.
- Announcements, calendar events and the 69 undated year-long physics items.
