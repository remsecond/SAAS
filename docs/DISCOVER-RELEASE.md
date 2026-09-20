# Discover release handoff

Outcome: Roberto requests real coursework in the discovery experience on the already shared https://hallway-robmoyer.replit.app URL. Codex prepared an additive release candidate from current main fbbd45c. Claude remains integration/release operator. No deployment by Codex; browser bridge is unavailable.

Integrate codex/real-discover using normal Git history after fetching and checking for newer main/Replit work. This contains only Discover UI/CSS, test and documentation; no server or data changes. Do not merge the fictional sandbox PR #9 into the served app or overwrite newer main with Managed Sprint PR #8.

What students get: Discover tab in existing Hallway, class selection, factual source excerpts where available, feedback/material previews when captured, one Open assignment action to the existing detail view. All current Home/Board/Courses/Settings and Canvas authority remain. No fictional cards, generated media, inferred teacher updates or new collection. This is a bounded first real-data slice, not the entire sandbox shell.

Verification completed on Windows local candidate: npm run check 57/57; test-support/board-browser-check.cjs 54 combinations; test-support/discover-browser-check.cjs synthetic and private each 24 combinations. Private bundles validate; no source refresh. Test actual local bundles with node test-support/discover-browser-check.cjs <private-dir>. HALLWAY_PLAYWRIGHT_PATH can point at installed Playwright. Real iPhone NOT RUN.

Release sequence:
1. Fetch and inspect exact candidate, current main and Replit dirty state. Preserve private bundles and configured snapshot path; never put them in Git.
2. Integrate candidate without dropping intervening changes; rerun npm run check and both browser harnesses on integrated code. Preview both students with current private runtime data.
3. Check phone navigation/Discover/detail/back, Canvas sign-in/original links, unavailable/sparse records and profile separation. Source dates remain visible and frozen.
4. Publish at existing URL under Roberto's request; do not create another public demo URL. Retain existing code AND private-data recovery configuration before release.
5. Verify live frontend matches integrated assets, both profiles available, Discover count/filter/detail/back and existing Board work. Record deployment revision, time and evidence in PROJECT-STATE. If publish or live checks fail, stop and recover previous working deployment using preserved data/config.

Acknowledgement and deployment remain pending; committing this document does not start Claude automatically.
