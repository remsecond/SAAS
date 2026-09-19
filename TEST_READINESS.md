# Hallway school test release

## Scope freeze

Finish the existing Hallway application using the supplied SAAS design as a styling reference. Max and Adrian must each see their own actual course content, with a visible student switcher. This is a settled user requirement, not an open choice. Do not substitute fictional or prepared example boards. Keep useful assignment detail, resources, drafts, checklists, Back/Home, filters, and tile/list views. No passcodes. No replacement application or new hosting project.

## Implemented

- SAAS red, charcoal, square panels, bundled Figtree/Montserrat fonts; light default with dark, device and high-contrast options; list default with tile option.
- Actual Canvas coursework for each student, captured September 18, 2026 with verified ownership (see SNAPSHOT-INVENTORY.md). The fictional fixture is gone.
- Visible Max/Adrian switcher. First visit asks who is looking; the choice is remembered on that device.
- Switching resets filters and navigation, clears the previous student from the screen before loading, and ignores late responses for a student who is no longer selected.
- Drafts, checklists and follow-up notes are separate per student, including for identical assignment ids.
- Missing, corrupt, mislabeled or example bundles show an honest "not available" state with Try again. Never fallback content.
- Truthful wording: "Next deadline in this sample", capture time in the header, link-only materials labeled, submitted/graded/excused never shown as unfinished, on-paper work labeled as not trackable, no grades.
- 22 automated tests plus syntax/content checks.

## Release gates

See the dated status block at the end of this file.

## Design assets

Font subsets come from the supplied saved Claude artifact. Their upstream SIL Open Font License texts are included in public/fonts. These are the artifact's font substitutes, not the school's licensed Proxima Nova. No school logo has been invented or substituted.

## Status — September 18, 2026 (evening, Pacific)

**Not published. Waiting on Roberto's "publish".**

Verified on the unpublished Replit development preview with both boys' real captures loaded:

- 22 of 22 automated tests pass on Replit.
- 30 of 30 live acceptance checks pass in a real browser against the preview: both bundles served and labeled; all 129 assignment and material pages (Max 59, Adrian 70) plus Home at 320px and 390px, at 100% and 180% text, with no overflow and no broken text; touch targets at least 44px; every link https; text contrast at least 4.5:1 in light, dark and high contrast; switching resets view and shows none of the other boy's content; drafts stay with their owner and come back after switching; 15 rapid switches end on the last boy chosen; bad student ids and private file paths return 404; no passcode field anywhere.
- Separately, in a cloud Chromium run of the same code: keyboard-only use, visible focus ring, Back restoring focus, remembered student after reload, missing-bundle screen and recovery.

Not done:

- **Real iPhone test.** Desktop browser checks are not an iPhone test.
- GitHub is still at f68b8aa until the push from Replit is authorized; the local PC copy then needs `git pull origin main`.
- Unknown until the first publish: whether a Replit deployment carries the git-ignored `private-data/` folder. If not, the live site will honestly show "not available" and the bundles need another home.
- The capture is frozen at Friday evening. Re-capture shortly before the boys use it.
- Roberto accepted "no passcode for now": anyone with the published link can read both boys' coursework.
