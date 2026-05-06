import { useMemo } from 'react';
import { computeTodayMinutes } from '../../utils/sessionStats';
import { formatMinutes } from '../../utils/timeFormat';

export function DailyGoalBar({ sessions, dailyGoalMinutes }) {
  const todayMinutes = useMemo(() => computeTodayMinutes(sessions), [sessions]);
  const pct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="daily-goal-bar">
      <div className="daily-goal-label">
        <span>Daily Goal</span>
        <span>{formatMinutes(todayMinutes)} / {formatMinutes(dailyGoalMinutes)}</span>
      </div>
      <div className="daily-goal-track">
        <div
          className="daily-goal-fill"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );
}
