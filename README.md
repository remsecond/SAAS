# Hallway

**Know what you're walking into.**

One direct-entry school companion design preview. No passcode, student picker, or account setup. The user changed the scope from two gated fictional student demos to one richer demonstration of the product.

## Content

The preview develops the assignment and resource scenarios from the original Hallway design: what needs attention, what changed, useful next actions, related materials, drafts and checklists. Reported prototype examples and prepared placeholder content are labeled; they are not verified current school records. No personal grades are included. The demo clock remains fixed, separately from source-capture status. Trends & Learnings explains that history has not been collected; there is no working AI chat, email sending, school update or background refresh.

Edit the content in `fixtures.cjs`; edit the interface in `public/index.html`. Keep next steps and missing-material explanations useful at the point of use. Preserve instant filters, tile/list view, nested Back, Home, themes, large text, and draft/checklist retention during navigation. Reload resets local work.

## Run

Node.js 20 or newer; no package dependencies or secrets required.

```
npm run check
npm start
```

Open http://localhost:3000. The server returns the one reviewed design snapshot through `/api/snapshot`. Old `HALLWAY_*` secret values and personal snapshot configuration are ignored. Requests cannot choose another bundle. Source files, runtime files, and filesystem paths are not served. The old `/login` URL redirects to the preview.

## Replit

Project: https://replit.com/@robmoyer/Hallway

Hosted URL: https://hallway-robmoyer.replit.app

The hosted URL was reachable, but this updated direct-entry version has not yet been synchronized or verified there. The earlier hosted version displayed a name picker without a passcode. See HANDOFF.md for exact status.

To update: review and run `npm run check`, commit and push. In the existing Replit project inspect any Replit-only changes, synchronize the reviewed GitHub revision, run checks, and publish using `npm start` with port 3000. Confirm the actual hosted page opens directly to the board. Do not mistake GitHub push for deployment. Review any new paid commitment before accepting it.

## Tests

Automated checks cover public demo routing, consistent content, ignored legacy runtime bundles, escaped source text, and UI behavior using a simulated DOM. Browser visual checks, real keyboard traversal, narrow-width/enlarged-text rendering, and actual iPhone testing must be recorded separately. A simulated DOM is not a device test.
