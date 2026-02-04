# ADR-002: Solution Approach

**Status:** Accepted
**Date:** 2026-02-04
**Context:** Four personas defined with real alarm-failure pain. Need to decide HOW to solve the backup alarm problem before writing stories.

---

## Options Considered

### Option A: On-Device Prediction + Cloud Push (Inverted Model)

**How it works:** When a user sets an alarm, the phone checks battery level, drain rate, and time until alarm to predict whether the battery will survive. If risk is detected, the user is nudged to plug in. For the full vision, the alarm is also registered with a cloud service (iCloud) as a backup — the phone's job is to periodically confirm "I'm fine, don't fire the backup." If the phone goes silent, the cloud triggers the backup alarm on another device.

**The architecture inversion:** The original framing had the phone detecting a problem and then requesting backup. That's backwards — if the phone is dead, it can't request anything. The inverted model means the backup is ALWAYS armed. The phone disarms it by checking in. Silence IS the trigger.

**Strengths:**
- Prediction happens where the data lives (on the device)
- Proactive — warns before failure, not after
- Inverted model means phone death can't prevent the backup
- Leverages Apple's existing infrastructure (iCloud, Family Sharing, HomeKit)

**Weaknesses:**
- Full cascade requires cloud infrastructure and cross-device coordination
- Prediction model needs historical drain data to be accurate
- Full vision is complex — needs careful scoping for MVP

### Option B: Cloud-First Heartbeat Monitor

**How it works:** Phone sends periodic heartbeats to a cloud service. If heartbeat stops before alarm time, cloud triggers backup.

**Why we rejected it:**
- Constant heartbeats drain battery — the feature creates the problem it's trying to solve
- False positives from airplane mode, poor signal, phone restarts would erode trust fast
- Thomas (Three-Alarm Person) would disable it within a week if it false-alarmed
- Detection-after-failure is inherently worse than prediction-before-failure

### Option C: Simple Threshold + Buddy Alert (Low-Tech Baseline)

**How it works:** If battery drops below a threshold (e.g., 20%) and there's an alarm set, alert a backup contact.

**Why it's the fallback, not the solution:**
- This is the "couldn't you just plug it in?" answer. Valid, but doesn't solve the problem — shifts it to another person
- Reactive, not predictive — by 20%, it might be too late
- Doesn't account for drain rate (20% with 8 hours vs 20% with 2 hours are very different)
- Included as a last-resort safety net inside Option A

---

## Key Design Decisions (From Discussion)

### The Silent Mode Problem

**Challenge raised:** If the backup fires on Jen's phone as a notification, her phone is on silent at 5 AM. Nobody wakes up.

**Resolution:** The backup must be a real ALARM on the backup device, not a notification. Native iOS alarms bypass silent mode. Since we're designing this as a native iOS feature, Apple controls the alarm and can trigger it cross-device. A push notification is not a backup alarm — an alarm is a backup alarm.

### The Cascade Model (PagerDuty-Style)

**Challenge raised:** What if the backup device also fails? How do we know the backup person actually woke up?

**Resolution:** Borrow from incident management (PagerDuty). The backup alarm requires acknowledgment (dismiss). If no dismiss within a time window, the alarm escalates to the next device/person in the cascade. The cascade continues until someone acknowledges.

### Device Cascade (Single-Person Households)

**Challenge raised:** What if you don't have family? Not everyone has a backup person.

**Resolution:** The cascade isn't just people — it's devices. A single person might have: iPhone → Apple Watch (on their wrist) → HomePod (loud, no battery) → iPad → HomeKit automation (lights on, blinds open). No family member required. Family Sharing extends the cascade to people, but the device cascade works standalone.

### Location-Aware Filtering

**Challenge raised:** Your iPad at home is useless if you're in a hotel.

**Resolution:** Apple already has device proximity and location data (Find My). The cascade automatically filters to reachable devices. At home: full cascade including HomePod and HomeKit. Traveling: Watch → family members (with context: "Chris has a 5 AM alarm in Chicago and his phone died"). Traveling is actually where this feature matters most — unfamiliar chargers, hotel outlets in weird places.

### Feasibility Scoping

**Challenge raised:** Is all of this actually feasible? We shouldn't design something we can't validate.

**Resolution:** Separated MVP from vision.

---

## Decision: MVP vs Vision

### MVP (What We Build and Prototype)

**Nudge at alarm-set time.** When the user sets an alarm, the system checks:
- Current battery percentage
- Charging state (plugged in or not)
- Estimated drain rate (from historical patterns)
- Hours until alarm

If the battery is predicted to die before the alarm fires, the user sees an immediate nudge:
> "Your battery is at 34% and not charging. Based on your typical overnight drain, your 5:00 AM alarm may not fire. Plug in now."

