# ADR-003: Story Prioritization — Riskiest Assumption First

**Status:** Accepted
**Date:** 2026-02-04
**Context:** Four user stories defined for the MVP. Need to decide the order we build them and why.

---

## Decision

Stories are prioritized by risk to the feature's viability, not by user-facing value alone.

| Priority | Story | Risk It Addresses |
|----------|-------|-------------------|
| P0 | Battery Risk Prediction | If prediction doesn't work, nothing else matters |
| P1 | Critical Battery Nudge | If the nudge doesn't change behavior, the feature fails |
| P1 | Safe State — No Nudge | If the feature is noisy, users disable it and it fails through abandonment |
| P2 | Warning Severity | If we only have critical warnings, the feature still works — just less refined |

---

## Rationale

### Why not prioritize by user value?

The instinct is to build the most user-visible thing first — the nudge (Story 2). But the nudge depends on the prediction (Story 1). If we build a beautiful nudge on top of a broken prediction, we've built a confident liar.

Sequencing by risk means:
1. **Prove the prediction works** (Story 1) — the foundation everything else depends on
2. **Prove the nudge changes behavior** (Story 2) — already validated with Jen, but implementation must match the validated mockup
3. **Prove silence works** (Story 3) — equally critical for adoption; a feature that cries wolf dies
4. **Refine the signal** (Story 4) — graduated severity improves the experience but isn't required

### What we'd cut

If time runs out after Stories 1-3, we have a fully working feature: prediction + critical nudge + silence when safe. Story 4 (warning severity) is a refinement. This is a clear, defensible answer to "what would you cut?"

### What we'd never cut

Story 3 (safe state). It's tempting to skip "showing nothing" because there's nothing to demo. But a feature that warns you every night regardless of risk is worse than no feature at all. Thomas (persona 3) is the proxy for this — he'll disable anything noisy.

---

## Alternatives Considered

**Prioritize by user journey order:** Set alarm → see prediction → see nudge → dismiss. Logical, but doesn't surface risk. We'd build the full journey before knowing if the foundation works.

**Prioritize by implementation effort:** Build the easiest stories first for quick wins. This creates momentum but delays risk discovery. The predicted completion anti-pattern: easy work first, hard surprises later.

**Prioritize by persona importance:** Build Chris's story first because it's the personal origin story. Emotionally compelling, but the personas all share the same underlying feature. The implementation order should follow technical risk, not narrative order.

---

## Connection to Guiding Principles

- **Principle 4 (Fast feedback / riskiest first):** P0 is the riskiest assumption. If prediction fails, we know immediately and can pivot.
- **Principle 10 (Plan for feedback):** Each story is independently demonstrable. After Story 1+2, we can show a working prediction + nudge to users for feedback before building further.
- **Thomas's coaching:** "I would sequence in a way that got me feedback the fastest on the riskiest requirement."
