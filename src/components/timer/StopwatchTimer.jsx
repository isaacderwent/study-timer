import { useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from '../controls/TimerControls';

export function StopwatchTimer({ onSaveSession }) {
  const [status, setStatus] = useState('idle');
  const { display, start, pause, reset, getElapsed } = useTimer({ countDown: false, initialSeconds: 0 });

  function handleStart() {
    start();
    setStatus('running');
  }

  function handlePause() {
    pause();
    const elapsed = getElapsed();
    onSaveSession(elapsed, 'stopwatch');
    setStatus('paused');
  }

  function handleContinue() {
    start();
    setStatus('running');
  }

  function handleReset() {
    const elapsed = getElapsed();
    onSaveSession(elapsed, 'stopwatch');
    reset(0);
    setStatus('idle');
  }

  return (
    <div className="timer-wrapper">
      <TimerDisplay seconds={display} label="Stopwatch" />
      <TimerControls
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onContinue={handleContinue}
        onReset={handleReset}
      />
    </div>
  );
}
