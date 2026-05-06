import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer({ countDown = false, initialSeconds = 0, onComplete } = {}) {
  const [display, setDisplay] = useState(initialSeconds);
  const secondsRef = useRef(initialSeconds);
  const intervalRef = useRef(null);
  const startTimestampRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const tick = useCallback(() => {
    if (countDown) {
      secondsRef.current -= 1;
      if (secondsRef.current <= 0) {
        secondsRef.current = 0;
        setDisplay(0);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onCompleteRef.current?.();
        return;
      }
    } else {
      secondsRef.current += 1;
    }
    setDisplay(secondsRef.current);
  }, [countDown]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    startTimestampRef.current = Date.now() - (
      countDown
        ? 0
        : secondsRef.current * 1000
    );
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, countDown]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const reset = useCallback((toSeconds) => {
    pause();
    const val = toSeconds !== undefined ? toSeconds : initialSeconds;
    secondsRef.current = val;
    setDisplay(val);
    startTimestampRef.current = null;
  }, [pause, initialSeconds]);

  const getElapsed = useCallback(() => {
    if (countDown) {
      return initialSeconds - secondsRef.current;
    }
    return secondsRef.current;
  }, [countDown, initialSeconds]);

  // Correct drift when tab regains visibility
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible' && intervalRef.current && startTimestampRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        if (countDown) {
          const remaining = Math.max(0, initialSeconds - elapsed);
          secondsRef.current = remaining;
          setDisplay(remaining);
          if (remaining === 0) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            onCompleteRef.current?.();
          }
        } else {
          secondsRef.current = elapsed;
          setDisplay(elapsed);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [countDown, initialSeconds]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { display, secondsRef, start, pause, reset, getElapsed };
}
