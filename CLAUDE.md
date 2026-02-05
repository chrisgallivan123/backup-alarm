# Backup Alarm — Project State

**Last updated:** 2026-02-04
**Due:** Thursday Feb 6 (submit) | Monday Feb 9 (interview)

---

## Guiding Principles

1. Decisions are the differentiator — the trail of WHY is what they'll pull on
2. Test-driven — write the test first, every slice provably correct
3. ADRs as breadcrumbs — every significant decision gets a record
4. Fast feedback / riskiest first — sequence for fastest feedback on riskiest requirement
5. Personas define the problem — start with WHO has the pain
6. Simplicity — "If it takes 5 minutes to describe, it's too complicated"
7. Descriptive commits — git log tells the story
8. Anticipate pushback — have lower-tech alternatives ready
9. Code quality — clean structure, no shortcuts
10. Plan for feedback — if no feedback is coming in, that's a ticking time bomb

---

## Phase Tracking

- [x] **Phase 0: Prerequisites & Environment** — gh CLI, git config, repo created
- [x] **Phase 1: Personas & Problem Definition** — `11c51fe`
  - Chris (Global Professional), Jen (Parent), Thomas (Three-Alarm Person), Naiyah (The Kid)
  - Problem: no safety net when phone dies overnight, failure is silent and cascading
- [x] **Phase 2: Solution Options & Feasibility** — `522ae4b`
  - Three options evaluated: prediction+push, heartbeat, threshold
  - Chose: on-device prediction with inverted backup model
  - MVP: nudge at alarm-set time based on battery prediction
  - Vision: PagerDuty-style cascade to devices + family, location-aware
  - Spike validated linear drain model across all persona scenarios
  - Mockup styled as iOS alarm — toggle on, see nudge
  - User interview with Jen: concept validated, copy refined
  - Key quote: "If it popped this up, I would have plugged it in"
  - Jen independently suggested cascade trigger (roadmap validation)
- [ ] **Phase 3: User Stories & Prioritization**
- [ ] **Phase 4: Technical Design, Tech Stack & Repo Setup**
- [ ] **Phase 5–N: TDD Implementation Slices**
- [ ] **Phase 6: Integration & Polish**
- [ ] **Phase 7: Package the README**
- [ ] **Phase 8: Interview Prep**

---

## Key Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| 001 | Feature: backup alarm for battery failure | Accepted (in brain, to be formalized) |
| 002 | Solution: on-device prediction, inverted backup model, MVP = nudge at alarm-set time | Accepted — MVP nudge validated with user interview; full cascade approach not yet validated |

---

## Resume Point

**If session compacts, start here:**
1. Read this file for phase status
2. Read `docs/personas.md` for persona context
3. Read `docs/adr/002-solution-approach.md` for solution approach
4. Next action: Phase 3 — write user stories with acceptance criteria
5. MVP nudge UI and copy validated with Jen (user interview). Full cascade vision is documented but unvalidated.

---

## Context Boundary

This is the **project repo**. Brain reference material lives in:
- `90_LOG/EY_PM_Exercise.md` — coaching intel, principles, interview prep
- Do NOT mix brain tasks with project phases
