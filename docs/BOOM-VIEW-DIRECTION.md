# Boom view: school context, student agency

September 20, 2026. User direction: Boomscroll means useful impact, not doomscrolling. The students have study hall daily. Boom belongs where they browse work and classes, not only in a separate Discover destination. This update implements sandbox placement only; it does not authorize another production release.

## Placement and shared information

My work: List / Boom alongside labeled Week and Map previews. Same assignment IDs, source facts, details and personal notes. Courses: Overview / Boom with class scope; entering a class from Overview opens its contextual stream. Discover remains broader browsing. Prepare holds saved/noted items and the explicitly inactive “I'm feeling lucky” placeholder. No random selection, generation or outside AI request occurs.

Study hall is a use context, not an inferred bell schedule. Let students look across classes or inspect one class, see what information is available, and choose where to start. Do not infer comfort, mastery, effort or motivation from clicks, status, or unfinished work. No reporting upward. Any future comfort input must be explicitly student-declared, optional and private; no such collection is implemented here.

## Review of Personal Assistant vs Hallway insights

Reviewed docs/PRODUCT-DIRECTION-BEST-OF-BOTH.md (the recorded comparison, not an audited competitor survey) and Roberto's conversation clarifications. Generic assistants can contribute read-only retrieval, analysis, drafts and learning formats when appropriate; avoid rebuilding free capabilities for their own sake. Hallway's value is school context, useful decisions, readable presentation, honest source limitations and a student-respecting voice. Future NotebookLM/audio/decks remain separately scoped integrations with an explicit data-transfer decision, not implied by read access.

| Broad assistant opportunity | Hallway application |
| --- | --- |
| Aggregate and summarize | Keep class, actual title, dates and capture provenance connected across views. |
| Recommend a next action | Offer a source-grounded starting point, not automatic task assignment. |
| Remember context | Student-owned notes attached to a shared record, with clear storage limits. |
| Generate learning formats | Reserve Prepare for source-linked tools without pretending they already work. |
| Proactive briefing | A concise hero with freshness and student acknowledgement; avoid repeated nagging. |

## Hero remains a design hypothesis

At-a-glance orientation should shrink after acknowledgement and return only for a meaningful supported change. Acknowledgement is not completion. Frozen captures cannot establish current school state. Future state needs per-profile storage, clear/reset behavior and a source-change fingerprint; do not equate a changed clock with newly captured work. Not implemented in this iteration.

## Card rules and boundaries

Use only available fields; title/class-only records remain compact. No ornamental images to fill missing source content. One route into shared detail. Distinguish a source excerpt from app guidance. Unknown dates do not mean urgent or unimportant. Official actions remain in Canvas. The production Discover implementation is separate from this fictional sandbox.

Verification: six local Chromium combinations, 320/390/430px and normal/larger text. Covers shared details/notes from work Boom, scoped course Boom, navigation, sparse record and inactive Lucky label. Real-iPhone and student comfort feedback remain NOT RUN.
