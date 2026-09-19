# Hallway on Replit

## Run

- Runtime: Node.js 20 or newer.
- The app has no third-party dependencies.
- The Replit workflow runs `server.cjs` on port 5000 using the generated ignored file at `private-data/access-hLfCFq/runtime.env`.
- Start or restart the **Start application** workflow to open the web preview.

## Access

- `/` opens the design preview directly: no passcode, name picker, logout, or session secret.
- The workflow still loads the ignored `private-data/access-hLfCFq/runtime.env` if present; the app no longer needs it.
- Content is the reviewed fictional design bundle in `fixtures.cjs`; no real student data.

## Checks

Run `npm run check` for syntax/content checks and 12 security and UI-logic tests.

## Publishing constraint

Stateless public preview; published as a Replit autoscale deployment at https://hallway-robmoyer.replit.app.