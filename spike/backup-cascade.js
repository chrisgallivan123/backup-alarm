/**
 * Spike: Backup Alarm — Inverted Model with Ordered Escalation
 *
 * Question: Can we simulate the inverted backup model where the cloud
 * always holds the alarm and the phone disarms it by checking in?
 *
 * KEY INSIGHT: One reliable backup, with escalation if that fails.
 * - User configures an ordered backup list (not a backup "set")
 * - First online device in the list fires at alarm time
 * - If no Stop → next device fires (2 min later)
 * - Family is the final escalation tier
 * - No symphony — just one alarm at a time
 *
 * This is throwaway code to validate the backup logic.
 */

function createBackupAlarm({ alarmTime, alarmLabel, cascade }) {
  return {
    alarmTime,
    alarmLabel,
    cascade, // ordered list of backup targets
    status: 'armed', // armed | disarmed | triggered | stopped
    registeredAt: Date.now(),
    lastCheckIn: null,
    triggeredTarget: null,
    resolvedBy: null,
  };
}

function phoneCheckIn(backup) {
  // Phone says "I'm alive, don't fire the backup"
  return {
    ...backup,
    lastCheckIn: Date.now(),
    status: 'armed', // still armed, but we know the phone is alive
  };
}

function phoneDisarm(backup) {
  // Phone's alarm fired successfully — cancel the backup
  return {
    ...backup,
    status: 'disarmed',
  };
}

/**
 * Simulate phone sending Stop signal with retries (handles spotty network).
 * Returns { success, attempts, finalStatus }
 */
function phoneStopWithRetry({ networkAvailable, maxRetries = 5, retryDelayMs = 10000 }) {
  // Phone keeps trying to send Stop signal until it gets through
  // Most network issues are transient — retries usually succeed

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (networkAvailable(attempt)) {
      return {
        success: true,
        attempts: attempt,
        finalStatus: 'Stop signal delivered to cloud',
      };
    }
    // In real implementation: wait retryDelayMs before next attempt
  }

  return {
    success: false,
    attempts: maxRetries,
    finalStatus: 'Stop signal failed after all retries — cascade may fire',
  };
}

/**
 * Cloud grace period logic — wait before assuming phone is dead.
 * If phone was healthy recently, give extra time for Stop signal to arrive.
 */
function shouldTriggerCascade(backup, {
  currentTime,
  alarmTimeMs,
  lastCheckInMs,
  gracePeriodMs = 60000,  // 60 seconds grace after alarm time
  checkInIntervalMs = 300000  // 5 minutes normal check-in interval
}) {
  const timeSinceAlarm = currentTime - alarmTimeMs;
  const timeSinceCheckIn = currentTime - lastCheckInMs;

  // Phone was checking in normally before alarm time
  const phoneWasHealthy = timeSinceCheckIn < checkInIntervalMs * 2;

  // Still within grace period after alarm
  const withinGracePeriod = timeSinceAlarm < gracePeriodMs;

  if (phoneWasHealthy && withinGracePeriod) {
    return {
      trigger: false,
      reason: `Phone was healthy. Grace period: ${gracePeriodMs / 1000}s. Waiting for Stop signal.`,
    };
  }

  if (!phoneWasHealthy) {
    return {
      trigger: true,
      reason: 'Phone missed check-ins before alarm time. Triggering cascade.',
    };
  }

  // Grace period expired, no Stop signal received
  return {
    trigger: true,
    reason: 'Grace period expired. No Stop signal received. Triggering cascade.',
  };
}

function detectMissedCheckIn(backup, { currentTime, checkInIntervalMs, alarmTimeMs }) {
  // Cloud logic: has the phone missed its check-in window?
  if (backup.status !== 'armed') return { missed: false, reason: 'not armed' };

  const timeSinceCheckIn = backup.lastCheckIn
    ? currentTime - backup.lastCheckIn
    : currentTime - backup.registeredAt;

  const alarmIsSoon = (alarmTimeMs - currentTime) < checkInIntervalMs * 2;
  const checkInOverdue = timeSinceCheckIn > checkInIntervalMs * 1.5;

  if (checkInOverdue && alarmIsSoon) {
    return { missed: true, reason: 'Phone silent and alarm is imminent' };
  }
  if (checkInOverdue) {
    return { missed: true, reason: 'Phone missed check-in window' };
  }
  return { missed: false, reason: 'Phone checked in recently' };
}

