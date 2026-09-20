# School discovery feed sandbox

Owner: Codex. Roberto authorized this isolated experiment and then corrected its direction: browse a school world, not an assignment checklist. Current iteration replaces Feed/Focus with one finite discovery stream.

Open index.html directly; no server, installation or external dependency. Seven fictional stories cover coursework, a teacher update, a creative prompt, feedback, dates, a resource and school life. Visual, text, quotation and poster treatments use fixed crimson/paper/ink tokens. One class selector and Saved are the only persistent controls. Expand a story for context/source information. Save or add a private note; state survives filtering but resets on reload. No school connection, sending, uploads, tracking or production changes.

Framework: authored posts have course, author, kind, title, summary, optional decorative media, detail, facts and native-handoff availability. Production adapters and content ranking are not implemented. Any future adapter must preserve source facts and provenance; current rendering trusts only hard-coded fictional content, not external HTML.

Verification: run node experiments/feed/check.cjs with HALLWAY_PLAYWRIGHT_PATH if Playwright is external. PASS at 320/390/430px with normal and larger text: first-story position, overflow across every card, saved/class filters, personal-note retention, empty saved state, expandable stories and honest native-action placeholders; no page errors. Chromium only. Root inspected the rendered feed. Real-iPhone and student preference NOT RUN.

Acceptance: Does the varied stream invite useful exploration? Are facts findable without making every story a task? Does the ending feel settled? No publishing authorized for this sandbox.

## Shell iteration

Bottom navigation now separates Discover, My work, Prepare and Settings. My work has a working assignment List; Week and Map are explicitly labeled nonfunctional previews. Prepare indexes saved/noted records and labels future study tools as a concept. Settings contains the working larger-text toggle and provenance/privacy description.

One record registry and personal-note store serve shared detail dialogs opened from Discover, My work and Prepare. Return preserves route scroll; native dialog Escape and Back restore focus. A title/class-only assignment demonstrates unavailable dates/materials without fabricated content. This is still a sandbox, not production architecture or live integration.

PASS in the six phone/text cases: shell navigation, identical assignment notes across entry points, sparse record, honest view previews and Settings access. Root inspected 390px viewport with bottom navigation. Real-device acceptance remains NOT RUN.
