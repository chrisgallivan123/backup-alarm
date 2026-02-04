/**
 * Spike: Battery Prediction for Alarm Risk Assessment
 *
 * Question: Given current battery state and an alarm time,
 * can we predict whether the phone will die before the alarm fires?
 *
 * This is throwaway code to validate the core logic.
 */

function predictAlarmRisk({ batteryLevel, drainRatePerHour, hoursUntilAlarm, isCharging }) {
  // If charging, alarm is safe — battery is going up, not down
  if (isCharging) {
    return {
      riskLevel: 'safe',
      predictedBattery: Math.min(100, batteryLevel + (hoursUntilAlarm * 20)), // ~20%/hr charge rate
      willSurvive: true,
      nudge: null,
    };
  }

  const predictedBattery = batteryLevel - (drainRatePerHour * hoursUntilAlarm);

  // Thresholds:
  // - Phone dies at 0% (obviously)
  // - Below 5% the phone may shut down to protect the battery
  // - We want a margin of safety — err on the side of backup
  const CRITICAL_THRESHOLD = 5;
  const WARNING_THRESHOLD = 20;

  let riskLevel;
  let nudge;

  if (predictedBattery <= CRITICAL_THRESHOLD) {
    riskLevel = 'critical';
    nudge = `Your battery is at ${batteryLevel}% and not charging. `
      + `Based on your typical overnight drain, your alarm may not fire. `
      + `Plug in now.`;
  } else if (predictedBattery <= WARNING_THRESHOLD) {
    riskLevel = 'warning';
    nudge = `Your battery is at ${batteryLevel}% and not charging. `
      + `Your alarm should fire, but it'll be close. Consider plugging in.`;
  } else {
    riskLevel = 'safe';
    nudge = null;
  }

  return {
    riskLevel,
    predictedBattery: Math.max(0, Math.round(predictedBattery)),
    willSurvive: predictedBattery > CRITICAL_THRESHOLD,
    nudge,
  };
}

// --- Run scenarios ---

const scenarios = [
  {
    name: 'Chris: EMEA call, forgot to plug in',
    input: { batteryLevel: 34, drainRatePerHour: 8, hoursUntilAlarm: 6, isCharging: false },
    // 34 - (8 * 6) = 34 - 48 = -14 → dead
  },
  {
    name: 'Chris: same scenario but plugged in',
    input: { batteryLevel: 34, drainRatePerHour: 8, hoursUntilAlarm: 6, isCharging: true },
    // Charging → safe
  },
  {
    name: 'Jen: competition morning, phone on nightstand',
    input: { batteryLevel: 55, drainRatePerHour: 6, hoursUntilAlarm: 7, isCharging: false },
    // 55 - (6 * 7) = 55 - 42 = 13 → warning
  },
  {
    name: 'Thomas: plenty of battery, low drain',
    input: { batteryLevel: 80, drainRatePerHour: 3, hoursUntilAlarm: 8, isCharging: false },
    // 80 - (3 * 8) = 80 - 24 = 56 → safe
  },
  {
    name: 'Naiyah: fell asleep watching videos, high drain',
    input: { batteryLevel: 22, drainRatePerHour: 12, hoursUntilAlarm: 5, isCharging: false },
    // 22 - (12 * 5) = 22 - 60 = -38 → dead
  },
  {
    name: 'Edge: exactly at threshold',
    input: { batteryLevel: 45, drainRatePerHour: 5, hoursUntilAlarm: 8, isCharging: false },
    // 45 - (5 * 8) = 45 - 40 = 5 → critical (at threshold)
  },
  {
    name: 'Edge: alarm in 30 minutes, low battery',
    input: { batteryLevel: 8, drainRatePerHour: 10, hoursUntilAlarm: 0.5, isCharging: false },
    // 8 - (10 * 0.5) = 8 - 5 = 3 → critical
  },
  {
    name: 'Edge: 100% battery, worst drain, long night',
    input: { batteryLevel: 100, drainRatePerHour: 15, hoursUntilAlarm: 8, isCharging: false },
    // 100 - (15 * 8) = 100 - 120 = -20 → dead (rogue app scenario)
  },
];

console.log('=== Battery Prediction Spike ===\n');

for (const scenario of scenarios) {
  const result = predictAlarmRisk(scenario.input);
  const { batteryLevel, drainRatePerHour, hoursUntilAlarm, isCharging } = scenario.input;

  console.log(`Scenario: ${scenario.name}`);
  console.log(`  Input:  ${batteryLevel}% | ${drainRatePerHour}%/hr drain | ${hoursUntilAlarm}hrs to alarm | ${isCharging ? 'charging' : 'not charging'}`);
  console.log(`  Result: ${result.riskLevel.toUpperCase()} | predicted ${result.predictedBattery}% at alarm time | survive: ${result.willSurvive}`);
  if (result.nudge) {
    console.log(`  Nudge:  "${result.nudge}"`);
  }
  console.log();
}
