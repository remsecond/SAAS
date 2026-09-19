# Hallway on Replit

- Runtime: Node.js 20+, no dependencies. `npm start` runs `server.cjs`.
- `/` opens Hallway directly. A Max/Adrian switcher chooses whose coursework shows. No passcode, logout or session secret.
- Content comes only from `private-data/snapshots/max.json` and `adrian.json` (git-ignored, built with `tools/build-bundle.cjs` from raw Canvas captures). If a bundle is missing or fails validation, that student shows "not available". There is no fixture fallback.
- `private-data/access-*/` holds retired passcode files. The app does not read them.
- Run `npm run check` before and after any change.
- **Do not reintroduce passcodes, a login page, or fictional/demo coursework.** These are settled requirements.
- **Publishing is paused.** Do not Publish/Republish without Roberto's explicit approval. A Git push does not deploy.
