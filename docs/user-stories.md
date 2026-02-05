# User Stories

This document contains user stories for two MVP features that work together to ensure alarms never fail silently:

1. **Battery Risk Prediction & Nudge** — Warn users at alarm-set time if their battery won't last
2. **Cross-Device Backup Cascade** — Fire backup alarms on other devices if the phone fails

Both features were validated with user interviews (Jen, Persona 2).

---

## Feature: Battery Risk Prediction & Nudge (MVP)

**Context:** These stories represent the MVP release — a nudge at alarm-set time that predicts whether your battery will last until your alarm fires. See [ADR-002](decisions/ADR-002-solution-approach.md) for the full solution approach and roadmap. See [PDR-005](decisions/PDR-005-story-ownership.md) for why these stories are PM-authored and preserve user pain.

**Design Reference:** [Alarm Nudge Mockup](../spike/alarm-nudge-mockup.html) — validated with user interview (Jen, Persona 2).

**Prioritization Rationale:** See [PDR-003](decisions/PDR-003-prioritization.md)

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

Jen validated this directly: *"For me, it would have. Because when I scheduled my alarm, if it popped this up, I would have plugged it in. I just wasn't looking at the number and realizing that by the time that alarm was, it's gonna die."*

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

---

# Feature: Backup Alarm — Cross-Device Cascade (MVP)

**Context:** These stories complete the MVP by adding a safety net when the nudge isn't enough. Even if you plug in your phone, it could die from a faulty cable, power outage, or software crash. The backup cascade ensures the alarm reaches you through another device.

**Design Reference:** [Backup Configuration Mockup](../spike/backup-config-mockup.html) — validated with user interview (Jen, Persona 2).

**Architecture Reference:** [Backup Architecture Diagram](../spike/backup-architecture.html) — explains the inverted model.

**Prioritization Rationale:** These stories are P1 — they complete the safety net. The nudge prevents most failures; the backup catches the rest.

---

## Story 5: Backup Alarm Configuration (P1 — Foundation)

**As Chris** (Global Professional), **I want** to configure which devices and people should receive my alarm if my phone can't fire it, **so that** I have a safety net even when my phone fails unexpectedly.

### End User Experience

Chris edits his 5:00 AM EMEA Standup alarm and sees a new "Backup" section. He toggles on "Backup Alarm" and sees a list where he can add his Apple Watch, bedroom HomePod, and Jen as backups. He drags to reorder them. At the bottom, a timing preview shows exactly when each backup would fire if his phone doesn't respond.

### Capabilities

- Toggle to enable/disable backup for any alarm
- Add devices from iCloud-connected devices (Watch, HomePod, iPad, Mac)
- Add people from Family Sharing contacts
- Add phone numbers (landlines, hotels) with automated voice message
- Reorder backups by dragging
- Show timing preview: when each backup fires if previous doesn't respond

### Expectations

- Backup list shows only backup devices, not the primary phone
- Timing starts 2 minutes after alarm time (phone gets first chance)
- Each subsequent backup fires 2 minutes after the previous
- Phone numbers format automatically: (555) 123-4567
- "Call Phone Number" option is always available (can add multiple)
- User can delete any backup by tapping and confirming

### Value It Creates

Chris doesn't have to wonder "what if my phone dies anyway?" He has a clear, visible safety net. He knows exactly what will happen and when. The anxiety of the unknown is replaced by confidence in the system.

### Acceptance Criteria

```
GIVEN an alarm in edit mode
WHEN the user views the Backup section
THEN they see a toggle for "Backup Alarm" (default off)

GIVEN Backup Alarm is enabled
WHEN the user taps "Add Backup"
THEN they see available devices (Watch, HomePod, iPad) and Family Sharing contacts

GIVEN a backup list with Watch, HomePod, Jen
WHEN the user views the timing preview for a 5:00 AM alarm
THEN they see:
  - 5:02 — Alarm on Apple Watch
  - 5:04 — Alarm on HomePod
  - 5:06 — Alarm on Jen's iPhone

GIVEN the user enters phone number "5551234567"
WHEN the number is added to the backup list
THEN it displays as "(555) 123-4567" with sublabel "Calls with automated backup message"
```

### Priority Rationale

**P1 — Foundation.** Without configuration, there's no backup. This is the entry point for the entire backup feature.

---

## Story 6: Backup Alarm Trigger (P1 — Core Safety Net)

**As Jen** (Parent with non-negotiable mornings), **I want** my backup devices to automatically fire an alarm if my phone doesn't respond at alarm time, **so that** a dead phone, crashed app, or failed cable doesn't mean my kids miss their competition.

### End User Experience

Jen sets her 5:30 AM alarm with backup enabled (Watch → HomePod → Chris). She goes to sleep. At 5:30, her phone is dead (cable was loose). She doesn't know this. At 5:32, her Apple Watch buzzes with a real alarm — not a notification, a full alarm that bypasses silent mode. She wakes up, taps Stop, and the backup cascade resolves. HomePod and Chris never fire.

### Capabilities