/**
 * User response to a backup alarm (matches iOS alarm UI):
 *   'stop'     — "I'm awake." (X button) Cascade stops. Resolved.
 *   'snooze'   — "I heard it, few more minutes." Cascade pauses.
 *                Snooze works like normal iOS — no limit.
 *                If user is snoozing, the alarm is working. No escalation.
 *   null       — No interaction. Escalate after window.
 *
 * KEY INSIGHT (from Jen's feedback): Snooze = response. The alarm worked.
 *   - Don't limit snoozes — that changes iOS behavior users expect
 *   - Backup only triggers on SILENCE (no response at all)
 *   - If someone is snoozing, they heard the alarm. Success.
 *
 * KEY CHANGE: One alarm at a time (no symphony)
 *   - Backup list is an ORDERED list, not a "fire all" set
 *   - First online backup fires 2 min after alarm time (phone gets first chance)
 *   - Only escalate to next device if no response received
 *   - Escalation window: 2 minutes between devices
 */
function triggerCascade(backup, { escalationWindowMs = 120000, snoozeDurationMs = 540000 }) {
  const results = [];

  for (const target of backup.cascade) {
    const result = {
      target: target.name,
      type: target.type, // 'device' or 'person'
      online: target.online, // can iCloud reach this device right now?
      alarmFired: false,
      response: null, // 'stop' | 'snooze' | null
      escalated: false,
    };

    // Skip targets iCloud can't reach (offline, no network)
    // Note: "reachable" means iCloud can ping the device, NOT that the user is near it.
    // A HomePod at home is reachable even if the user is in a hotel — it fires in an
    // empty room, which is harmless. First Stop signal from ANY device resolves the cascade.
    if (!target.online) {
      result.escalated = true;
      result.skipReason = 'Offline — iCloud cannot reach device';
      results.push(result);
      continue;
    }

    // Fire alarm on this target
    result.alarmFired = true;
    result.response = target.response; // 'dismiss', 'snooze', or null

    // STOP (X) — user is awake, cascade resolved
    if (target.response === 'stop') {
      results.push(result);
      return {
        ...backup,
        status: 'stopped',
        triggeredTarget: target.name,
        resolvedBy: target.name,
        cascadeLog: results,
      };
    }

    // SNOOZE — user heard it! The alarm worked.
    // Snooze = response. No escalation needed. Cascade resolved.
    // (Per Jen's feedback: don't change iOS snooze behavior, don't limit snoozes)
    if (target.response === 'snooze') {
      result.snoozeResult = 'alarm worked — user is snoozing';
      results.push(result);
      return {
        ...backup,
        status: 'stopped',
        triggeredTarget: target.name,
        resolvedBy: target.name,
        resolveReason: 'User snoozed — alarm was received',
        cascadeLog: results,
      };
    }

    // NO RESPONSE — escalate after escalation window
    result.escalated = true;
    result.escalateReason = `No response within ${escalationWindowMs / 1000}s`;
    results.push(result);
  }

  // Exhausted cascade — nobody stopped
  return {
    ...backup,
    status: 'triggered',
    triggeredTarget: 'ALL (exhausted)',
    resolvedBy: null,
    cascadeLog: results,
  };
}

// --- Helper to print cascade results ---
function printResult(result) {
  console.log(`Status: ${result.status}`);
  console.log(`Resolved by: ${result.resolvedBy || 'NOBODY — cascade exhausted'}`);
  if (result.resolveReason) console.log(`Reason: ${result.resolveReason}`);
  console.log('Cascade log:');
  result.cascadeLog.forEach(r => {
    let status;
    if (r.response === 'stop') {
      status = 'STOPPED (awake)';
    } else if (r.response === 'snooze') {
      status = `SNOOZED → ${r.snoozeResult || 'alarm worked'}`;
    } else if (r.escalated && r.skipReason) {
      status = `SKIPPED (${r.skipReason})`;
    } else if (r.escalated) {
      status = `ESCALATED (${r.escalateReason})`;
    } else {
      status = 'FIRED';
    }
    console.log(`  ${r.target} [${r.type}] → ${status}`);
  });
}

// --- Run Scenarios ---

console.log('=== Backup Alarm Cascade Spike ===\n');
console.log('KEY: One alarm at a time. User configures backup ORDER, not backup SET.');
console.log('First online device fires at alarm time. Escalate only if no Stop.\n');

// Scenario 0: Timing demonstration — one alarm at a time
console.log('--- Scenario 0: Timing flow (example: 6:30 AM alarm) ---');
console.log('User\'s backup order: Watch → HomePod → Jen\'s iPhone');
console.log('');
console.log('  6:30 AM — Watch fires (first online device in list)');
console.log('  6:32 AM — If no Stop: HomePod fires');
console.log('  6:34 AM — If no Stop: Jen\'s iPhone fires');
console.log('');
console.log('No symphony. One alarm. Escalate only on silence.\n');

