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

## Decision update format

```text
Date / ID:
Decision and user source:
Supersedes:
Implementation consequence:
Owner / verification:
```

Do not encode guesses about current publication approval as durable product decisions. Record publication state and authority in PROJECT-STATE.md for each release.
