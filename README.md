# Hallway

**Know what you're walking into.**

A phone-first frozen snapshot demo. Both student slots currently use fictional examples. Neither personal snapshot has been verified or installed; see [snapshot inventory](SNAPSHOT-INVENTORY.md).

## Deployment status

No Replit deployment or hosted HTTPS URL has been verified. Browser access returned `Transport closed` when opening Replit; inventory retry and session reset also failed. The existing Sites preview was left untouched. GitHub publication is not Replit deployment.

## Run and test

Node.js 20 or newer. No dependencies, database, school connection, AI, or background refresh.

```
npm run check
npm run setup-access
```

Setup writes a fresh ignored `private-data/access-*` directory containing `runtime.env` (the session secret) and separate student access notes. It never prints the secret or overwrites an earlier set. Windows access is restricted to the current user; Unix permissions are 0700/0600. Keep these files outside shared folders.

Load local configuration with `node --env-file=private-data/access-<generated>/runtime.env server.cjs`, or set values through Replit's Secrets and published-app secrets. `npm start` uses its environment. Missing/invalid configuration leaves the app locked. Secure cookies require HTTPS for browser use. Automated tests exercise HTTP directly and verify cookie attributes.

| Protected setting | Purpose |
| --- | --- |
| `HALLWAY_SESSION_SECRET` | Random session signing secret, at least 32 bytes |
| `HALLWAY_SNAPSHOTS_JSON` | Optional JSON bundles keyed `max` and `adrian`; omitted identities use fictional fixtures |

Use setup to generate a session secret. Rotate sessions by replacing the secret and restarting or republishing.

## Security boundary

The server gates both the page and `/api/snapshot`. The student chosen on the sign-in screen is stored in the signed session; parameters cannot select another bundle. This fictional demo does not require a passcode. Cookies are Secure, HttpOnly, SameSite, time-limited, and revoked on logout. Attempts are limited; personal responses use `Cache-Control: no-store`. No public route exposes snapshots, source files, or configuration. No service worker is installed. School text is escaped before rendering.

Sessions and attempt counters are in memory. **Run one instance only.** Set Autoscale maximum servers to 1. A Reserved VM is another option only after reviewing actual account cost. Restarts, scale-to-zero, and republishing invalidate sessions and reset counters. This is a small demo, not multi-instance authentication infrastructure.

## Replit publication

1. Inspect existing apps for matching `remsecond/SAAS` before importing a duplicate. Synchronize reviewed GitHub code, preserving any Replit-only work.
2. Configure Secrets and published-app secrets. Start with fictional fixtures; leave `HALLWAY_SNAPSHOTS_JSON` unset.
3. Run checks and start the app. Test the gate and both logins in the HTTPS preview.
4. Use server hosting, never Static. Run `npm start`; internal port 3000, external port 80; maximum one instance. Read the actual cost and obtain approval for any new paid commitment.
5. Publish and open the actual hosted HTTPS URL. Verify signed-out rejection, both identities, logout, and tampered student parameters. Check narrow widths, enlarged text, focus and navigation.
6. Record URL and exact deployed commit in HANDOFF.md, update private access notes, and share privately. Preview or git push is not deployment verification.

[Replit deployment types](https://docs.replit.com/features/publishing/deployment-types) documents hosting choices and maximum-server configuration. Check account-specific prices in the publishing screen.

## Replacing snapshots

Use `fixtures.cjs` and the parent-folder contract as structural examples. A personal import additionally requires `snapshot.ownership` containing `verified: true`, its matching `studentId`, and a nonempty `evidence` explanation from an actual ownership review. This flag is an operator attestation, not automated proof. Every owned record must match its bundle's student and all references must resolve. Include actual capture time, separate frozen reference time, timezone, declared coverage, and evidence. Distinguish no matching filters, nothing due in a verified scope, not captured, unavailable through the parent view, and unknown reasons. Never infer the reason from a blank field.

Prepare and review bundles outside Git. Inject reviewed JSON into protected `HALLWAY_SNAPSHOTS_JSON`, restart/republish, and retest both identities and signed-out access. Keep fictional fixtures until source verification and protected deployment are complete. Never put private records in public assets, source maps, Git, browser storage, or caches.

## Interface and test limits

Only the authorized snapshot is loaded. Filters update immediately; tile/list views, Home, nested Back, themes, text sizing, and navigation-local drafts/checklists remain. Reload/logout resets local work. Source caveats appear beside affected content; prepared examples are labeled. Trends & Learnings has no history or fabricated analysis. No messages are sent or school records changed.

Checks include syntax/privacy checks, HTTP security tests, simulated-DOM UI logic, and private session-secret provisioning. Simulated DOM tests do not establish rendered layout, browser cookies, actual keyboard accessibility, or iPhone usability. Browser/device verification remains required before distribution.

## Updating code

Review, run `npm run check`, commit and push. Pull that exact revision in Replit, recheck settings and tests, then republish. Verify the hosted URL and update HANDOFF.md. Keep secrets and records out of commits.
