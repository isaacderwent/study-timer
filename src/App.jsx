import { useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useSessions } from './hooks/useSessions';
import { TabBar } from './components/TabBar/TabBar';
import { DailyGoalBar } from './components/DailyGoalBar/DailyGoalBar';
import { PomodoroTimer } from './components/timer/PomodoroTimer';
import { StopwatchTimer } from './components/timer/StopwatchTimer';
import { CountdownTimer } from './components/timer/CountdownTimer';
import { Heatmap } from './components/heatmap/Heatmap';
import { StreakBadge } from './components/streak/StreakBadge';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { PixelBackground } from './components/PixelBackground';
import { NoteEditor } from './components/Notepad/NoteEditor';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab]   = useState('pomodoro');
  const [settings, updateSettings]  = useSettings();
  const [sessions, addSession]      = useSessions();
  const [viewDate, setViewDate]     = useState(null); // null = today

  return (
    <>
      <PixelBackground />
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Study Timer</h1>
          <StreakBadge
            sessions={sessions}
            streakThresholdMinutes={settings.streakThresholdMinutes}
          />
        </header>

        <DailyGoalBar
          sessions={sessions}
          dailyGoalMinutes={settings.dailyGoalMinutes}
        />

        <main className="app-main">
          {/* Left column — notepad */}
          <div className="notepad-column">
            <NoteEditor
              viewDate={viewDate}
              onViewDateChange={setViewDate}
            />
          </div>

          {/* Right column — timers + heatmap */}
          <div className="content-column">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="timer-panel">
              {activeTab === 'pomodoro' && (
                <PomodoroTimer settings={settings} onSaveSession={addSession} />
              )}
              {activeTab === 'stopwatch' && (
                <StopwatchTimer onSaveSession={addSession} />
              )}
              {activeTab === 'countdown' && (
                <CountdownTimer onSaveSession={addSession} />
              )}
            </div>

            <Heatmap
              sessions={sessions}
              streakThresholdMinutes={settings.streakThresholdMinutes}
              dailyGoalMinutes={settings.dailyGoalMinutes}
              onDateClick={setViewDate}
            />
          </div>
        </main>

        <div className="settings-row">
          <SettingsPanel settings={settings} onUpdate={updateSettings} />
        </div>
      </div>
    </>
  );
}