This is the Apple Watch battery nudge model — all intelligence invisible, user sees one clear action. No cloud. No cross-device. No cascade. One device, one prediction, one nudge at the moment the user can still act.

**Why this is the right MVP:**
- Solves the core problem (you find out your alarm is at risk BEFORE you go to sleep, not after)
- Zero infrastructure required (all on-device)
- Immediately valuable on its own
- The simplest version where AI is doing the core work (Principle 2: AI-first)

### Vision (Roadmap for Future Releases)

- **R2:** Background monitoring — periodic re-check overnight, second nudge if battery keeps dropping
- **R3:** Cross-device backup to your own devices (Watch, HomePod) with inverted model
- **R4:** Family cascade with PagerDuty-style acknowledgment via Family Sharing
- **R5:** Location-aware cascade filtering
- **R6:** HomeKit integration (lights, blinds as non-audio alarm alternatives)

Each release builds on the last. Each is independently valuable. The cascade architecture we designed is the north star, but we ship the nudge first because it delivers value immediately with minimal complexity.

### Prototype Approach

**The feature is designed for Apple's native iOS alarm.** Apple owns the alarm, the battery APIs, the notification system, and the OS. The integration is straightforward for them.

**We prototype the prediction engine** — the brain of the feature — as a web app styled to look like the iOS alarm experience. When the interviewer sets an alarm in the prototype, they see the nudge in context. They feel the feature, not just read about it.

**We're honest about the boundary:** "I designed this as a native iOS alarm feature. I prototyped the prediction engine and the user experience to prove the core logic works. As a PM, my job is to spec it well enough that an engineering team can build it. Here's that spec, and here's proof that the hardest part works."

---

## Addressing "Couldn't You Just Plug It In?"

Thomas will push on this. The answer:

"You're right — plugging it in is the simplest solution. But these personas already plug it in and still have the problem. Cables slip. Outlets fail. The phone gets knocked off the nightstand. The failure isn't 'forgot to charge' — it's 'thought it was charging but it wasn't.' The nudge catches that at the moment you can still act. A cable you think is plugged in doesn't."

"The Apple Watch battery nudge is the model. All that intelligence, invisible to the user. They just see: 'charge now.' We're doing the same thing for the alarm: 'your alarm is at risk, plug in now.'"

---

## Spike Results

Built a prediction function and ran it against persona-based scenarios:

| Scenario | Battery | Drain | Hours | Result | Predicted % |
|----------|---------|-------|-------|--------|-------------|
| Chris: EMEA call, unplugged | 34% | 8%/hr | 6 | CRITICAL | 0% (dead) |
| Chris: same, plugged in | 34% | 8%/hr | 6 | SAFE | 100% |
| Jen: competition morning | 55% | 6%/hr | 7 | WARNING | 13% |
| Thomas: plenty of battery | 80% | 3%/hr | 8 | SAFE | 56% |
| Naiyah: fell asleep watching videos | 22% | 12%/hr | 5 | CRITICAL | 0% (dead) |
| Edge: exactly at 5% threshold | 45% | 5%/hr | 8 | CRITICAL | 5% |
| Edge: 30 min to alarm, low battery | 8% | 10%/hr | 0.5 | CRITICAL | 3% |
| Edge: 100% but rogue app drain | 100% | 15%/hr | 8 | CRITICAL | 0% (dead) |

**What the spike proved:**
1. Linear drain model correctly identifies risk across all persona scenarios
2. Three-tier output (safe/warning/critical) provides useful, actionable signal
3. Cost asymmetry handled — borderline cases flagged critical, erring toward backup
4. Nudge messages read naturally at alarm-set time: "Your battery is at 34% and not charging. Your alarm may not fire. Plug in now."

**What the spike doesn't cover (roadmap, not MVP):**
- Variable drain rates by time of day, app usage, screen state
- Historical learning from individual phone behavior
- Confidence intervals ("80% chance you'll have between 5-25%")

The simple model is accurate enough for the MVP. Smarter drain estimation is where the AI deepens over time.

Spike code: `spike/battery-prediction.js`

---

## What This Discussion Taught Us

1. The original architecture (phone detects problem → triggers backup) fails at the critical moment. Inverting it (backup always armed, phone disarms) is fundamentally more reliable.
2. Notifications are not alarms. The backup must trigger a real alarm that bypasses silent mode.
3. The cascade model (PagerDuty-style) with device + family layers handles the "what if the backup fails too?" question.
4. Location awareness filters the cascade to what's actually reachable.
5. All of that is the vision. The MVP is simpler: predict and nudge at alarm-set time. Ship the smallest thing that delivers value.
6. The prototype should feel like the alarm app, not a terminal. Context matters for the interview experience.
7. The prediction spike validates that the core logic works with a simple linear model. Smarter models are the roadmap.
