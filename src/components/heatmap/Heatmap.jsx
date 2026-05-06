import { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { groupByDay } from '../../utils/sessionStats';
import { toDateKey } from '../../utils/dateHelpers';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getCellType(minutes, streakThreshold, dailyGoalMinutes) {
  if (!minutes) return 'none';
  if (minutes >= Math.round(dailyGoalMinutes)) return 'goal';
  if (minutes >= streakThreshold) return 'streak';
  return 'partial';
}

function formatTooltipDate(dateKey) {
  const [y, m, d] = dateKey.split('-');
  const yy = y.slice(2);
  return `${d}/${m}/${yy}`;
}

// Extract first N plain-text lines from stored HTML note
function getNotePreview(dateKey, maxLines = 3) {
  const html = localStorage.getItem(`study_notes_${dateKey}`) || '';
  if (!html) return [];
  const text = html
    .replace(/<\/(p|div|li|br|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.slice(0, maxLines);
}

export function Heatmap({ sessions, streakThresholdMinutes, dailyGoalMinutes, onDateClick }) {
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);
  const todayKey = new Date().toLocaleDateString('en-CA');

  const minutesByDay = useMemo(() => groupByDay(sessions), [sessions]);

  const { days, startPad } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);
    start.setDate(start.getDate() + 1);

    const allDays = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      allDays.push(toDateKey(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }

    const firstDate = new Date(allDays[0] + 'T00:00:00');
    const pad = firstDate.getDay();
    return { days: allDays, startPad: pad };
  }, []);

  const monthLabels = useMemo(() => {
    const labels = [];
    for (let i = 0; i < days.length; i++) {
      const d = new Date(days[i] + 'T00:00:00');
      if (d.getDate() === 1) {
        labels.push({ col: Math.floor((startPad + i) / 7), label: MONTHS[d.getMonth()] });
      }
    }
    return labels;
  }, [days, startPad]);

  const totalCols = Math.ceil((startPad + days.length) / 7);

  // Auto-scroll so today's column is always visible on the right
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  function handleMouseEnter(e, dateKey) {
    const mins = minutesByDay[dateKey] || 0;
    const rect = e.target.getBoundingClientRect();
    const dateStr = mins > 0
      ? `${formatTooltipDate(dateKey)}: ${mins}m`
      : `${formatTooltipDate(dateKey)}: No study`;
    const noteLines = getNotePreview(dateKey);
    // Clamp x so tooltip stays inside viewport
    const TIP_HALF = 112;
    const rawX = rect.left + rect.width / 2;
    const x = Math.max(TIP_HALF + 4, Math.min(window.innerWidth - TIP_HALF - 4, rawX));
    setTooltip({ x, y: rect.top - 8, dateStr, noteLines });
  }

  function handleCellClick(dateKey) {
    if (onDateClick) onDateClick(dateKey);
  }

  // Tooltip rendered into document.body via portal so it escapes
  // the backdrop-filter containing block on .heatmap-section
  const tooltipPortal = tooltip && createPortal(
    <div
      className="heatmap-tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className="heatmap-tooltip-date">{tooltip.dateStr}</div>
      {tooltip.noteLines.length > 0 && (
        <div className="heatmap-tooltip-notes">
          {tooltip.noteLines.map((line, i) => (
            <div key={i} className="heatmap-tooltip-note-line">{line}</div>
          ))}
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <div className="heatmap-section">
      <h3 className="section-title">Study History</h3>

      {/* Horizontal scroll with hidden scrollbar — today's column always visible */}
      <div ref={scrollRef} className="heatmap-scroll">
        <div
          className="heatmap-month-row"
          style={{ gridTemplateColumns: `repeat(${totalCols}, 14px)` }}
        >
          {monthLabels.map((m, i) => (
            <div key={i} className="heatmap-month-label" style={{ gridColumn: m.col + 1 }}>
              {m.label}
            </div>
          ))}
        </div>
        <div
          className="heatmap-grid"
          style={{
            gridTemplateRows: 'repeat(7, 14px)',
            gridTemplateColumns: `repeat(${totalCols}, 14px)`,
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="heatmap-cell empty" />
          ))}
          {days.map(dateKey => {
            const mins = minutesByDay[dateKey] || 0;
            const type = getCellType(mins, streakThresholdMinutes, dailyGoalMinutes);
            const isToday = dateKey === todayKey;
            const todayCls = isToday ? ' heatmap-today' : '';
            if (type === 'goal') {
              return (
                <div
                  key={dateKey}
                  className={`heatmap-cell heatmap-star${todayCls}`}
                  onMouseEnter={e => handleMouseEnter(e, dateKey)}
                  onClick={() => handleCellClick(dateKey)}
                >
                  ★
                </div>
              );
            }
            return (
              <div
                key={dateKey}
                className={`heatmap-cell heatmap-${type}${todayCls}`}
                onMouseEnter={e => handleMouseEnter(e, dateKey)}
                onClick={() => handleCellClick(dateKey)}
              />
            );
          })}
        </div>
      </div>

      {tooltipPortal}
    </div>
  );
}
