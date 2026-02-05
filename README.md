# Backup Alarm: Never Miss a Wake-Up Again

**An iOS feature concept for the Apple ecosystem that ensures alarms always reach you — even when your phone fails.**

*Designed for iPhone users with Apple Watch, HomePod, iPad, and Family Sharing — leveraging iCloud to coordinate cross-device backup alarms.*

---

## The Problem

When you set an alarm before bed, you're making a trust contract with your phone: *"Wake me up at this time."* But phones die. Batteries drain overnight. Software crashes silently.

**The failure mode is uniquely cruel:** you don't know the alarm failed until you wake up late. There's no warning, no fallback, no second chance.

For people with high-stakes mornings — early meetings, kid competitions, flight departures — this isn't a minor inconvenience. It's a silent catastrophe waiting to happen.

---

## The Solution: Two Features, One Safety Net

This MVP delivers two complementary features:

### 1. Battery Risk Prediction & Nudge

**Problem:** Your phone is at 34% when you set your 5 AM alarm. Will it last? You don't know.

**Solution:** When you toggle on an alarm, the system predicts whether your battery will survive until alarm time. If it won't, you see a nudge immediately — while you can still plug in.

**[View Prototype →](https://chrisgallivan123.github.io/backup-alarm/spike/alarm-nudge-mockup.html)**

```
┌─────────────────────────────────────────┐
│  ⚠️ Alarm at Risk                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Estimated battery at alarm: 0%         │
│  Plug in now.                           │
└─────────────────────────────────────────┘
```

### 2. Cross-Device Backup Cascade

**Problem:** Even if you plug in, the cable could slip, the outlet could fail, or the phone could crash. Your single point of failure is still... single.

**Solution:** Configure a backup list — Watch, HomePod, family member's phone, even a landline. If your phone doesn't respond at alarm time, backups fire in sequence until someone wakes up.

**[View Prototype →](https://chrisgallivan123.github.io/backup-alarm/spike/backup-config-mockup.html)** | **[View Architecture →](https://chrisgallivan123.github.io/backup-alarm/spike/backup-architecture.html)**

```
Your alarm: 5:00 AM

If phone fails:
  5:02 — Apple Watch fires
  5:04 — HomePod fires (if no response)
  5:06 — Jen's iPhone fires (if still no response)
  5:08 — Call hotel front desk (if still no response)
```

---

## Why This Feature?

I chose this because I've lived it. Almost missed an EMEA call after my phone died overnight. Woke up at 7:15 to missed Slack messages and a meeting that almost happened without me. The damage would't just have been to my schedule — it would have eroded trust.

When I talked to others, I found I wasn't alone:

| Persona | Their Pain |
|---------|-----------|
| **Chris** (Global Professional) | Almost missed EMEA call and damaged trust with colleagues who stayed late for him |
| **Jen** (Parent) | One oversleep means her kids don't compete — there's no "join late" in dance |
| **Thomas** (Three-Alarm Person) | Sets 3 alarms across 3 devices every night because he can't trust one |
| **Naiyah** (9-year-old dancer) | Worries about letting her duet partner down if her alarm fails |

**[Full Personas →](docs/personas.md)**

---

## User Stories

### Feature 1: Battery Risk Prediction & Nudge

| Priority | Story | What It Proves |
|----------|-------|----------------|
| **P0** | Battery Risk Prediction | Can we predict battery death accurately? |
| **P1** | Critical Battery Nudge | Does the nudge change behavior? *(Validated: yes)* |
| **P1** | Safe State — No Nudge | Does restraint earn trust? |
| P2 | Warning Severity | Does graduated response reduce alarm fatigue? |

### Feature 2: Cross-Device Backup Cascade

| Priority | Story | What It Proves |
|----------|-------|----------------|
| **P1** | Backup Alarm Configuration | Can users set up a safety net? |
| **P1** | Backup Alarm Trigger | Does the backup actually catch failures? |
| **P1** | Phone Call Backup | Does it work for travelers without devices? |

**[Full User Stories →](docs/user-stories.md)** | **[Prioritization Rationale →](docs/decisions/PDR-003-prioritization.md)**

---

## Key Design Decisions

### The "Inverted" Backup Model

**Obvious approach:** Phone triggers backup when it's dying.
**Problem:** A dead phone can't trigger anything.

**Our approach:** Cloud always holds the backup. Phone's job is to *disarm* it by checking in. If the phone goes silent, the cloud fires the backup automatically. **[ADR-002 →](docs/decisions/ADR-002-solution-approach.md)**

```
NAIVE MODEL                         INVERTED MODEL
─────────────                       ──────────────
Phone dies → Can't send signal      Phone dies → Stops checking in
Backup never fires                  Cloud detects silence → Fires backup
User oversleeps                     User wakes up
```

**[Full Architecture Comparison →](https://chrisgallivan123.github.io/backup-alarm/spike/backup-architecture.html)**

### Snooze Behavior

Snooze **pauses** the cascade for 9 minutes — it doesn't resolve it. After snooze ends, the same device fires again. Only **Stop (X)** resolves the cascade. Users can snooze unlimited times (standard iOS behavior preserved). **[ADR-002 →](docs/decisions/ADR-002-solution-approach.md)**

### One Alarm at a Time

No "symphony" of devices blasting simultaneously. Backups fire in sequence, 2 minutes apart. First device to get a response stops the cascade. **[ADR-002 →](docs/decisions/ADR-002-solution-approach.md)**

**[All Decisions →](docs/decisions/)** — ADR-002 (Solution Approach), PDR-003 (Prioritization), PDR-005 (Story Ownership)

---

## Prototypes

Open these in your browser to explore the validated UI:

| Prototype | What It Shows | Open |
|-----------|--------------|------|
| **Battery Nudge Mockup** | iOS-style alarm screen with risk nudge | [Open →](https://chrisgallivan123.github.io/backup-alarm/spike/alarm-nudge-mockup.html) |
| **Backup Config Mockup** | Drag-to-reorder backup list with timing preview | [Open →](https://chrisgallivan123.github.io/backup-alarm/spike/backup-config-mockup.html) |
| **Architecture Diagram** | Interactive comparison of naive vs inverted models | [Open →](https://chrisgallivan123.github.io/backup-alarm/spike/backup-architecture.html) |

### Running the Cascade Logic

```bash
node spike/backup-cascade.js
```

This runs 15 scenarios validating the backup cascade logic — snooze handling, escalation, offline devices, spotty networks, and grace periods.

---

## What I'd Do Next

If this shipped, here's the roadmap:

1. **Background battery re-check** — Periodic overnight monitoring with a second nudge if battery drops faster than predicted
2. **Location-aware cascade** — Smart reordering based on which devices are likely near the user
3. **HomeKit integration** — Lights on, blinds open as non-audio alarm alternatives
4. **Custom voice message** — Let users record a personal message for phone call backups

---

## What I'd Cut

If time ran out, I'd ship Stories 1-3 + 5-6 and cut:

- **Warning Severity (Story 4)** — Graduated warnings are polish, not core
- **Phone Call Backup (Story 7)** — Most users have Apple devices; phone calls are edge case

The feature still works: prediction + critical nudge + silence when safe + backup cascade. The refinements improve experience but aren't required.

---

## Guiding Principles

These principles — developed over my career — shaped the methodology used in this project:

1. **Decisions are the differentiator** — Not artifacts or story format. The trail of WHY is what matters.
2. **Personas define the problem** — Start with WHO has the pain and WHY it hurts, not what we're building.
3. **Riskiest assumption first** — Sequence for fastest feedback on what could kill the feature.
4. **Simplicity over cleverness** — If it takes 5 minutes to describe, it's too complicated.
5. **Anticipate pushback** — Have simpler alternatives ready. Don't dismiss, acknowledge and explain.
6. **Plan for feedback** — If you don't see feedback coming in, that's a red flag, not a green light.
7. **Don't oversell** — If it's not AI, don't call it AI. Honesty is defensible.
8. **Be willing to be wrong** — When feedback contradicts assumptions, update the assumptions.

---

## How This Was Built

This project was built with AI assistance (Claude Code) following the methodology above:

1. **Personas first** — Defined WHO has the pain before deciding WHAT to build
2. **Riskiest assumption first** — Prioritized by what could kill the feature, not by user-facing value
3. **ADRs as breadcrumbs** — Every significant decision documented with alternatives considered
4. **User validation** — Both prototypes tested with a real user (Jen, Persona 2)
5. **Stories map to prototypes** — Each story corresponds to a tangible deliverable
6. **Methodology codified** — After completing this project, I codified the process into a reusable Claude Code skill (`/feature-formula`) that can be invoked for future feature development — taking any idea from problem definition through validated prototype using the same methodology

The git history tells the story: `git log --oneline`

---

## FAQ

### "Why this feature?"
Personal experience + validated user pain. See [Personas](docs/personas.md).

### "What else did you consider?"
Three solution approaches evaluated. See [ADR-002](docs/decisions/ADR-002-solution-approach.md).

### "Why this priority order?"
Riskiest assumption first. See [PDR-003](docs/decisions/PDR-003-prioritization.md).

### "Couldn't you just plug in your phone?"
Yes — and the nudge reminds you to. But cables slip, outlets fail, phones crash. The backup cascade catches what the nudge can't prevent.

### "Why Apple ecosystem only?"
iCloud provides the infrastructure for cross-device coordination and Family Sharing. The inverted backup model requires a trusted cloud that already knows your devices. Apple's ecosystem is uniquely positioned to deliver this seamlessly.

### "What would you cut?"
Story 4 (warning severity) and Story 7 (phone calls). Core value intact.

---

## Repository Structure

```
backup-alarm/
├── README.md                    ← You are here (the presentation)
├── docs/
│   ├── personas.md              ← Who has this problem
│   ├── user-stories.md          ← What we're building
│   └── decisions/
│       ├── ADR-002-solution-approach.md
│       ├── PDR-003-prioritization.md
│       └── PDR-005-story-ownership.md
└── spike/
    ├── alarm-nudge-mockup.html  ← Prototype: battery nudge
    ├── backup-config-mockup.html ← Prototype: backup configuration
    ├── backup-architecture.html  ← Diagram: inverted model
    └── backup-cascade.js         ← Logic: cascade simulation
```

---


