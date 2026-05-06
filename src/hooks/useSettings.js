import { useState } from 'react';

const STORAGE_KEY = 'study_timer_settings';

const DEFAULTS = {
  pomodoroDuration: 25,
  breakDuration: 5,
  dailyGoalMinutes: 60,
  streakThresholdMinutes: 30,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  function updateSettings(partial) {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return [settings, updateSettings];
}
