# PDR-005: PM-Authored User Stories That Preserve User Pain

**Status:** Accepted
**Date:** 2026-02-04
**Context:** Before writing user stories, we need to decide WHO writes them and at what level of detail. This is a process decision with downstream consequences for how engineering work connects to user value.

---

## The Common Pattern

At most companies I've worked with, there's a natural handoff in the work breakdown process:

1. **PM writes the feature spec** — usually an epic or feature-level description with user context, business justification, and high-level requirements
2. **Engineers decompose into stories/tasks** — breaking the feature into buildable units based on technical architecture

The result: stories that read like technical tasks. "Create battery monitoring service." "Add push notification endpoint." "Build threshold configuration table." The user is gone. The pain is gone. The WHY is gone.

This happens because the decomposition follows the system architecture, not the user experience. Engineers naturally think in components, APIs, and data flows. That's the right way to think about implementation — but it's the wrong way to frame what you're building and why.

---

## The Problem This Creates

When stories lose the user:
- **Prioritization becomes arbitrary** — without user pain attached, everything looks equally important. Priority becomes "what's easiest" or "what the loudest voice wants."
- **Scope creep has no guardrail** — if the story is "build notification service," there's no boundary. How much notification service? For whom? The user pain is what defines "enough."
- **Testing loses meaning** — acceptance criteria become technical assertions ("service returns 200") instead of user-meaningful outcomes ("Chris sees a warning when his battery won't last until his alarm").
- **Feedback loops break** — you can't validate a technical task with a user. You can validate a user story with a user. If stories don't reference users, you've cut off the feedback path.

---

## Decision

**The PM (me) writes user stories that preserve user pain. Engineers decompose into technical tasks underneath as needed.**

### Story level (PM-owned):
- Written as: "As [persona], I want [capability], so that [value tied to their specific pain]"
- Acceptance criteria written as user-observable outcomes, not technical assertions
- Each story is independently demonstrable to a user
- Priority is explicitly tied to persona pain and risk

### Task level (engineering-owned):
- Engineers break stories into tasks based on technical architecture
- Tasks reference the parent story — the "why" is always one level up
- Tasks can be sequenced, parallelized, and estimated by the engineering team
- The PM doesn't dictate HOW to build it — that's engineering's domain

### The boundary:
- **PM defines WHAT and WHY** (stories with user pain)
- **Engineering defines HOW** (tasks with technical approach)
- The story is the contract between PM and engineering. The tasks are engineering's plan to fulfill it.

---

## Why This Matters for This Exercise

I'm playing both roles — PM and engineer. It would be easy to skip the user story level and go straight to technical tasks. But that would demonstrate exactly the anti-pattern I'm calling out.

By writing proper user stories first, then implementing them with TDD:
- The tests map to acceptance criteria, which map to user pain
- Every line of code traces back to a persona and their specific problem
- The interview can pull any thread from code → test → story → persona → real experience

---

## Alternatives Considered

**Just write technical tasks:** Faster, but loses the user connection. Demonstrates engineering thinking, not product thinking. For a PM interview, this is the wrong signal.

**Write both stories and tasks:** More thorough, but over-engineering for a prototype. The stories provide enough structure. If an engineering team were picking this up, they'd add their own task decomposition.

**Write only an epic/feature spec:** This is what most PMs would submit for this exercise. It's also what creates the handoff gap I'm describing. The stories ARE the differentiator.
