# Hallway school test release

## Scope freeze

Finish the existing Hallway application using the supplied SAAS design as a styling reference. Max and Adrian must each see their own actual course content, with a visible student switcher. This is a settled user requirement, not an open choice. Do not substitute fictional or prepared example boards. Keep useful assignment detail, resources, drafts, checklists, Back/Home, filters, and tile/list views. No passcodes. No replacement application or new hosting project.

## Implemented locally

- SAAS red, charcoal, square panels, bundled Figtree/Montserrat fonts.
- Light default; dark, device preference, and high contrast retained.
- List default, with tile option retained.
- Next deadline followed by Needs you before the changes feed.
- Responsive full-width phone container; existing large-text reflow retained.
- Existing rich coursework and prepared resources preserved.
- Fourteen automated tests plus syntax/content checks pass. These include theme/font HTTP delivery, priority ordering, filters, nested navigation, drafts, and checklists.

## Release gates still open

- Locate or capture each student's actual Canvas coursework and linked materials, associate records through student/course enrollment IDs, and load separate snapshots. No student selector or actual student bundles have been added in this revision.
- Implement and test switching, including separate drafts/checklists per student.
- Browser visual/keyboard check at 320px, 390px, desktop, and 180% text. Browser transport is unavailable in this session; automated DOM tests are not a substitute.
- Pull into the existing Replit project without losing Replit-only edits; run checks and publish.
- Verify the deployed revision, application behavior, and Replit/GitHub alignment.
- Actual phone acceptance: open, switch student, filter, open an assignment/resource, go Back/Home, edit a draft, change theme, check overflow.

The code is not yet a complete test release. Do not describe this styling commit as deployed or phone-tested.

## Design assets

Font subsets come from the supplied saved Claude artifact. Their upstream SIL Open Font License texts are included in public/fonts. These are the artifact's font substitutes, not the school's licensed Proxima Nova. No school logo has been invented or substituted.
