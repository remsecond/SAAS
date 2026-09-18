# Hallway

**Know what you're walking into.**

Phone-first school planning interface. This repository contains fictional UI fixtures only, not real student records. The repository is currently public.

## Run

Node.js 20 or newer. No dependencies are required.

```
npm run check
npm start
```

Open http://localhost:3000. The standalone public/index.html can also be opened directly.

## Replit handoff

Import this GitHub repository into Replit. Run `npm start`; the included server listens on PORT or port 3000. Use that same command when publishing the web app. Review Replit's actual deployment settings and costs before publishing. The .replit file supplies the intended start command and port mapping; the Replit workspace must still be configured and tested.

Pull reviewed GitHub changes into Replit before republishing. A GitHub push alone does not update an existing Replit deployment. No Replit deployment has been created by this repository initialization.

## Current behavior

Immediate filters, tile/list views, nested Back, Home, themes, large-text preview, draft retention during the session, and local checklist state. Date/time is frozen. No school connection, AI, analytics or outgoing messages. External resource buttons explain that they are not connected.

## Personal demos — not implemented yet

The next phase is separate frozen snapshots protected by a server-side passcode gate. Both page access and data access must be protected. Student identity must come from a verified session, never a client-selected student ID. Passcodes must not appear in source, URLs or browser bundles. Use secure session cookies, hashed passcodes, login attempt limits and logout.

Real snapshots must be injected through protected runtime storage/configuration outside Git and outside the public folder. Do not add either boy's data until the access gate and isolation tests pass. A hidden link or client-side password check is not protection.

Every unavailable value needs a verified plain-language reason or an honest unknown state. Do not invent school facts to fill the screen. Prepared study examples must be labeled as examples.

## Ownership

Codex maintains the implementation; GitHub is the shared source of truth; Replit is the proposed runtime/hosting destination. Keep runtime secrets out of Git. Retain change notes in HANDOFF.md.
