# Hallway personality layer

Status: proposed implementation spec from Roberto's product direction. Claude remains implementation owner. This is the next small product increment; do not reopen or delay the current beta release, change authentication, or publish without the existing release approval.

## Product intent

Personality is part of Hallway's experience, not decorative filler. Students should recognize its voice, feel comfortable returning, and eventually contribute to it. Hallway helps them get their bearings without sounding like a parent monitoring their work.

The experience combines practical direction with a slightly absurd inner life. On ordinary days it is brief and useful. When the available coursework is in order, it has room for weird facts, invented colors, and cosmic perspective. Humor must not require finishing all work to be available: a loading line or daily extra can appear without making productivity a condition of belonging.

The first version uses curated text. Audio can read the same approved script later. Video, a generative model, and NotebookLM integration are not prerequisites.

## Voice

Observant, lightly absurd, warm, concise. It has its own character but does not impersonate a teacher, parent, friend, or therapist.

- Joke about the app, time, the universe, and the general absurdity of school—not a student's ability, identity, grades, missed work, or circumstances.
- Avoid nagging, guilt, forced slang, exaggerated praise, and motivational speeches.
- Do not infer anxiety, laziness, overwhelm, or any other emotion from assignment status. Adapt to explicit preferences and student input, not invented psychological conclusions.
- Dry cosmic doom is allowed: distant stellar futures, entropy, administrative incompetence in the universe. Avoid personal death predictions, imminent catastrophe, violence, self-harm, school threats, or targeting a real person.
- Keep jokes recognizable as jokes. Factual claims need a checked source. Never invent a scientific countdown and present it as fact.
- Personality never supplies coursework facts. Titles, dates, status, ownership, and links come from verified student data.

## Initial surfaces

### 1. Home arrival

Show the useful briefing first, followed by at most one short personality line. Keep the primary action visible without scrolling just to get past the joke. Do not add a modal, splash screen, or mandatory animation.

The practical briefing answers: what matters within the captured scope, where to start, and what can wait when the data actually supports that claim. Limit it to three priorities and one next action. A briefing is optional when data is missing; never fabricate one to fill the space.

Examples below are writing examples, not actual student records:

> Two things to keep in view today. Start with the lab questions due this afternoon: open your notes and check what's left. After that, you can look at tomorrow's reading.

> Canvas still marks this assignment missing. If you already handed it in, check with your teacher before doing it twice.

Do not claim that remaining work can wait unless the captured coverage and known dates justify it. Use “Next in this snapshot” or equivalent where coverage is limited.

### 2. Genuine loading

Display an accurate status such as “Loading your coursework…”; optionally place one personality line beneath it. No artificial delay, fabricated progress bar, or claims about operations the app is not performing. Never replace an actionable error with a joke.

For slow requests, preserve the status and offer recovery according to the existing loader. Do not continually cycle text or repeatedly announce jokes to screen readers. One line per loading episode is sufficient.

### 3. All-clear state

First say what is actually clear, then show an optional daily extra.

- For a frozen or partial capture: “No unfinished work is listed in this snapshot.”
- For adequate verified coverage: describe the actual checked date window.
- Never turn missing data, a failed request, or an empty filter result into an all-clear.

“Nothing matches these filters” remains a filter state with Clear filters. It is not a reason to celebrate being caught up.

### 4. Daily extra

An unobtrusive “Today's side note” area on Home can offer a joke or checked fact regardless of workload. It stays below the essential next action. It must not push urgent work down the page or become an endless feed.

Reuse one daily selection across Home and its optional audio. Do not place different jokes in every component. First version: at most one personality line visible on Home, plus one during genuine loading.

## Content types

1. **App observations:** self-aware remarks about calendars, interfaces, and organization.
2. **Obvious nonsense:** invented colors, imaginary departments, absurd notices.
3. **Cosmic perspective:** clearly comic observations about the universe; factual elements still need verification when specific.
4. **Verified strange facts:** a concise fact with a source available through “Why is that true?” or “Source.”

Verified facts launch only after editorial review. The starter collection below is deliberately jokes rather than an unverified fact database. Scientific dates and countdowns require a sourced estimate and honest uncertainty; do not add a ticking death/destruction clock in this increment.

## Content model

Keep the collection separate from rendering and student snapshots, for example `content/personality.json`. Each entry includes:

```json
{
  "id": "universe-management",
  "text": "The universe remains poorly managed.",
  "surfaces": ["daily_extra", "all_clear"],
  "kind": "joke",
  "tone": "cosmic",
  "status": "approved",
  "source": null,
  "reviewedAt": null
}
```

Allowed status: draft, approved, retired. Only approved entries render. A `fact` requires a source URL, review date, and an approved factual wording. Keep source notes out of the spoken line. Entries with conditions must use explicit eligibility tags rather than guessing from their wording.

Maintain ideas separately, for example `content/personality-ideas.md`: proposed line, suggested surface, contributor if voluntarily supplied, and editorial notes. Student submissions start as drafts; they do not go live automatically.

## Selection and state

- Select from eligible approved entries for the current surface and chosen tone preference.
- Use the student's local calendar day in the configured school timezone for daily rotation. The daily extra may rotate independently of the frozen coursework clock; it must not imply that coursework was refreshed.
- Persist selected daily line and recent history per profile on that device. Never use coursework text, names, grades, or comments as random seeds or humor-generation prompts.
- Keep selection stable through navigation, reload, and brief student switching. Each profile retains its own selection and preferences.
- Prefer no repeats within 14 days. If the eligible collection is exhausted, use the least recently shown entry; do not fail or invent new text.
- Do not select text for one student and render it after another profile has become active. Respect the existing loading-generation/identity guard.
- In version one, preferences/history are local to the browser/device. State this in settings; do not imply cross-device sync. Handle unavailable local storage without breaking coursework.
- A corrupt/missing content collection disables personality gracefully; coursework still loads. Render all content as text, never executable HTML.

