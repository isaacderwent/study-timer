import { useState, useCallback } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from '../controls/TimerControls';

export function PomodoroTimer({ settings, onSaveSession }) {
  const workSecs = settings.pomodoroDuration * 60;
  const breakSecs = settings.breakDuration * 60;

  const [phase, setPhase] = useState('work'); // 'work' | 'break'
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [cycleCount, setCycleCount] = useState(0);
  const [awaitingNextCycle, setAwaitingNextCycle] = useState(false);

  const handleWorkComplete = useCallback(() => {
    onSaveSession(workSecs, 'pomodoro');
    setCycleCount(c => c + 1);
    setPhase('break');
    setStatus('running');
    breakTimer.reset(breakSecs);
    setTimeout(() => breakTimer.start(), 0);
  }, [workSecs, breakSecs]);

  const handleBreakComplete = useCallback(() => {
    setStatus('idle');
    setPhase('work');
    setAwaitingNextCycle(true);
  }, []);

  const workTimer = useTimer({ countDown: true, initialSeconds: workSecs, onComplete: handleWorkComplete });
  const breakTimer = useTimer({ countDown: true, initialSeconds: breakSecs, onComplete: handleBreakComplete });

  const activeTimer = phase === 'work' ? workTimer : breakTimer;
  const activeInitial = phase === 'work' ? workSecs : breakSecs;

  function handleStart() {
    setAwaitingNextCycle(false);
    activeTimer.reset(activeInitial);
    setTimeout(() => {
      activeTimer.start();
      setStatus('running');
    }, 0);
  }

  function handlePause() {
    activeTimer.pause();
    if (phase === 'work') {
      const elapsed = activeTimer.getElapsed();
      onSaveSession(elapsed, 'pomodoro');
    }
    setStatus('paused');
  }

  function handleContinue() {
    activeTimer.start();
    setStatus('running');
  }

  function handleReset() {
    if (phase === 'work') {
      const elapsed = activeTimer.getElapsed();
      onSaveSession(elapsed, 'pomodoro');
    }
    activeTimer.reset(activeInitial);
    setStatus('idle');
    setAwaitingNextCycle(false);
  }

  const phaseLabel = phase === 'work'
    ? `Study Phase${cycleCount > 0 ? ` (Cycle ${cycleCount + 1})` : ''}`
    : 'Break Time';

  return (
    <div className="timer-wrapper">
      <div className={`phase-badge ${phase}`}>{phaseLabel}</div>
      <TimerDisplay seconds={activeTimer.display} />

      {awaitingNextCycle && (
        <div className="next-cycle-prompt">
          Break complete! Ready for the next cycle?
        </div>
      )}

      <TimerControls
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onContinue={handleContinue}
        onReset={handleReset}
      />

      {cycleCount > 0 && (
        <div className="cycle-count">Cycles completed: {cycleCount}</div>
      )}
    </div>
  );
}
