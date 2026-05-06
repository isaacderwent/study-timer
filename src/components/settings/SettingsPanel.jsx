import { useState } from 'react';

export function SettingsPanel({ settings, onUpdate }) {
  const [open, setOpen] = useState(false);

  function handleChange(key, value) {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      onUpdate({ [key]: num });
    }
  }

  return (
    <div className="settings-panel">
      <button className="btn btn-ghost settings-toggle" onClick={() => setOpen(o => !o)}>
        ⚙ Settings {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="settings-grid">
          <SettingRow
            label="Pomodoro study duration"
            unit="min"
            value={settings.pomodoroDuration}
            onChange={v => handleChange('pomodoroDuration', v)}
          />
          <SettingRow
            label="Pomodoro break duration"
            unit="min"
            value={settings.breakDuration}
            onChange={v => handleChange('breakDuration', v)}
          />
          <SettingRow
            label="Daily study goal"
            unit="min"
            value={settings.dailyGoalMinutes}
            onChange={v => handleChange('dailyGoalMinutes', v)}
          />
          <SettingRow
            label="Streak minimum daily study"
            unit="min"
            value={settings.streakThresholdMinutes}
            onChange={v => handleChange('streakThresholdMinutes', v)}
          />
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, unit, value, onChange }) {
  return (
    <div className="setting-row">
      <label className="setting-label">{label}</label>
      <div className="setting-input-wrap">
        <input
          type="number"
          min="1"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="setting-input"
        />
        <span className="setting-unit">{unit}</span>
      </div>
    </div>
  );
}
