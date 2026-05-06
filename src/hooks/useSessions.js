import { useState } from 'react';
import { toDateKey } from '../utils/dateHelpers';

const STORAGE_KEY = 'study_timer_sessions';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState(loadSessions);

  function addSession(durationSeconds, mode) {
    if (durationSeconds < 5) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: toDateKey(),
      durationSeconds: Math.round(durationSeconds),
      mode,
    };
    setSessions(prev => {
      const next = [...prev, entry];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return [sessions, addSession];
}
