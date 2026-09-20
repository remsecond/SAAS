# Hallway durable decisions

These decisions summarize explicit user direction. New explicit user instructions take precedence; append a dated superseding decision instead of silently reversing one. This log does not itself authorize publication or disclose data.

| ID | Settled decision | Implication |
| --- | --- | --- |
| D01 | Each student needs their own actual coursework. | No fictional replacement, duplicated boards, or inferred ownership. |
| D02 | No passcode for the present beta. | Preserve profiles and isolation; do not reopen authentication as a routine implementation question. |
| D03 | School-style entry screen. | Hallway / Choose your profile; reusable profile cards; Add user — Coming soon; no family-specific branding. |
| D04 | Stable web URL and Home Screen access. | One published app; preview changes separately; verify updates and installation without promising offline behavior. |
| D05 | Freeze scope to get a useful beta into students' hands. | Release checks and actual defects take precedence over additional features. |
| D06 | Claude was explicitly handed implementation ownership. | Codex review/testing does not silently transfer ownership. Reassign explicitly when needed. |
| D07 | Personality is a core part of affinity and usefulness. | Implement through the personality spec and editable content, not random filler or mandatory video. |
| D08 | One lead coordinates delegates end to end. | Roberto is not the message bus; direct coordination and shared artifacts are the default. |
| D09 | GitHub discipline and preserved authorship matter. | Isolate concurrent edits, preserve commits, verify alignment, and distinguish code from deployment. |
| D10 | No in-app student switcher (Sept 18, after using the published beta: "they say who they are and go"). Supersedes the earlier visible-switcher requirement. | Profile screen at first open; Change profile lives only in Settings and on the not-available screen. Nothing about the other student on Home or detail pages. |
| D11 | Replit's feedback widget is pulled (Sept 18): it needs a Replit account the students do not have, and it is not a release blocker. | The Content-Security-Policy allows no outside host. Feedback reaches Roberto directly until an account-free route is separately agreed. |
| D12 | Hallway uses its own SURF mark, not Seattle Academy's logo, altered or otherwise (Sept 18). | Original wordmark and surfboard in the app's own type; no school name on it; header tile and Home Screen icon. |
| D13 | A real Settings tab holds profile change, text size, look, data provenance, the privacy note, side-note control and Home Screen steps (Sept 18). | Text size and look persist on the device; the tester side panel is desktop-only. |
| D14 | Personality first slice shipped Sept 19 on Roberto's "ship". More lines are an optional creative goal, never a gate. | Briefing prose, loading lines, More like this and audio stay out until separately scoped. Off switch documented in PROJECT-STATE.md. |
| D15 | Links out to Canvas are labeled as Canvas and come with "Sign in to Canvas" (Sept 19, after the link failed on Roberto's phone). The students authenticate to Canvas themselves; Roberto is not in that loop. | Hallway never handles Canvas credentials. The sign-in address is derived from the captured assignment links, never hard-coded. Also offered once in Settings. |

## Decision update format

```text
Date / ID:
Decision and user source:
Supersedes:
Implementation consequence:
Owner / verification:
```

Do not encode guesses about current publication approval as durable product decisions. Record publication state and authority in PROJECT-STATE.md for each release.

## D16 — September 19, 2026: orchestration assignment

Numbering note (resolved at integration, September 19): D15 is Claude's Canvas sign-in decision, recorded in the table above in its original wording from commit `5c8b6bc`, now on GitHub main with its original SHA. The Codex orchestration and shell entries first drafted as D15/D16 are D16/D17; their substance is unchanged. D15 is one concrete instance of the D17 boundary: Hallway labels the handoff and offers the school's own sign-in; the native service owns authentication and the official action.

Roberto’s explicit new-task kickoff assigns Codex cross-team coordination, strategic review, bounded delegation and evidence quality. Claude retains implementation/integration/release ownership; Roberto retains product acceptance and publication authority. This supersedes passive-review-only wording in older records, preserving D06 and one execution owner per workstream. Broader product direction remains a hypothesis and priority guide. The authorized initial outcome is reconciliation and a morning-briefing packet, not blanket implementation or publication.

## D17 — September 19, 2026: companion shell, native authority

Source: Roberto explicitly chose this separation after investigating different access on iPhone and PC. Hallway should be capable of serving as the student's primary shell across school services: bring together permitted read-only information, analyze it, and help prepare study guides, drafts and other student-owned work. This is an architectural direction, not authorization to implement every possible service or analysis feature.

Official actions remain in the authoritative native service. Submission, sending communications, creating or changing official assignments, and other official record changes hand off to the appropriate school service, where the user reviews and performs the action under that service's account and permissions. Local personal planning is distinct from changing an official assignment. Hallway does not submit or send on the student's behalf.

Keep source facts, Hallway-derived guidance and personal drafts distinguishable. Preserve source links, capture time, coverage and uncertainty. Opening the native service, copying a draft, or checking a local box is not evidence that something was submitted or sent; Hallway may report official status only from source evidence, labeled with its freshness. A failed handoff must leave an honest explanation and preserve prepared work within the applicable storage behavior, not simulate success.

The native service owns authentication, permissions and official outcomes. The shell does not bypass sign-in, promise identical access across devices, or require embedding native services. Sanctioned read-only access still needs demonstrated permission and availability. Existing privacy, no-reporting-upward and separate external-AI-transfer decisions continue to apply; read-only is not blanket permission to transmit student data elsewhere.

Owner: Codex maintains the architectural boundary and independent review; Claude owns implementation/integration. Verification for future features must cover the handoff destination and correct account context, unavailable access, no silent writes/sends, and no false completion after returning. The supplied screenshot illustrates the existing original-assignment handoff; it does not diagnose the reported iPhone access loss or establish its cause. No app change or publication authorized by recording this decision.

## D18 — September 19, 2026: managed phone-first sprint

Roberto explicitly authorized Codex to take Sprint #7 implementation through a managed sprint while Claude works elsewhere, including coding agents. Codex owns this bounded sprint's implementation, delegation, integration and evidence. Claude remains the subsequent release handoff owner; publishing remains a separate decision. Phone format is primary. Preserve immediate comparison between selection and results, truthful class color/tints, text-labeled recorded status, counted undated access and native-service authority. GitHub is the coordination/code transport; Replit is preview/deployment infrastructure, not a required GitHub relay.
