# Hallway handoff

One owner, one status. Read TEST_READINESS.md for the dated release status and SNAPSHOT-INVENTORY.md for what was captured and how ownership was verified.

## Settled requirements (do not reopen)

- Max sees Max's actual coursework; Adrian sees Adrian's. You say who you are on the profile screen and go; the header always says whose coursework is showing. **No in-app student switcher** (Roberto, Sept 18, 2026, after using it: the boys do not look at each other's work). The only way back is one quiet "Change profile" link at the bottom of Home and on the "not available" screen. This supersedes the earlier "visible switcher" requirement and the "existing switcher still works" line in the profile-screen requirement.
- No passcodes (Roberto re-confirmed "no passcode for now" on Sept 18, 2026). If a lock is added later it must be checked on the server, with codes typed by Roberto into Replit Secrets — never in code, GitHub or chat.
- No fictional coursework, no fallback content, no invented deadlines or feedback. No grades.
- SAAS design language; phone-first; frozen capture, not a live connection.
- **Publishing only on Roberto's explicit "publish".** A Git push does not deploy.

## Where things live

- Replit project: https://replit.com/@robmoyer/Hallway · hosted URL: https://hallway-robmoyer.replit.app
- GitHub: https://github.com/remsecond/SAAS (public — never commit captures or bundles)
- Student data: `private-data/raw/*.raw.json` and `private-data/snapshots/*.json` in the Replit workspace, git-ignored.
- `private-data/access-*/` holds retired passcode files; the app does not read them.

## Refreshing the coursework

1. In a Chrome tab signed in to Canvas as the parent observer, run `tools/canvas-capture.js`.
2. Save each student's capture to `private-data/raw/<student>.raw.json`.
3. `node tools/build-bundle.cjs <student> private-data/raw/<student>.raw.json private-data/snapshots/<student>.json`
4. Restart the app. The builder refuses wrong-student, mixed or incomplete captures; the server refuses invalid bundles.

Canvas quirk: for observers, `order_by=due_at` on the assignments endpoint returns an empty list. The capture script does not use it.

## History worth keeping

- Backup branch on Replit: `pre-claude-merge-backup` (state before the Sept 18 merge). Older: `replit-pre-sync-backup`.
- The earlier fictional fixture and the passcode login were removed on purpose. A parked Replit Agent task that would have restored them was cancelled with Roberto's approval.
