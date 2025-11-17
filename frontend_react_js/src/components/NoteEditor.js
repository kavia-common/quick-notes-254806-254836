import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from '../utils/debounce';
import { useToast } from '../utils/toast';

// PUBLIC_INTERFACE
/**
 * NoteEditor
 * Edits title and content for the selected note, with debounced autosave.
 */
export default function NoteEditor({ note, onChange, onSave }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note?.id]);

  const doSave = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          setSaving(true);
          await onSave(payload);
        } catch (e) {
          toast.push('Failed to save note', 'error');
        } finally {
          setSaving(false);
        }
      }, 500),
    [onSave, toast]
  );

  const handleTitle = (v) => {
    setTitle(v);
    const payload = { ...note, title: v };
    onChange(payload);
    doSave(payload);
  };

  const handleContent = (v) => {
    setContent(v);
    const payload = { ...note, content: v };
    onChange(payload);
    doSave(payload);
  };

  if (!note) {
    return (
      <div className="editor" aria-live="polite">
        <div style={{ fontWeight: 800, fontSize: 18 }}>No note selected</div>
        <div style={{ color: '#6b7280' }}>Select or create a note from the sidebar.</div>
      </div>
    );
  }

  return (
    <div className="editor" aria-label="Note editor">
      <input
        className="editor-title"
        value={title}
        placeholder="Note title..."
        onChange={(e) => handleTitle(e.target.value)}
        aria-label="Note title"
      />
      <textarea
        className="editor-content"
        value={content}
        placeholder="Write your note here..."
        onChange={(e) => handleContent(e.target.value)}
        aria-label="Note content"
      />
      <div className="editor-footer">
        <span className="badge" aria-live="polite">
          {saving ? 'Saving...' : 'Saved'}
        </span>
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          Autosave enabled • Rainbow Burst
        </span>
      </div>
    </div>
  );
}
