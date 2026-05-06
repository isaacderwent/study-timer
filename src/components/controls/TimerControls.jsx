export function TimerControls({ status, onStart, onPause, onContinue, onReset, extraButton }) {
  return (
    <div className="timer-controls">
      {status === 'idle' && (
        <button className="btn btn-primary" onClick={onStart}>Start</button>
      )}
      {status === 'running' && (
        <button className="btn btn-secondary" onClick={onPause}>Pause</button>
      )}
      {status === 'paused' && (
        <>
          <button className="btn btn-primary" onClick={onContinue}>Continue</button>
          <button className="btn btn-danger" onClick={onReset}>Reset</button>
        </>
      )}
      {extraButton}
    </div>
  );
}
