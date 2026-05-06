import { useEffect, useRef } from 'react';
import './NoteEditor.css';

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}

function getStorageKey(dateKey) {
  return `study_notes_${dateKey}`;
}

function formatViewDate(dateKey) {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-');
  return `${d}/${m}/${y}`;
}

export function NoteEditor({ viewDate, onViewDateChange }) {
  const editorRef = useRef(null);
  const todayKey  = getTodayKey();
  const activeKey = viewDate || todayKey;
  const isToday   = activeKey === todayKey;

  // Load saved note whenever the active date changes
  useEffect(() => {
    if (!editorRef.current) return;
    const saved = localStorage.getItem(getStorageKey(activeKey)) || '';
    editorRef.current.innerHTML = saved;
    // Move cursor to end
    editorRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [activeKey]);

  function handleInput() {
    if (!editorRef.current) return;
    localStorage.setItem(getStorageKey(activeKey), editorRef.current.innerHTML);
  }

  function format(command, value) {
    document.execCommand(command, false, value ?? null);
    editorRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); format('bold'); }
      if (e.key === 'i') { e.preventDefault(); format('italic'); }
      if (e.key === 'u') { e.preventDefault(); format('underline'); }
    }
  }

  return (
    <div className="note-editor glass">
      {/* Date header — shown when viewing a past day */}
      {!isToday && (
        <div className="note-date-bar">
          <span className="note-viewing-date">{formatViewDate(activeKey)}</span>
          <button
            className="btn-ghost note-today-btn"
            onClick={() => onViewDateChange(null)}
          >
            ← Today
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="note-toolbar">
        <button
          className="note-tool"
          title="Bold (Ctrl+B)"
          onMouseDown={e => { e.preventDefault(); format('bold'); }}
        >
          <b>B</b>
        </button>
        <button
          className="note-tool note-tool-italic"
          title="Italic (Ctrl+I)"
          onMouseDown={e => { e.preventDefault(); format('italic'); }}
        >
          <i>I</i>
        </button>
        <button
          className="note-tool note-tool-underline"
          title="Underline (Ctrl+U)"
          onMouseDown={e => { e.preventDefault(); format('underline'); }}
        >
          <u>U</u>
        </button>
        <div className="note-tool-divider" />
        <button
          className="note-tool"
          title="Bullet List"
          onMouseDown={e => { e.preventDefault(); format('insertUnorderedList'); }}
        >
          •
        </button>
        <button
          className="note-tool"
          title="Numbered List"
          onMouseDown={e => { e.preventDefault(); format('insertOrderedList'); }}
        >
          1.
        </button>
      </div>

      {/* Editable content area */}
      <div
        ref={editorRef}
        className="note-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="What's on your mind today..."
        spellCheck="true"
      />
    </div>
  );
}
