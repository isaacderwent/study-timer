const TABS = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'countdown', label: 'Countdown' },
];

export function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
