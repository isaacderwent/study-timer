import { useState, useRef } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from '../controls/TimerControls';

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // Audio not supported — silent fallback
  }
}

export function CountdownTimer({ onSaveSession }) {
  const [status, setStatus] = useState('idle');
  const [inputHours, setInputHours]     = useState(0);
  const [inputMinutes, setInputMinutes] = useState(30);
  const totalSecondsRef = useRef(inputHours * 3600 + inputMinutes * 60);

  const { display, start, pause, reset, getElapsed } = useTimer({
    countDown: true,
    initialSeconds: totalSecondsRef.current,
    onComplete: () => {
      beep();
      onSaveSession(totalSecondsRef.current, 'countdown');
      setStatus('idle');
    },
  });

  function getConfiguredSeconds() {
    return inputHours * 3600 + inputMinutes * 60;
  }

  function handleStart() {
    const secs = getConfiguredSeconds();
    totalSecondsRef.current = secs;
    reset(secs);
    setTimeout(() => {
      start();
      setStatus('running');
    }, 0);
  }

  function handlePause() {
    pause();
    const elapsed = getElapsed();
    onSaveSession(elapsed, 'countdown');
    setStatus('paused');
  }

  function handleContinue() {
    start();
    setStatus('running');
  }

  function handleReset() {
    const elapsed = getElapsed();
    onSaveSession(elapsed, 'countdown');
    const secs = getConfiguredSeconds();
    totalSecondsRef.current = secs;
    reset(secs);
    setStatus('idle');
  }

  function handleHoursChange(e) {
    const digits = e.target.value.replace(/\D/g, '');
    const num = Math.min(23, Math.max(0, parseInt(digits) || 0));
    setInputHours(num);
  }

  function handleMinutesChange(e) {
    const digits = e.target.value.replace(/\D/g, '');
    const num = Math.min(59, Math.max(0, parseInt(digits) || 0));
    setInputMinutes(num);
  }

  return (
    <div className="timer-wrapper">
      {status === 'idle' ? (
        <div className="timer-display">
          <div className="timer-label">Countdown</div>
          <div className="countdown-edit">
            <input
              type="text"
              inputMode="numeric"
              className="countdown-digit-input"
              value={String(inputHours).padStart(2, '0')}
              onChange={handleHoursChange}
              onFocus={e => e.target.select()}
              aria-label="Hours"
            />
            <span className="countdown-colon">:</span>
            <input
              type="text"
              inputMode="numeric"
              className="countdown-digit-input"
              value={String(inputMinutes).padStart(2, '0')}
              onChange={handleMinutesChange}
              onFocus={e => e.target.select()}
              aria-label="Minutes"
            />
            <span className="countdown-colon countdown-colon-ss">:00</span>
          </div>
        </div>
      ) : (
        <TimerDisplay seconds={display} label="Countdown" />
      )}

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
