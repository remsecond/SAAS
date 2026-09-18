# Hallway on Replit

## Run

- Runtime: Node.js 20 or newer.
- The app has no third-party dependencies.
- The Replit workflow runs `server.cjs` on port 5000 using the generated ignored file at `private-data/access-hLfCFq/runtime.env`.
- Start or restart the **Start application** workflow to open the web preview.

## Access

- The fictional demo requires no passcode. Choose Max or Adrian and click **Open my snapshot**.
- The ignored `private-data/access-hLfCFq/runtime.env` contains the session-signing secret.
- Run `npm run setup-access` only when intentionally provisioning a new session secret; it creates a new directory and never overwrites an existing one.
- The app uses fictional fixture data unless `HALLWAY_SNAPSHOTS_JSON` is supplied with reviewed, ownership-verified snapshots.

## Checks

Run `npm run check` for syntax, security, UI-logic, and access-provisioning tests.

## Publishing constraint

Sessions and rate limits are held in memory. If publishing, use server hosting and configure a maximum of one server.