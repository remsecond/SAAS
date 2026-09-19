# Hallway

**Know what you're walking into.**

A phone-first school companion for two students. Max sees Max's actual Canvas coursework; Adrian sees Adrian's. A visible switcher chooses whose coursework is showing. No passcodes, no fictional coursework, no fallback content.

## How the content works

Hallway shows a **frozen capture** of real coursework, not a live connection.

1. `tools/canvas-capture.js` runs in a signed-in parent/observer Canvas tab. It reads each observed student's own enrollments, a bounded window of assignments (7 days back, 14 days ahead, older unfinished work, undated work), submission status, teacher comments, and the Canvas pages and files linked from those assignments. No grades. No tokens, cookies or passwords are touched.
2. `tools/build-bundle.cjs` turns a raw capture into a student bundle. It refuses captures that are for the wrong student, that mix students, or that recorded fetch errors. Nothing is authored: where Canvas had nothing, the bundle says so with a reason.
3. `bundles.cjs` validates every bundle on every request (identity, references, timestamps, reasons, no grades). `server.cjs` serves `/api/students` and `/api/snapshot?student=max|adrian`. A missing or invalid bundle returns an honest "not available" — never example content.

Raw captures and bundles live in `private-data/` (git-ignored). **They must never be committed**: this repository is public.

```
private-data/raw/max.raw.json         private-data/snapshots/max.json
private-data/raw/adrian.raw.json      private-data/snapshots/adrian.json
```

```
node tools/build-bundle.cjs max private-data/raw/max.raw.json private-data/snapshots/max.json
node tools/build-bundle.cjs adrian private-data/raw/adrian.raw.json private-data/snapshots/adrian.json
```

Add `--reference <ISO time>` to set the frozen reference clock separately from the capture time. `HALLWAY_SNAPSHOT_DIR` overrides the bundle folder.

## What is honest by design

- The header always says whose coursework is showing and when it was captured.
- Coverage is partial, so the home screen says "Next deadline in this sample", and an empty sample is never described as "no work".
- Google Docs, videos and files are link-only: Hallway says their content was not copied.
- Drafts, checklists and follow-up notes are kept per student, stay on the device, and reset on reload. Nothing is sent anywhere.
- Fonts are Figtree/Montserrat substitutes (OFL licenses in `public/fonts`), not the school's Proxima Nova. No school logo is used.

## Run

Node.js 20 or newer; no dependencies.

```
npm run check
npm start
```

Open http://localhost:3000. Old `HALLWAY_*` secrets and `/login` are ignored (`/login` redirects home).

## Replit

Project: https://replit.com/@robmoyer/Hallway · Hosted URL: https://hallway-robmoyer.replit.app

A GitHub push does not deploy. The hosted URL only changes when someone presses Publish in Replit. See TEST_READINESS.md for current status.

## Tests

`npm run check` covers the server (per-student isolation, path and parameter abuse, missing/corrupt/mislabeled bundles, legacy secrets), bundle validation, the builder's refusal cases, and UI behavior in a simulated DOM (switching, rapid switching, per-student drafts, honest failure states, filters, navigation, escaping). Test data is synthetic and labeled `SYNTHETIC`. A simulated DOM is not a browser or phone test; those are recorded in TEST_READINESS.md.
