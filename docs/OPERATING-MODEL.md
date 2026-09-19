# Hallway delegation and delivery model

## Why this exists

The first sprint fragmented across Codex, Claude, Replit, browser sessions, and local/GitHub copies. Settled requirements were lost, authored content replaced real coursework, pending tasks looked like active work, and Roberto became the transport between agents. The successful pattern was a clear implementation owner plus independent verification, shared artifacts, preserved commits, and explicit release gates.

This model makes that successful pattern repeatable. It is an operating agreement, not an assertion that agents can communicate through tools they do not have.

## Roles

| Role | Responsibility | Required output |
| --- | --- | --- |
| Product owner: Roberto | Product intent, priorities, acceptance, publication decisions | Decisions at meaningful checkpoints; not routine relay work |
| Accountable lead | Owns one end-to-end workstream; assigns, integrates, checks, reports | Current state, integrated deliverable, evidence, next action |
| Implementation delegate | Delivers a bounded change in an agreed branch/environment | Commit/diff, appropriate tests, limitations, handoff |
| Data steward | Captures actual source records, validates student/course mapping and scope | Private raw/built bundles, metadata, separate hashes, refresh/recovery procedure |
| Independent reviewer / QA | Challenges assumptions and reproduces behavior separately | Prioritized findings and reproducible checks; no unrequested redesign |
| Release operator | Performs authorized deployment and verifies the live result | Deployment evidence, data checks, rollback/recovery result |

One agent may hold several roles. Name one lead; do not pretend there are separate independent checks when one agent merely repeats its own conclusion. A delegate may investigate independently but must coordinate any scope expansion or overlapping edit with the lead.

## Work loop

1. **Orient:** read decisions and current state; inspect current branch/dirty files, remote HEAD, pending Replit work, and deployment evidence relevant to the task. Identify what is verified versus reported.
2. **Bound:** state the outcome and acceptance criteria. Separate release-critical work from later ideas. Do not ask Roberto to restate settled requirements.
3. **Assign:** use the delegation packet below. Give each writer an isolated branch or explicit non-overlapping files. Ensure someone owns integration and data handling.
4. **Execute:** continue through the authorized work. Keep useful independent tasks moving while a blocker is addressed. A failed browser bridge does not mean a shell or read-only HTTP check is also unavailable.
5. **Review:** inspect the actual diff/artifact and run checks suited to its risks. Review failures are work, not a new prompt for Roberto. Ask the reviewer to verify the fix when appropriate.
6. **Integrate:** fetch current state; preserve other commits; merge or fast-forward; record exact revision; rerun relevant checks on the combined version. Do not apply stale pending Replit work blindly.
7. **Release or hand off:** deliver an unpublished preview if publication is held. Publish only within current user authorization, then verify the actual live result. If access is blocked, provide one complete handoff rather than a sequence of relay instructions.
8. **Close:** update the one state note, decision log if needed, evidence links, unresolved risks, and next action. Say whether any agent is actually running.

## Delegation packet

```text
Task / outcome:
Accountable lead:
Delegate / role:
Starting revision and environment:
Allowed branch, files, and actions:
Inputs / source evidence:
Settled decisions to preserve:
Definition of done / required checks:
Out of scope / prohibited actions:
Dependencies and integration owner:
Stop or escalate if:
Return: commit/diff or artifact, evidence, limitations, next action.
```

Keep the packet proportionate. A one-file fix needs a short assignment, not ceremony. A Canvas capture needs explicit mapping, coverage, storage, and source-fidelity requirements.

## Hallway-specific ownership and data rules

Actual student records must be joined by verified IDs and student enrollments. Separately establish source identity, completeness within a declared window, capture fidelity, and transformed-bundle validity. Never collapse these into one “verified” checkbox.

Missing sources, access-denied resources, empty descriptions, stale snapshots, and empty filters have different meanings. Preserve those distinctions in the UI. Source comments and grades are not signals to infer a student's emotions or motivation. No silent false reassurance.

The latest settled direction includes no passcodes, a school-style profile chooser, and actual personal bundles. That choice must not silently authorize unrelated data collection, third-party uploads, or publication. Follow the latest explicit user authorization for those actions.

School identity and personality both matter. Respect the SAAS visual family and the approved Hallway/SURF choices; use the current product assets rather than inventing new branding during a bug fix. Personality must be source-independent, optional, and subordinate to truthful practical information. Read the personality spec before changing its behavior.

## Required Git records

For a code delivery, record base revision, delivery revision, integration revision, branch, working-tree status, test environment, and publication state. GitHub is canonical for tracked code after review/integration, not a substitute for inspecting live behavior.

Keep raw and built captures out of public Git. Record counts, capture dates, validation results, and hashes separately when needed. Keep snapshots backed up in the agreed private locations. Treat changes to data location or deployment packaging as release work, not an afterthought.

A review branch can be published to GitHub without claiming that production changed. The lead controls integration. Concurrent work requires a fresh fetch and conflict review; never reset away another agent's checkpoints. Authorship and verification badges are distinct; preserve original commits.

## Release checklist

- Current product scope and intended release revision are explicit.
- Correct actual student content and independent local-edit state are checked.
- Appropriate automated checks pass on the integrated revision.
- Actual-data behavior and phone layout are checked; missing real-device checks are labeled NOT RUN.
- Snapshot freshness, source coverage, private storage, and deployment packaging are accounted for.
- GitHub/Replit/local alignment is recorded accurately; exceptions are stated.
- Current publication authorization is confirmed from the conversation, not inferred from stale notes.
- After authorized publish: both live views and critical resources/actions work; check data metadata and relevant assets.
- Recovery includes code AND data; do not call an untested branch a complete rollback plan.
- Record any deferred feedback-widget/installation tests or known limitations.

The checklist is not permission to add features or require repeated user approval for already authorized steps.

## Evidence vocabulary

**Verified here:** directly inspected/tested by the reporting agent; name the environment and revision.

**Reported:** another agent/user's statement; retain attribution until checked.

**Inferred:** a conclusion supported indirectly; explain its limits.

**Not run:** explicit gap, not a pass and not automatically a release blocker.

**Blocked:** precise unavailable access/dependency and the next person/action needed. Do not call an unresolved product preference a blocker if already settled.

## Handoff without amnesia

Before transferring ownership, provide: current lead and incoming lead; settled requirements; exact paths/URLs; branch/HEAD and dirty state; data locations without secrets; completed and open checks; pending Replit tasks; publication hold/approval; concrete next action. Name what changed since the last handoff.

The incoming lead must inspect current evidence before acting. Old release reports are history, not today's runtime state. Preserve useful work and update the state note rather than generating a new contradictory narrative.

## Definition of complete

Complete means the agreed outcome is implemented, integrated, checked in the appropriate environment, and delivered within the current publication instruction. A planned action, generated prompt, unreviewed delegate reply, pushed commit, or successful tool invocation is not by itself completion.
