# Personas & Problem Definition

## The Problem

When you set an alarm before bed, you're making a trust contract with your phone: "Wake me up at this time." But phones die. Batteries drain overnight. Software crashes silently. And when the alarm doesn't fire, the consequences aren't minor — they're catastrophic and invisible until it's too late.

The alarm clock's job isn't just to ring. It's to deliver **peace of mind at bedtime**. When you set it and put the phone down, you need to trust it. Today, that trust is broken for anyone who depends on their phone for high-stakes wake-ups.

**The failure mode is uniquely cruel:** you don't know the alarm failed until you wake up late. There's no warning, no fallback, no second chance. The system fails silently at the worst possible moment.

---

## Persona 1: The Global Professional — Chris

**Context:** Works across time zones. Has 6:00 AM calls with EMEA teams two or three times a week. Occasionally has early flights for client work.

**Behavior:**
- Sets the alarm the night before, plugs in the phone, goes to sleep
- Sometimes the phone doesn't charge properly — cable slips, outlet isn't working, phone gets knocked off the nightstand
- Has overslept for an EMEA call after the phone died overnight. Woke up at 7:15 to missed messages and a meeting that happened without him
- Now sets a backup alarm on an old iPad, but it's unreliable and he forgets to charge that too

**Pain:**
- The missed meeting wasn't just embarrassing — it damaged trust with his EMEA counterpart who had stayed late for the call
- The anxiety starts at bedtime: "Is it plugged in? Is it actually charging? Should I set another alarm somewhere else?"
- Has developed a ritual of checking the charge percentage before bed, but that doesn't prevent 3 AM drain from a rogue app

**Stakes:** Professional reputation. Relationship trust with global colleagues. Career impact from being seen as unreliable.

**What he needs:** Confidence at bedtime that even if the phone dies, the alarm still happens.

---

## Persona 2: The Parent With Non-Negotiable Mornings — Jen

**Context:** Parent of two kids in competitive dance. Weekends involve early call times — competitions at 6 AM, rehearsals, tournament check-ins. These aren't flexible.

**Behavior:**
- Sets multiple alarms the night before: 5:00, 5:15, 5:30
- The phone sits on the nightstand, sometimes plugged in, sometimes not
- Manages the family calendar — if she oversleeps, the whole family's schedule collapses
- Has woken up late once and had to drive 80 mph to make a call time. The stress was worse than the lateness.

**Pain:**
- Missing a call time means the kid doesn't compete. There's no "join late" in competition dance.
- The responsibility falls entirely on her — she's the alarm-setter, the schedule-keeper, the safety net
- Paradoxically, the anxiety about missing the alarm makes it harder to fall asleep, which makes her more likely to sleep through it

**Stakes:** Her kids' participation in things they've worked months to prepare for. Family trust that "Mom has it handled." Her own sense of reliability.

**What she needs:** A guarantee that even if her phone fails, someone or something else picks up the alarm.

---

## Persona 3: The Three-Alarm Person — Thomas

**Context:** Has been burned before — multiple times. Now compensates with redundancy: phone alarm, smart speaker, and an old-school alarm clock on the dresser.

**Behavior:**
- Sets three alarms across two or three devices every single night
- The morning routine involves silencing multiple alarms in sequence, which is annoying but "worth it"
- Has researched battery-backup alarm clocks on Amazon
- Keeps the phone plugged in with a specific cable that "works" and gets anxious when traveling without it

**Pain:**
- The compensation strategy works, but it's exhausting and fragile. Each additional device is another thing to remember, charge, and configure.
- Traveling is the worst — hotel outlets are in weird places, the smart speaker isn't there, and the old alarm clock stays home
- Has accepted this as "just how it is" but resents that a $1,200 phone can't reliably do the one job an alarm clock has done since 1876

**Stakes:** Sleep quality. Daily cognitive load spent on alarm logistics. The quiet frustration of an unsolved problem.

**What Thomas needs:** One alarm that's reliable enough to replace three. Intelligence that handles the failure scenarios so he doesn't have to.

---

## Persona 4: The Kid Who Can't Afford to Be Late — Naiyah

**Context:** Competitive dancer, 13 years old. Has a duet at the next competition — her partner is counting on her. Call time is 6:15 AM. She can't be late without letting someone else down.

**Behavior:**
- Sets her own alarm on her phone because she wants to be responsible
- Doesn't always plug in her phone at night — sometimes falls asleep watching videos and the battery drains
- Worries the night before a competition: "What if my alarm doesn't go off? What if Mom doesn't hear hers either?"
- Has asked her mom to set a backup alarm "just in case" — but that defeats the point of being responsible

**Pain:**
- The anxiety isn't about waking up — it's about letting her duet partner down. If Naiyah is late, her partner can't compete either.
- She wants independence ("I can handle my own alarm") but the stakes are too high for a 13-year-old to carry alone
- The fear of oversleeping the night before a competition affects her sleep, which affects her performance

**Stakes:** Her partner's competition. The trust between dance partners. Her sense of independence and reliability. The emotional weight of knowing someone else is depending on her alarm.

**What Naiyah needs:** A safety net she doesn't have to think about. Something that backs up her alarm without her having to ask her mom — so she can be independent AND reliable.

---

## Problem Statement (Refined)

People who depend on their phone alarm for high-stakes wake-ups have no safety net when the phone fails. The alarm clock — the most basic function on a smartphone — offers zero protection against the most common failure mode: the phone dying overnight.

Current workarounds (multiple alarms, multiple devices, charging rituals) are fragile, add cognitive load, and still fail when circumstances change (travel, unexpected battery drain, charger issues). For families, the failure cascades — one person's dead phone becomes everyone's missed morning.

**The gap:** There is no system that detects when an alarm is at risk of not firing and routes a backup notification to another device before it's too late. The technology to predict battery failure and send cross-device notifications exists — it's just not connected to the alarm clock.

**The opportunity:** A backup system that predicts battery risk at alarm-set time and routes the alarm through alternate devices if the phone fails. The technology is simple — battery math and cloud coordination — but the pieces have never been connected to the alarm clock. The solution doesn't require AI; it requires Apple to use what they already have: iCloud, device awareness, and Family Sharing.
