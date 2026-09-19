# Hallway handoff

## Current direction

The user explicitly removed the passcode requirement and rejected the name picker and repetitive fictional coursework. The current change delivers one direct-entry design preview, restoring detail from the original prototype and adding useful prepared content and placeholder messages. This supersedes the earlier two-gated-demo plan for this public preview.

No personal grades or verified personal snapshots are included. Content provenance distinguishes reported prototype examples, prepared guidance, and material not captured. No live school connection, outgoing messages, AI service, or fabricated learning history.

## Implementation

- `/` opens the preview directly; `/api/snapshot` returns the single reviewed design bundle.
- No passcode, identity picker, logout, secrets requirement, or provisioning step.
- Legacy private snapshot environment settings are unused; no runtime student bundles are published by removing the gate.
- Content and UI remain separate. Filters, tile/list layout, Home, nested Back, drafts/checklists, themes and text sizing remain.
- Original schoolwork scenarios are restored as design examples with useful detail and explicit resource placeholders.

## Replit status

Existing project: https://replit.com/@robmoyer/Hallway

Existing hosted URL: https://hallway-robmoyer.replit.app

The prior hosted page was verified over HTTP as a name selector with no passcode; signed-out snapshot requests returned 401. The user made Replit-side changes after import. The current local changes have not been compared against those Replit-only edits or published there. Browser-control calls still return `Transport closed`. Do not create another project or assume a git push updates hosting.

On reconnection, inspect the existing project's git diff and revision, preserve user edits, synchronize this implementation, run checks and publish. Verify the actual hosted URL opens directly into the richer board with no name prompt. Review any new cost before accepting it.

## Verification

`npm run check` passed: 12 tests plus content/reference and script checks. The old authentication tests are replaced with tests for the new public-demo behavior and for keeping legacy runtime bundles outside the response. UI logic tests use a simulated DOM. Real browser appearance, keyboard traversal, phone-width rendering, large-text rendering, and actual iPhone acceptance remain unverified for this revision.

## Updating content

Edit `fixtures.cjs` for assignments, next steps, resource descriptions/previews and missing-material messages; use `public/index.html` for presentation. Keep provenance honest and retain the fixed reference clock. Test, push, synchronize the existing Replit project, republish, and verify the hosted result.
