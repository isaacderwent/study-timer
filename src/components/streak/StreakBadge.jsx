import { useMemo } from 'react';
import { computeStreak } from '../../utils/sessionStats';

export function StreakBadge({ sessions, streakThresholdMinutes }) {
  const streak = useMemo(
    () => computeStreak(sessions, streakThresholdMinutes),
    [sessions, streakThresholdMinutes]
  );

  return (
    <div className="streak-badge">
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{streak}</span>
      <span className="streak-label">day streak</span>
    </div>
  );
}
