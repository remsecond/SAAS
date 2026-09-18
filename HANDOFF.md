# Hallway sprint handoff

## Release status — September 18, 2026

**Not deployed or verified in Replit. No hosted URL to distribute yet.**

The clean starting checkout and remote HEAD were `8bf412a`. This sprint implements a protected fictional demo and adds security/UI checks. The revision containing this handoff is a deployment candidate, not a deployed revision. Resolve its exact commit with `git rev-parse HEAD` after pulling it.

Browser inventory worked in the earlier connection check. During the sprint, opening Replit returned `Transport closed`; repeated inventory and reset calls failed identically. No Replit project inventory, sign-in, import, secret configuration, pricing review, publication, or hosted gate verification was possible. The user has been asked to reconnect the integration. No paid commitment was made. The prior Sites preview remains unchanged.

## Student data

Max: fictional fixture only. Adrian: fictional fixture only. No verified personal bundle was found in the supplied workspace, and fresh source access was blocked by the browser transport. See [SNAPSHOT-INVENTORY.md](SNAPSHOT-INVENTORY.md). Reported audit examples were not converted into verified records.

## Implemented behavior

- Server-side student sessions and protected snapshot delivery; name-only demo entry, secret configuration, logout, expiry, attempt limits, and no-store responses.
- Shared UI separated from fictional fixtures, escaped source content, clear identity, frozen clock and honest capture labels.
- Immediate filters, tile/list views, Home/nested Back, local draft/checklist retention, themes and text sizing.
- Visible source caveats and unavailable states, labeled prepared examples, and a Trends & Learnings placeholder with no collected history.
- Private session-secret provisioning without printing secret values.

## Testing and limits

`npm run check` covers static/syntax and fixture separation checks plus 19 tests (7 HTTP security, 11 simulated-DOM interaction, 1 temporary session-secret provisioning).

No actual browser rendering, browser login cookie flow, narrow-screen visual review, keyboard traversal, Replit hosted verification, or real iPhone test has been completed for this revision. The simulated DOM checks logical focus restoration and navigation; it cannot certify real focus or layout. Do not distribute until hosted verification passes.

Sessions and rate limits are in-memory and require one server instance. Restarts/republishing sign everyone out and reset counters. Keep Replit maximum servers at 1 and document any hosting changes before release.

## Resume in Replit

Use the [README runbook](README.md). Reconnect the browser, inspect for an existing matching project, and have Roberto complete sign-in if needed. Synchronize the tested commit without discarding Replit-only changes. Configure protected secrets and publish fictional fixtures first, with maximum one server. Read the actual cost and ask before any new paid commitment.

Verify the actual HTTPS deployment URL while signed out and under each student's session, including isolation, tampered requests, logout, and browser interactions. Record that URL and deployed commit here. Have each boy test on his actual iPhone before claiming phone acceptance.

## Updates

Code: review, run checks, commit/push, pull exact revision in Replit, republish, verify hosted URL.

Data: verify ownership, capture timestamp, reference clock, coverage and evidence outside Git; inject the reviewed bundles through protected runtime configuration, republish, and recheck both student boundaries. Never commit snapshots or secrets. No emails/messages, school edits, AI services, or background sync are part of this demo.