- When phone doesn't respond at alarm time, fire backup on first device in list after 2 minutes
- Backup is a real alarm (bypasses Do Not Disturb and silent mode)
- If user taps Stop, send signal to iCloud to resolve cascade — they're awake
- If user taps Snooze, pause cascade for 9 minutes, then same device fires again
- If no response within 2 minutes, escalate to next backup in list

### Expectations

- Phone gets first chance to fire alarm (backups start at alarm+2min)
- Cloud waits for Stop signal, not just "alarm fired" — user must interact
- Snooze pauses the cascade, doesn't resolve it — user can snooze unlimited times (per Jen's feedback: don't change iOS snooze behavior)
- After snooze ends (9 min), the same device fires again; only silence after THAT triggers escalation
- Only Stop resolves the cascade — snooze means "I heard it, give me 9 more minutes"
- Escalation continues until someone taps Stop or list is exhausted
- If cascade exhausts without response, all configured targets have been tried

### Value It Creates

Jen validated this: *"If I had you set up here, wherever, at home, and you got it, you could always call me somehow."* The backup converts phone failure from catastrophic to recoverable. Someone will wake up.

### Acceptance Criteria

```
GIVEN a 5:30 AM alarm with backup: Watch → HomePod → Chris
AND the phone is dead/unresponsive at 5:30
WHEN 5:32 arrives with no Stop signal from phone
THEN the Apple Watch fires a real alarm

GIVEN the Watch alarm is firing
WHEN Jen taps Stop
THEN iCloud receives the signal and cascade is resolved
AND HomePod and Chris never receive the alarm

GIVEN the Watch alarm is firing
WHEN Jen taps Snooze
THEN cascade pauses for 9 minutes
AND after 9 minutes, the Watch fires again
AND only if no response to THAT alarm does HomePod fire

GIVEN the Watch alarm is firing
WHEN no response is received by 5:34
THEN HomePod fires
AND cascade continues until someone taps Stop
```

### Priority Rationale

**P1 — Core safety net.** Configuration without triggering is useless. This is the story that actually catches failures.

---

## Story 7: Phone Call Backup (P1 — Edge Case Coverage)

**As Chris** (Global Professional traveling for work), **I want** to add a phone number as a backup that receives an automated call, **so that** even without my Apple devices, someone can wake me up.

### End User Experience

Chris is traveling to a client site. He's staying at a hotel. He adds the hotel's front desk number as his last backup: Watch → Jen → (555) 123-4567. If everything else fails, the hotel gets an automated call: *"This is an automated backup alarm from Chris's iPhone. Please contact the guest in room 412."*

### Capabilities

- Add any phone number as a backup target
- Format phone numbers automatically for readability
- When triggered, place automated voice call to the number
- Play standard message explaining this is a backup alarm
- Timing preview shows "Call (555) 123-4567" for phone entries

### Expectations

- Phone call works even if recipient has Do Not Disturb (rings through as repeated call)
- Message is clear and actionable: identifies the source and purpose
- Phone numbers can be added multiple times (different numbers)
- Works with landlines, hotel phones, office phones — not just mobile

### Value It Creates

Chris travels frequently. He can't always count on having his Watch charged or Jen being awake. A phone call to a landline is the ultimate fallback — it works even when all smart devices fail.

### Acceptance Criteria

```
GIVEN a backup list with phone number (555) 123-4567
WHEN that backup is triggered
THEN an automated call is placed to the number
AND the call plays: "This is an automated backup alarm from [User]'s iPhone."

GIVEN the user adds phone number "5551234567"
WHEN viewing the backup list
THEN it displays as "(555) 123-4567"
AND sublabel shows "Calls with automated backup message"

GIVEN the timing preview with phone number as last backup
WHEN viewing the preview for a 5:00 AM alarm
THEN the entry shows "Call (555) 123-4567" (not "Alarm on")
```

### Priority Rationale

**P1 — Edge case coverage.** Completes the safety net for users who travel or don't have multiple Apple devices. Suggested by Jen during validation.

---

## Updated Story Map

| Priority | Story | Persona | What It Proves |
|----------|-------|---------|----------------|
| P0 | Battery Risk Prediction | Chris | Can we predict battery death accurately? |
| P1 | Critical Battery Nudge | Jen | Does the nudge change behavior? (Validated: yes) |
| P1 | Safe State — No Nudge | Thomas | Does restraint earn trust? |
| P1 | Backup Alarm Configuration | Chris | Can users set up a safety net? |
| P1 | Backup Alarm Trigger | Jen | Does the backup actually catch failures? |
| P1 | Phone Call Backup | Chris | Does it work for travelers without devices? |
| P2 | Warning Severity | Jen | Does graduated response reduce alarm fatigue? |

---

## Future Stories (Roadmap — Not This Release)

These emerged from the solution approach discussion (ADR-002) and user interview. They are documented as future direction, not current scope.

- **Background battery re-check** — periodic overnight monitoring with a second nudge if battery drops faster than predicted
- **Location-aware cascade optimization** — smart reordering based on which devices are likely near the user
- **HomeKit integration** — lights on, blinds open as non-audio alarm alternatives
- **Custom voice message** — let users record a personal message for phone call backups
