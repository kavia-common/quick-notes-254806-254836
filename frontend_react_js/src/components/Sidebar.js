import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../utils/toast';

// PUBLIC_INTERFACE
/**
 * Sidebar
 * Shows search box, add note button, and list of notes.
 * Keyboard navigation: Up/Down to traverse, Enter/Space to select, Del/Backspace to delete.
 */
export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [query, setQuery] = useState('');
  const listRef = useRef(null);
  const toast = useToast();

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => (n.title || '').toLowerCase().includes(q));
  }, [notes, query]);

  useEffect(() => {
    // Ensure selected item scrolled into view when list changes
    const el = listRef.current?.querySelector(`[data-id="${selectedId}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedId, filtered.length]);

  const onKeyDown = (e) => {
    // List keyboard navigation
    const idx = filtered.findIndex((n) => n.id === selectedId);
    if (e.key === 'ArrowDown') {
      const nextIdx = Math.min(idx + 1, filtered.length - 1);
      if (filtered[nextIdx]) onSelect(filtered[nextIdx].id);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const prevIdx = Math.max(idx - 1, 0);
      if (filtered[prevIdx]) onSelect(filtered[prevIdx].id);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (filtered[idx]) onSelect(filtered[idx].id);
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      onDelete(selectedId);
      toast.push('Note deleted', 'success');
      e.preventDefault();
    }
  };

  return (
    <aside className="sidebar" aria-label="Notes list navigation">
      <div className="search">
        <input
          aria-label="Search notes"
          className="input"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn" onClick={onCreate} aria-label="Add note">
          + New
        </button>
      </div>

      <div
        className="note-list"
        role="listbox"
        aria-label="Notes"
        tabIndex={0}
        onKeyDown={onKeyDown}
        ref={listRef}
      >
        {filtered.length === 0 && (
          <div className="note-item" aria-disabled="true">
            <div>
              <div className="note-title">No notes</div>
              <div className="note-updated">Try creating a new note</div>
            </div>
          </div>
        )}
        {filtered.map((n) => (
          <div
            key={n.id}
            data-id={n.id}
            role="option"
            aria-selected={n.id === selectedId}
            className="note-item"
            tabIndex={-1}
            onClick={() => onSelect(n.id)}
          >
            <div style={{ minWidth: 0 }}>
              <div className="note-title" title={n.title || 'Untitled'}>
                {n.title || 'Untitled'}
              </div>
              <div className="note-updated">
                {new Date(n.updated_at).toLocaleString()}
              </div>
            </div>
            <div className="note-actions" aria-label="Note actions">
              <button
                className="icon-btn"
                aria-label="Delete note"
                title="Delete note"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                  toast.push('Note deleted', 'success');
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
