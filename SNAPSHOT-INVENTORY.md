# Snapshot evidence inventory

Requirement: two personal snapshots of Max's and Adrian's actual coursework, a visible switcher, no passcode.

## Captured September 18, 2026 (Pacific)

Source: the school's Canvas site, read through the parent's signed-in observer session with `tools/canvas-capture.js`. No API token, cookie or password was used or stored.

Ownership evidence: both students were confirmed as the signed-in parent's observees, and every course came from that student's own active **student** enrollment. Every submission record carried that student's Canvas user id. The builder re-checks all three and refuses a capture that fails any of them. Records are joined by Canvas ids, never by course names.

| | Max | Adrian |
| --- | --- | --- |
| Courses (own student enrollments) | 9 | 9 |
| Assignments included / in Canvas | 25 / 113 | 33 / 41 |
| Canvas pages copied (readable in Hallway) | 12 | 11 |
| Files (link-only) | 4 | 5 |
| Fetch errors | 0 | 0 |

Coverage is partial and declared in each bundle: 7 days back, 14 days ahead, older unfinished work, undated unfinished work. One of Max's courses lists 69 undated year-long items; those are counted and disclosed, not shown. Two courses per student had no assignments or modules in Canvas at capture.

Not captured: grades or scores (by design), Google Docs / Drive content (needs the student's own school Google account; links are kept and labeled), file contents, announcements, calendar events, change history (one capture cannot show changes).

Storage: `private-data/raw/*.raw.json` and `private-data/snapshots/*.json`, git-ignored. Never in this repository or `public/`.

The earlier fictional fixture (`fixtures.cjs`) has been removed. The earlier `HALLWAY_SNAPSHOTS_JSON` secret is not student data and is not read.
