import { formatSeconds } from '../../utils/timeFormat';

export function TimerDisplay({ seconds, label }) {
  return (
    <div className="timer-display">
      {label && <div className="timer-label">{label}</div>}
      <div className="timer-digits">{formatSeconds(seconds)}</div>
    </div>
  );
}
