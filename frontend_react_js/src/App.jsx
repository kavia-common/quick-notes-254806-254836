import React, { useEffect, useMemo, useState } from 'react';
import './theme.css';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import { ToastProvider, useToast } from './utils/toast';
import { createNotesService } from './services/notesService';

// PUBLIC_INTERFACE
/**
 * AppShell
 * The main app shell rendering top bar, sidebar and editor.
 */
function AppShell() {
  const [service, setService] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const svc = await createNotesService();
      if (!mounted) return;
      setService(svc);

      try {
        const list = await svc.listNotes();
        setNotes(list);
        if (list.length) setSelectedId(list[0].id);
      } catch (e) {
        toast.push('Failed to load notes', 'error');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const selected = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  // PUBLIC_INTERFACE
  async function handleCreate() {
    if (!service) return;
    try {
      const created = await service.createNote({ title: 'Untitled', content: '' });
      setNotes((prev) => [created, ...prev]);
      setSelectedId(created.id);
      toast.push('Note created', 'success');
    } catch (e) {
      toast.push('Failed to create note', 'error');
    }
  }

  // PUBLIC_INTERFACE
  async function handleDelete(id) {
    if (!service) return;
    const prev = notes;
    setNotes((n) => n.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId((prevList => {
      const remaining = prev.filter((x) => x.id !== id);
      return remaining[0]?.id || null;
    }));
    try {
      await service.deleteNote(id);
      toast.push('Note deleted', 'success');
    } catch (e) {
      // rollback
      setNotes(prev);
      toast.push('Failed to delete note', 'error');
    }
  }

  // PUBLIC_INTERFACE
  async function handleSave(note) {
    if (!service || !note?.id) return;
    try {
      const updated = await service.updateNote(note.id, { title: note.title, content: note.content });
      setNotes((list) => list.map((n) => (n.id === updated.id ? updated : n)));
    } catch (e) {
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  function handleChange(note) {
    setNotes((list) => list.map((n) => (n.id === note.id ? { ...n, title: note.title, content: note.content, updated_at: new Date().toISOString() } : n)));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Quick Notes">
          <div className="brand-logo" aria-hidden="true" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Quick Notes</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Rainbow Burst</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={handleCreate}>New Note</button>
        </div>
      </header>

      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      <main className="main">
        {loading ? (
          <div className="editor" aria-live="polite">
            <div style={{ fontWeight: 800, fontSize: 18 }}>Loading notes…</div>
          </div>
        ) : (
          <NoteEditor
            note={selected}
            onChange={handleChange}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * App - exported entry with ToastProvider wrapper
 */
export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
