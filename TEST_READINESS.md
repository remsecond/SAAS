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
