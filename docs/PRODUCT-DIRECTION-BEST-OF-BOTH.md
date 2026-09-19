# Hallway direction: best of both

Source: Roberto's supplied direction, written September 19, 2026 from his conversation with Claude. This document preserves its product argument and priorities. It is **direction, not an authorized plan of record**. Nothing here creates a scheduled task, approved feature, or publication instruction. Settled decisions remain in DECISIONS.md; current execution state remains in PROJECT-STATE.md. Claude's detailed `claude/hallway-release-status.md` may live in the Claude project rather than this repository; do not assume it is locally accessible.

## The product thesis

### Accepted authority boundary — September 19 update

Roberto subsequently chose Hallway as a potential primary companion shell across school services: permitted read-only aggregation and analysis, study preparation and personal drafts in Hallway; official submissions, communications and assignment changes in the authoritative native service. This boundary is an accepted design principle, unlike the broader feature hypotheses below. See D16 in `DECISIONS.md` for handoff, source-truth, access and privacy requirements. It does not authorize new integrations, external AI transfers or publication.

Generic capture/summarize/prioritize/brief functionality is becoming commonplace. Hallway's value should not rest on being another assignment organizer. Its narrower opportunity is a school companion a teenager did not necessarily choose, grounded in actual school information and using a voice he does not hate.

The important choices have often been anti-features: no other-brother UI in everyday screens, no surveillance, no nagging, no jokes at the student's expense. Hallway says what it cannot see because a false all-clear is especially damaging for schoolwork.

The supplied direction predicts generic briefing will become free/better within a year and suggests general assistants will not receive the same school access. Treat those as strategic hypotheses, not established technical, legal, market, or policy facts. Test differentiation through student usefulness, trust, and actual access constraints; do not repeat absolute claims without evidence.

## Compare the two approaches

| Dimension | Broad daily-assistant category, as framed in the direction | Hallway's current approach |
| --- | --- | --- |
| User | Adult who chose the assistant | Teenager who may not have asked for it |
| Data | Broad and connected | Bounded frozen school captures |
| Core move | Brief, triage, draft | Show captured information honestly and stop |
| Initiative | Comes to the user | Student opens the app |
| Memory | Persists across days | Drafts/checklists reset on reload |
| Intelligence | Model-based reasoning | Rules and curated text |
| Voice | Helpful professional | A slightly unhinged hallway with opinions about Tuesdays |
| Risk | Confident mistakes and nagging | Staleness and generic guidance |
| Trust | “I handled it” | “Here is what I can and cannot see” |

This is a strategic contrast, not an audited description of every competing product.

## Proposed priorities, in order

1. **A short morning briefing:** what matters and where to start, based only on captured evidence. Connect it to the generic Next action review finding. A deterministic first version needs no model. However, a Home briefing and an unsolicited delivered notification are different implementations: select the surface, delivery permission, freshness behavior, and stopping rules before scheduling or messaging anyone. Do not claim a frozen Friday capture establishes Monday's current work.
2. **Freshness without Roberto manually relaying every capture:** investigate sanctioned, durable Canvas access. Do not bypass authentication, extract cookies, or promise unattended refresh without a demonstrated permitted mechanism. Keep manual captures until a replacement works.
3. **Student-respecting memory:** drafts/checklists per profile, on-device, without silently syncing or reporting upward. Handle shared devices, clearing, storage failure, and migration deliberately.
4. **A model, only after a separate decision:** reasoning grounded in captured teacher instructions, with sources and uncertainty. Source citation does not guarantee correctness. Student content must not go to another AI provider merely because a model seems useful.

## Do not import these behaviors

- “I handled it” claims without evidence.
- Acting on the student's behalf: Hallway can help draft; the student sends/submits.
- Parent-facing reports of student behavior or effort.
- Inferring feelings, motivation, or mastery from unfinished work.
- Replacing the recognizable voice with generic professional-assistant language.

## Relationship to telemetry

Roberto also expressed interest in performance, diagnostics, usage, and stickiness. Reconcile that interest with the no-surveillance/no-reporting-upward direction before implementing personal interaction logging. Operational failures and load timings are different from exposing which student did what. Prefer the least revealing signals needed, show the student an honest explanation, and define who can inspect what. Do not presume pseudonymous identifiers make two identifiable students anonymous.

Earlier kickoff text instructing immediate telemetry implementation is historical context, not authority to override this later direction. An operational-logging slice may still be useful, but it is not automatically ahead of the morning briefing.

## Product principles to retain

Say what you cannot see. Put the scope in the sentence. Offer Not this one and Keep it straightforward. Never let humor or a confident summary substitute for an error state.

**The category's reach and initiative, with Hallway's honesty and manners.**

**In. Out. Laugh. Feel settled.**

The adoption question: **does either student open it a second time without being asked?** Seek voluntary feedback and minimally intrusive evidence. It is a product-learning question, not permission to introduce covert tracking, streaks, or engagement pressure.