// Scenario 1: Chris at home, phone dies, stops Watch alarm
console.log('--- Scenario 1: Chris at home, phone dies, stops Watch alarm ---');
console.log('Backup order: Watch → HomePod → Jen\'s iPhone');
console.log('6:30 — Watch fires → Chris taps Stop → resolved\n');

let result1 = triggerCascade(
  createBackupAlarm({
    alarmTime: '5:00 AM',
    alarmLabel: 'EMEA Standup',
    cascade: [
      { name: 'Chris\'s Apple Watch', type: 'device', online: true, response: 'stop' },
      { name: 'HomePod (Bedroom)', type: 'device', online: true, response: null },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000, snoozeWindowMs: 300000 }
);
printResult(result1);

// Scenario 2: Chris traveling — all devices online, HomePod fires in empty room, Watch catches it
console.log('\n--- Scenario 2: Chris traveling (hotel), phone dies ---');
console.log('All devices online. HomePod fires in empty room (harmless). Watch wakes Chris.\n');

let result2 = triggerCascade(
  createBackupAlarm({
    alarmTime: '5:00 AM',
    alarmLabel: 'EMEA Standup',
    cascade: [
      { name: 'HomePod (Bedroom)', type: 'device', online: true, response: null },
      { name: 'Chris\'s Apple Watch', type: 'device', online: true, response: 'stop' },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000, snoozeWindowMs: 300000 }
);
printResult(result2);

// Scenario 3: Naiyah's phone dies, sleeps through Watch, escalates to Jen
console.log('\n--- Scenario 3: Naiyah\'s phone dies, sleeps through Watch ---');
console.log('Cascade: Naiyah\'s Watch (no response) → Jen\'s iPhone (stop)\n');

let result3 = triggerCascade(
  createBackupAlarm({
    alarmTime: '6:15 AM',
    alarmLabel: 'Duet — Don\'t Let Riley Down',
    cascade: [
      { name: 'Naiyah\'s Apple Watch', type: 'device', online: true, response: null },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000, snoozeWindowMs: 300000 }
);
printResult(result3);

// Scenario 4: Phone checks in successfully — backup never fires
console.log('\n--- Scenario 4: Chris\'s phone is fine, alarm fires normally ---');
console.log('Phone checks in → backup disarmed → no cascade\n');

let backup4 = createBackupAlarm({
  alarmTime: '5:00 AM',
  alarmLabel: 'EMEA Standup',
  cascade: [
    { name: 'Chris\'s Apple Watch', type: 'device', online: true, response: 'stop' },
  ],
});
backup4 = phoneCheckIn(backup4);
console.log(`After check-in: status = ${backup4.status}`);
backup4 = phoneDisarm(backup4);
console.log(`After alarm fires: status = ${backup4.status}`);
console.log('Cascade triggered: NO — phone handled it');

// Scenario 5: Nobody responds — cascade exhausted
console.log('\n--- Scenario 5: Everyone\'s asleep, nobody responds ---');
console.log('Cascade: Watch (no response) → HomePod (no response) → Jen (no response)\n');

let result5 = triggerCascade(
  createBackupAlarm({
    alarmTime: '5:00 AM',
    alarmLabel: 'EMEA Standup',
    cascade: [
      { name: 'Chris\'s Apple Watch', type: 'device', online: true, response: null },
      { name: 'HomePod (Bedroom)', type: 'device', online: true, response: null },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: null },
    ],
  }),
  { escalationWindowMs: 120000, snoozeWindowMs: 300000 }
);
printResult(result5);

// Scenario 6: Chris snoozes Watch — cascade resolved (snooze = response)
console.log('\n--- Scenario 6: Chris snoozes — alarm worked! ---');
console.log('Watch fires → Chris snoozes → Cascade resolved. Snooze IS a response.\n');
console.log('(Per Jen: don\'t change iOS snooze behavior. If they\'re snoozing, alarm worked.)\n');

let result6 = triggerCascade(
  createBackupAlarm({
    alarmTime: '5:00 AM',
    alarmLabel: 'EMEA Standup',
    cascade: [
      { name: 'Chris\'s Apple Watch', type: 'device', online: true, response: 'snooze' },
      { name: 'HomePod (Bedroom)', type: 'device', online: true, response: null },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000 }
);
printResult(result6);

// Scenario 7: Naiyah snoozes — cascade resolved
console.log('\n--- Scenario 7: Naiyah snoozes — alarm worked! ---');
console.log('Watch fires → Naiyah snoozes → No escalation to Jen. Alarm was received.\n');

let result7 = triggerCascade(
  createBackupAlarm({
    alarmTime: '6:15 AM',
    alarmLabel: 'Duet — Don\'t Let Riley Down',
    cascade: [
      { name: 'Naiyah\'s Apple Watch', type: 'device', online: true, response: 'snooze' },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000 }
);
printResult(result7);

// Scenario 10: Watch is offline (no WiFi, no cellular) — skipped
console.log('\n--- Scenario 10: Watch has no connectivity (offline) ---');
console.log('Watch offline → skipped → HomePod fires → Chris stops HomePod\n');

let result10 = triggerCascade(
  createBackupAlarm({
    alarmTime: '5:00 AM',
    alarmLabel: 'EMEA Standup',
    cascade: [
      { name: 'Chris\'s Apple Watch', type: 'device', online: false, response: null },
      { name: 'HomePod (Bedroom)', type: 'device', online: true, response: 'stop' },
      { name: 'Jen\'s iPhone', type: 'person', online: true, response: 'stop' },
    ],
  }),
  { escalationWindowMs: 120000 }
);
printResult(result10);

// --- Spotty Network Scenarios ---

console.log('\n=== Spotty Network Handling ===\n');

// Scenario 11: Network blip — Stop signal succeeds on retry
console.log('--- Scenario 11: Spotty network, Stop succeeds on 3rd retry ---');
console.log('Phone alarm fires → user taps Stop → network fails → retry → retry → success\n');

let retry11 = phoneStopWithRetry({
  networkAvailable: (attempt) => attempt >= 3,  // Network comes back on 3rd attempt
  maxRetries: 5,
});
console.log(`Stop signal delivered: ${retry11.success}`);
console.log(`Attempts needed: ${retry11.attempts}`);
console.log(`Status: ${retry11.finalStatus}`);
console.log('Cascade triggered: NO — Stop signal got through before grace period expired');

// Scenario 12: Network down — Stop signal fails all retries
console.log('\n--- Scenario 12: Network completely down, Stop fails ---');
console.log('Phone alarm fires → user taps Stop → network down → all retries fail\n');

let retry12 = phoneStopWithRetry({
  networkAvailable: () => false,  // Network never comes back
  maxRetries: 5,
});
console.log(`Stop signal delivered: ${retry12.success}`);
console.log(`Attempts needed: ${retry12.attempts}`);
console.log(`Status: ${retry12.finalStatus}`);
console.log('Cascade triggered: YES — but user is already awake. False positive (annoying, not catastrophic).');

// Scenario 13: Grace period — phone was healthy, cloud waits
console.log('\n--- Scenario 13: Grace period — phone was healthy, cloud waits ---');
console.log('Phone checked in 2 min ago. Alarm fires. Cloud waits 60s for Stop signal.\n');

const now = Date.now();
let grace13 = shouldTriggerCascade(null, {
  currentTime: now + 30000,  // 30 seconds after alarm
  alarmTimeMs: now,
  lastCheckInMs: now - 120000,  // Last check-in was 2 min before alarm
  gracePeriodMs: 60000,
  checkInIntervalMs: 300000,
});
console.log(`Trigger cascade: ${grace13.trigger}`);
console.log(`Reason: ${grace13.reason}`);

// Scenario 14: Grace period expired — no Stop signal
console.log('\n--- Scenario 14: Grace period expired, no Stop signal ---');
console.log('Phone checked in 2 min ago. Alarm fires. 90 seconds pass. No Stop. Cascade triggers.\n');

let grace14 = shouldTriggerCascade(null, {
  currentTime: now + 90000,  // 90 seconds after alarm (past 60s grace)
  alarmTimeMs: now,
  lastCheckInMs: now - 120000,  // Last check-in was 2 min before alarm
  gracePeriodMs: 60000,
  checkInIntervalMs: 300000,
});
console.log(`Trigger cascade: ${grace14.trigger}`);
console.log(`Reason: ${grace14.reason}`);

// Scenario 15: Phone was already unhealthy — no grace period
console.log('\n--- Scenario 15: Phone was unhealthy before alarm — no grace ---');
console.log('Phone last checked in 15 min ago. Alarm fires. Cascade triggers immediately.\n');

let grace15 = shouldTriggerCascade(null, {
  currentTime: now + 5000,  // 5 seconds after alarm
  alarmTimeMs: now,
  lastCheckInMs: now - 900000,  // Last check-in was 15 min ago (missed several)
  gracePeriodMs: 60000,
  checkInIntervalMs: 300000,
});
console.log(`Trigger cascade: ${grace15.trigger}`);
console.log(`Reason: ${grace15.reason}`);
