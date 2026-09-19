# Snapshot evidence inventory

Current requirement: two personal snapshots using Max and Adrian's actual coursework, with student selection and no passcode. The previous assertion that the user wanted a single shared example board was incorrect. Prototype scenarios are not a replacement for actual course records.

Reviewed September 18, 2026. Neither personal snapshot is ready for deployment.

| Material inspected | What it establishes | Suitable as a personal snapshot? |
| --- | --- | --- |
| Repository at initial commit `8bf412a` | Fictional interface fixtures, no captured source bundles | No |
| Parent-folder frozen demo plan and JSON data contract | Scope and example schema; contract explicitly says example-only | No |
| Parent-folder study-tools audit and issue tracker | Reported observations, examples, and unresolved student-attribution concerns | No |
| Parent-folder capability inventory and connection plan | Distinguishes reported access from verified access and missing evidence | No |
| Parent-folder data-model note | Reported identifiers and proposed vault layout; no raw vault was found in the supplied workspace | No |
| Older prototype HTML files and PDF-render artifacts | Design examples, not independently verified records with ownership and capture provenance | No |

No raw snapshot JSON/CSV vault was found in the supplied workspace. The audit notes specifically warn that a parent grade view can contain both students' courses. Examples must not be promoted to either student's records based on course names or the selected dashboard student alone. The older Sites project was left untouched.

The connected-browser transport failed during this sprint, so fresh authorized source verification could not proceed. This is not evidence that the school source is unavailable or that either student has no work.

To replace each fictional fixture, obtain a bounded, read-only source capture with a verified student association for every record; actual capture timestamp; separate fixed demo reference time; declared date/course coverage; assignments, independent submission and grade fields, source evidence and linked resources. Include supported explanations for missing fields. Preserve uncertainty when a cause is unknown. Store the reviewed bundles only in protected runtime configuration, never this repository or public assets.

Status: Max — fictional fixture only. Adrian — fictional fixture only.
