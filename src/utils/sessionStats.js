import { toDateKey, subtractDays } from './dateHelpers';

export function groupByDay(sessions) {
  return sessions.reduce((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + Math.floor(s.durationSeconds / 60);
    return acc;
  }, {});
}

export function computeTodayMinutes(sessions) {
  const today = toDateKey();
  return sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0);
}

export function computeStreak(sessions, thresholdMinutes) {
  const minutesByDay = groupByDay(sessions);
  const today = toDateKey();
  let streak = 0;
  let cursor = new Date();

  // If today hasn't met the threshold yet, start counting from yesterday
  if ((minutesByDay[today] || 0) < thresholdMinutes) {
    cursor = subtractDays(cursor, 1);
  }

  while (true) {
    const key = toDateKey(cursor);
    if ((minutesByDay[key] || 0) >= thresholdMinutes) {
      streak++;
      cursor = subtractDays(cursor, 1);
    } else {
      break;
    }
  }
  return streak;
}
