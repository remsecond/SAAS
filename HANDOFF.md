# Hallway handoff

## Current test-release work (September 18, 2026)

See TEST_READINESS.md for the current scope and release gates. The sections below describe the previous shared-preview release. The user subsequently requested meaningful student switching without passcodes and a SAAS-themed test version. Styling and priority ordering are now implemented; actual-coursework capture, student switching, and browser/deployment verification remain open. Actual content for each student is mandatory; do not ask the user to choose fictional boards again. The last synchronized baseline was f68b8aa.


## Current direction

Max and Adrian each need their own actual course content. A visible student switcher must change the course/assignment/resource bundle and keep drafts/checklists separate. No passcodes. The user has reaffirmed this requirement repeatedly.

The currently implemented shared preview contains authored examples and does NOT meet that requirement. Removing the passcode did not authorize replacing personal coursework with one shared board. The old implementation notes below describe the baseline, not acceptance criteria.

Source capture: the parent-folder Kid Chief-of-Staff Data Model reports Canvas observee IDs and read-only endpoints. Its enrollment association is the starting point for mapping each student's courses. The frozen-demo plan requires actual snapshots. No raw course captures have yet been located in the checked workspace, Downloads, Documents/vault, or Documents/Claude. Browser transport remains unavailable; do not call that proof that the source data does not exist elsewhere.

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