## Student control and learning what works

Provide a small optional menu on the personality line:

- **More like this:** records a local preference for that tone, without immediately rerolling the page.
- **Not this one:** suppresses that line for the profile on that device.
- **Keep it straightforward:** switches to a practical-only experience, including loading messages.

Keep these controls out of the primary schoolwork flow. No pop-up ratings, streaks, rewards, guilt about disabling humor, or request to rate every line. If the first implementation needs to be smaller, ship Not this one and the practical-only preference first; the collection and idea bank are still required.

Local preference signals help personalize selection. They are not aggregate analytics and must not be reported as evidence that all students like a line. Initially, editorial learning comes from voluntary feedback, the idea bank, and what students choose to quote or suggest. Do not start behavioral tracking or remote transmission as part of this increment.

Roberto and the boys can seed ideas. An implementation owner reviews them for voice, factual accuracy, placement, and unintended meaning before approval. Retire lines that feel stale or annoying. Adding lines should not require editing UI code, though a deployed static collection may still require the normal release process.

## Audio path, after text is working

The approved practical briefing and selected personality line form one short script. Target roughly 20–30 seconds when spoken; omit humor when it makes the briefing too long. A tap starts playback; provide stop/replay and the complete readable text. No autoplay surprise, no requirement to listen, no audio-only instructions.

Use the same frozen-data revision and source facts as the visible briefing. If the snapshot changes, invalidate old generated audio. Stop playback when changing profiles or leaving the relevant screen. Audio failure must not hide the text or block the Start here action.

Choose voice technology separately after the text experiment. This spec does not authorize sending student content to a new external provider. A polished video is not an acceptance criterion.

## Starter collection: 24 candidate lines

These are editorial seeds, not an instruction to mark every line approved automatically. Unless explicitly conditional below, they make no factual claim about the student's work.

### Loading — alongside a truthful loading status

1. “Consulting the hallway.”
2. “Putting Thursday back where it belongs.”
3. “Removing unnecessary doom.”
4. “Your day is loading. Please refrain from adding more day.”
5. “Asking the calendar to use its indoor voice.”
6. “Untangling the concept of next week.”
7. “Straightening the imaginary noticeboard.”
8. “Please enjoy this brief absence of information.”

### Daily extras — obvious nonsense and cosmic perspective

9. “Today's official color is Unsupervised Orange.”
10. “Today's color has been discontinued for behavioral reasons.”
11. “The universe remains poorly managed.”
12. “Gravity continues to show up without being asked.”
13. “Today's forecast: time will pass. Further details unavailable.”
14. “The Department of Tuesdays has declined to comment.”
15. “Somewhere, a printer is considering its options.”
16. “Your pencil has requested a less demanding career.”
17. “The calendar would like credit for being organized.”
18. “This message has no educational objective. You're welcome.”
19. “Today's color is Administrative Purple.”
20. “The universe has not submitted its project plan.”

### All-clear extras — only after a truthful scoped status

21. “A rare quiet moment. Let's not give it more assignments.”
22. “The imaginary confetti budget has been approved.”
23. “The Sun's eventual demise remains outside this planning window.”
24. “We recommend enjoying this unusually cooperative calendar.”

Never append “we checked twice,” “everything is done,” or other verification claims unless those claims are actually supported. The factual status and comic aside must remain distinguishable.

## Visual and accessibility rules

- Fit the existing SAAS typography, red/charcoal palette, and square-card language. Personality lives primarily in the words; do not create a competing mascot or visual identity in this increment.
- Use readable body text; no marquee, flashing, forced animation, or fake typing delay.
- Ensure source/menu/playback controls have accessible names, visible focus, and usable touch targets.
- Do not steal focus on rotation or reload. Announce actual loading/error status appropriately; humor is not an assertive live announcement.
- Reflow at 320px and 180% text. Practical-only mode leaves no empty card or awkward blank space.

## Acceptance tests

- All initial entries live outside UI code; drafts/retired entries never render.
- Missing, failed, stale, partial, and filtered-empty coursework states cannot trigger an unqualified all-clear.
- A personality line never changes task priority, dates, status, ownership, or source content.
- Daily selection stays stable through navigation/reload; profile switching restores independent history/preferences. Test storage failure and corrupt collection handling.
- Recent lines are avoided where alternatives exist; exhaustion has a deterministic graceful fallback.
- Not this one removes the line for that profile; practical-only suppresses humor on every surface.
- Facts without required source/review information cannot be approved/rendered as facts.
- No additional wait is introduced to display a loading joke. Errors provide recovery without comic substitution.
- Student content is not logged, sent to an external model, or used to generate jokes.
- Keyboard, screen-reader status behavior, 320px layout, large text, and all existing themes remain usable.
- Existing snapshot/switching/navigation/draft-isolation tests remain green.
- If audio is implemented later: text fallback, stop/replay, profile-change cancellation, and snapshot-version invalidation pass.

## Rollout and success

Ship as a small post-beta increment behind a simple configuration switch so it can be disabled independently of coursework. Begin with a reviewed subset of the starter lines. Keep one release note distinguishing personality changes from data refreshes.

During the first week, ask one open question: “Anything Hallway said that you liked—or that got old?” Invite their lines. Revise the collection based on those answers, not on assumptions about engagement. Success is a recognizable voice they welcome, without obscuring what they came to do. There is no required usage streak, retention target, or surveillance dashboard.

Deferred: generated humor, video, cross-device preference sync, shared public submissions, remote analytics, recurring generation schedules, and automatic audio generation. None is needed to establish the voice.
