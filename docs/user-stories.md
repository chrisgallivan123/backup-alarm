# User Stories

## Feature: Backup Alarm — Battery Risk Prediction & Nudge (MVP)

**Context:** These stories represent the MVP release — a nudge at alarm-set time that predicts whether your battery will last until your alarm fires. See [ADR-002](adr/002-solution-approach.md) for the full solution approach and roadmap. See [ADR-005](adr/005-story-ownership.md) for why these stories are PM-authored and preserve user pain.

**Design Reference:** [Alarm Nudge Mockup](../spike/alarm-nudge-mockup.html) — validated with user interview (Jen, Persona 2).

**Prioritization Rationale:** See [ADR-003](adr/003-prioritization.md)

---

## Story 1: Battery Risk Prediction (P0 — Riskiest Assumption)

**As Chris** (Global Professional), **I want** the alarm system to predict whether my battery will last until my alarm fires, **so that** I find out my alarm is at risk before I fall asleep — not after I've already missed my EMEA call.

### End User Experience

When Chris enables his 5:00 AM alarm at 10:47 PM, the system silently evaluates whether his current battery level and drain rate will sustain the phone until the alarm fires. Chris doesn't see this calculation — he only sees the result if there's a problem. The intelligence is invisible.

### Capabilities

- Accept current battery level (percentage), drain rate (percent per hour), hours until alarm, and charging state as inputs
- Calculate predicted battery level at alarm time using a linear drain model
- Classify risk into three tiers: **safe** (no action needed), **warning** (alarm will probably fire but it's close), **critical** (alarm will likely not fire)
- Return the predicted battery percentage and risk classification

### Expectations

- If the phone is charging, the result is always **safe** regardless of current battery level
- If the predicted battery at alarm time is above 20%, the result is **safe**
- If the predicted battery is between 5% and 20%, the result is **warning**
- If the predicted battery is at or below 5%, the result is **critical** — the phone may shut down to protect the battery before the alarm fires
- The prediction errs on the side of caution: borderline cases are classified as higher risk, not lower (a false backup is annoying; a missed alarm is catastrophic)

### Value It Creates

Chris doesn't have to do mental math about whether 34% at 10:47 PM will last until 5:00 AM. The system does it for him. He gets a definitive answer at the moment he can still act — not a vague feeling of anxiety that keeps him checking his phone.

### Acceptance Criteria

```
GIVEN a battery level of 34%, drain rate of 8%/hr, alarm in 6 hours, not charging
WHEN the prediction runs
THEN the result is "critical" with predicted battery of 0%

GIVEN a battery level of 34%, drain rate of 8%/hr, alarm in 6 hours, charging
WHEN the prediction runs
THEN the result is "safe"

GIVEN a battery level of 80%, drain rate of 3%/hr, alarm in 8 hours, not charging
WHEN the prediction runs
THEN the result is "safe" with predicted battery of 56%

GIVEN a battery level of 55%, drain rate of 6%/hr, alarm in 7 hours, not charging
WHEN the prediction runs
THEN the result is "warning" with predicted battery of 13%

GIVEN a battery level of 45%, drain rate of 5%/hr, alarm in 8 hours, not charging
WHEN the prediction runs
THEN the result is "critical" with predicted battery of 5% (at threshold — err toward caution)
```

### Priority Rationale

**P0 — Riskiest assumption.** If the prediction doesn't work, nothing else in the feature matters. The nudge, the UI, the copy — all of it depends on the prediction being accurate. This is what we validate first.

---

## Story 2: Critical Battery Nudge (P1 — Core Value Delivery)

**As Jen** (Parent with non-negotiable mornings), **I want** to see a clear warning when I toggle on my competition alarm and my battery is predicted to die before it fires, **so that** I plug in my phone before going to sleep instead of discovering at 6 AM that it died and my kids missed their call time.

### End User Experience

Jen opens her alarm app at bedtime and toggles on "Competition Call Time — 5:30 AM." Immediately below the alarm, a nudge card slides in with a red left border. The headline reads: **"Estimated battery at alarm: 0%"** followed by **"Plug in now."** The message is short, direct, and impossible to miss. She plugs in her phone and goes to sleep confident the alarm will fire.

### Capabilities

- When an alarm is toggled on and the prediction result is **critical**, display a nudge card directly below that alarm
- The nudge shows the estimated battery percentage at alarm time as the primary headline
- The nudge shows a short, direct action: "Plug in now."
- The nudge uses visual severity cues: red accent, warning icon
- The nudge appears with a slide-in animation so it's noticeable but not jarring

### Expectations

- The nudge appears immediately when the alarm is toggled on — no delay
- The nudge is visually consistent with iOS notification patterns (per user feedback)
- The estimated battery percentage is the most prominent element (per user feedback: "the most important information was small and gray" — we fixed that)
- The nudge disappears when the alarm is toggled off
- If the alarm is already on when the app opens, the nudge is already visible

### Value It Creates

Jen validated this directly: *"For me, it would have. Because when I scheduled my EMEA call, if it popped this up, I would have plugged it in. I just wasn't looking at the number and realizing that by the time that call was, it's gonna die."*

The nudge converts invisible risk into visible action at the moment the user can still act.

### Acceptance Criteria

```
GIVEN an alarm with a "critical" prediction result
WHEN the user toggles the alarm on
THEN a nudge card appears below the alarm with:
  - A red left border
  - A warning icon and "Alarm at Risk" header
  - "Estimated battery at alarm: X%" as the headline
  - "Plug in now." as the action text

GIVEN an alarm with a visible critical nudge
WHEN the user toggles the alarm off
THEN the nudge disappears

GIVEN an alarm that is already on with a critical prediction
WHEN the user opens the alarm screen
THEN the nudge is already visible below the alarm
```

### Priority Rationale

**P1 — Core value delivery.** The prediction (Story 1) is useless without a visible nudge. This is the story that changes user behavior — the thing that makes Jen plug in her phone instead of going to sleep hoping for the best.

---

## Story 3: Safe State — No Nudge (P1 — Adoption Protection)

**As Thomas** (Three-Alarm Person), **I want** to see nothing different on my alarm screen when my battery will easily last until my alarm, **so that** the alarm app stays clean and I'm not trained to ignore warnings that show up every single night.

### End User Experience

Thomas opens his alarm app and toggles on his 7:00 AM alarm. His battery is at 80%, drain rate is low, and the alarm is 8 hours away. The prediction runs, classifies the risk as **safe**, and Thomas sees... nothing. Just his normal alarm, toggled on, with a green switch. No nudge, no warning, no extra UI. Exactly what he expects.

### Capabilities

- When an alarm is toggled on and the prediction result is **safe**, display no nudge
- The alarm screen looks and behaves identically to the standard alarm experience
- No visual indicator of the prediction running — the intelligence is completely invisible when not needed

### Expectations

- The alarm screen is visually clean when all alarms are safe
- There is no "all clear" message, green checkmark, or confirmation nudge — silence IS the signal
- Users who never have battery risk never know this feature exists until they need it

### Value It Creates

Thomas has been burned by noisy notification systems before — that's why he uses three alarms instead of trusting one smart system. If the nudge shows up every night regardless of actual risk, he'll disable it within a week. The feature earns trust by being silent when it should be silent. Restraint is a feature.

### Acceptance Criteria

```
GIVEN an alarm with a "safe" prediction result (e.g., 80% battery, 3%/hr drain, 8hrs)
WHEN the user toggles the alarm on
THEN no nudge appears — the alarm screen looks normal

GIVEN an alarm that previously showed a nudge (was critical, user toggled off)
WHEN conditions change (phone is now charging) and user toggles the alarm on
THEN no nudge appears — the stale warning is not shown

GIVEN multiple alarms where some are critical and one is safe
WHEN the user views the alarm screen
THEN only the at-risk alarms show nudges — the safe alarm has no nudge
```

### Priority Rationale

**P1 — Equally critical as Story 2.** A feature that always warns is a feature that gets ignored. Silence when safe is what earns the trust that makes the warning meaningful when it appears. This is the adoption protection story — without it, Thomas disables the feature and we've failed.

---

## Story 4: Warning Severity — Close But Survivable (P2 — Graduated Response)

**As Jen** (Parent), **I want** to see a softer warning when my battery will probably last but it's close, distinct from the hard warning when it won't, **so that** I can judge how urgent the situation is and make my own decision about whether to get up and plug in.

### End User Experience

Jen toggles on her alarm. Her battery is at 55% with 7 hours to go. The prediction says she'll have 13% at alarm time — enough for the alarm to fire, but close. A nudge card appears with an **orange** left border (not red). The headline reads: **"Estimated battery at alarm: 13%"** followed by **"Consider plugging in."** — a suggestion, not an imperative. Jen decides it's close enough and goes to sleep, or gets up to plug in. Her choice.

### Capabilities

- When an alarm is toggled on and the prediction result is **warning**, display a nudge card with distinct visual treatment from the critical nudge
- Orange accent instead of red
- "Low Battery Warning" header instead of "Alarm at Risk"
- "Consider plugging in." instead of "Plug in now."
- Same layout and position as the critical nudge for visual consistency

### Expectations

- The warning nudge is visually distinct from the critical nudge — the user can tell at a glance whether this is urgent or advisory
- The language is suggestive, not imperative — the user retains agency
- The warning still shows the estimated battery percentage as the headline
- The threshold between warning and critical is clear and consistent (warning: 6-20% predicted, critical: 0-5% predicted)

### Value It Creates

Not every low-battery situation is an emergency. Jen at 55% with 7 hours to go will probably make it. Treating that the same as Chris at 34% with 6 hours to go (who won't make it) creates alarm fatigue. The graduated response preserves the urgency of the critical warning by not overusing it.

### Acceptance Criteria

```
GIVEN an alarm with a "warning" prediction result (e.g., 55% battery, 6%/hr drain, 7hrs)
WHEN the user toggles the alarm on
THEN a nudge card appears with:
  - An orange left border (not red)
  - A warning icon and "Low Battery Warning" header
  - "Estimated battery at alarm: 13%" as the headline
  - "Consider plugging in." as the action text

GIVEN a critical prediction (0% predicted) and a warning prediction (13% predicted)
WHEN both alarms are toggled on
THEN the critical alarm shows a red nudge and the warning alarm shows an orange nudge
  - The visual distinction is immediately apparent
```

### Priority Rationale

**P2 — Polish.** The core value is delivered with just critical warnings (Stories 1-3). Graduated severity improves the experience and reduces alarm fatigue, but the feature works without it. If we had to cut scope, this is what we'd cut — and we'd have a clear answer for "what would you cut?" in the interview.

---

## Story Map

| Priority | Story | Persona | What It Proves |
|----------|-------|---------|----------------|
| P0 | Battery Risk Prediction | Chris | Can we predict battery death accurately? |
| P1 | Critical Battery Nudge | Jen | Does the nudge change behavior? (Validated: yes) |
| P1 | Safe State — No Nudge | Thomas | Does restraint earn trust? |
| P2 | Warning Severity | Jen | Does graduated response reduce alarm fatigue? |

## Future Stories (Roadmap — Not This Release)

These emerged from the solution approach discussion (ADR-002) and user interview. They are documented as future direction, not current scope.

- **Background battery re-check** — periodic overnight monitoring with a second nudge if battery drops faster than predicted
- **Cross-device backup alarm** — cascade alarm to Watch, HomePod, iPad when phone is at risk
- **Family cascade with acknowledgment** — PagerDuty-style escalation through Family Sharing contacts (suggested unprompted by Jen during user interview)
- **Location-aware cascade filtering** — reorder backup devices based on whether user is home or traveling
- **HomeKit integration** — lights on, blinds open as non-audio alarm alternatives
