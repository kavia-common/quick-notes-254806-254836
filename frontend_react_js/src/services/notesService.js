/**
 * NotesService provides a simple CRUD interface for notes with shape:
 * { id: string, title: string, content: string, tags: string[], updated_at: string }
 * It chooses Supabase if credentials exist, otherwise uses localStorage fallback.
 * Includes basic error handling and resilient behavior.
 */

// Util: simple uid
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Keys
const LS_KEY = 'quick_notes_items_v1';

// Normalize a note shape
function normalize(note) {
  return {
    id: note.id || uid(),
    title: (note.title || '').trim(),
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    updated_at: note.updated_at || new Date().toISOString(),
  };
}

// PUBLIC_INTERFACE
export async function createNotesService() {
  /**
   * Factory that returns a NotesService implementation.
   * Chooses Supabase if REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set.
   * Otherwise uses localStorage-based storage.
   */
  try {
    const { getSupabaseClient } = await import('./supabaseClient');
    const supabase = await getSupabaseClient();
    if (supabase) {
      return supabaseService(supabase);
    }
  } catch (e) {
    // Ignore, fall back to LocalStorage
    // eslint-disable-next-line no-console
    console.warn('Supabase not available, falling back to localStorage:', e?.message || e);
  }
  return localService();
}

function localService() {
  const readAll = () => {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const writeAll = (arr) => {
    window.localStorage.setItem(LS_KEY, JSON.stringify(arr));
  };

  return {
    // PUBLIC_INTERFACE
    async listNotes(query = '') {
      const all = readAll().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      const q = (query || '').toLowerCase();
      if (!q) return all;
      return all.filter((n) => (n.title || '').toLowerCase().includes(q));
    },
    // PUBLIC_INTERFACE
    async getNote(id) {
      return readAll().find((n) => n.id === id) || null;
    },
    // PUBLIC_INTERFACE
    async createNote(partial = {}) {
      const note = normalize({ ...partial, id: uid(), updated_at: new Date().toISOString() });
      const all = readAll();
      all.unshift(note);
      writeAll(all);
      return note;
    },
    // PUBLIC_INTERFACE
    async updateNote(id, updates = {}) {
      const all = readAll();
      const idx = all.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      const updated = normalize({
        ...all[idx],
        ...updates,
        id,
        updated_at: new Date().toISOString(),
      });
      all[idx] = updated;
      writeAll(all);
      return updated;
    },
    // PUBLIC_INTERFACE
    async deleteNote(id) {
      const all = readAll();
      const filtered = all.filter((n) => n.id !== id);
      writeAll(filtered);
      return { success: true };
    },
  };
}

function supabaseService(supabase) {
  const TABLE = 'notes';

  async function ensureTable() {
    // Attempt a select to see if table exists; if not, allow error to surface.
    // In many environments the table should already be created by backend migrations.
    try {
      const { error } = await supabase.from(TABLE).select('id').limit(1);
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('Supabase notes table check error:', error.message);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Supabase notes table check failed:', e?.message || e);
    }
  }

  ensureTable();

  return {
    // PUBLIC_INTERFACE
    async listNotes(query = '') {
      const sel = supabase.from(TABLE).select('*').order('updated_at', { ascending: false });
      const { data, error } = await sel;
      if (error) throw new Error(error.message);
      const items = (data || []).map(normalize);
      const q = (query || '').toLowerCase();
      if (!q) return items;
      return items.filter((n) => (n.title || '').toLowerCase().includes(q));
    },
    // PUBLIC_INTERFACE
    async getNote(id) {
      const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
      if (error) return null;
      return normalize(data);
    },
    // PUBLIC_INTERFACE
    async createNote(partial = {}) {
      const note = normalize({ ...partial, id: uid(), updated_at: new Date().toISOString() });
      const { data, error } = await supabase.from(TABLE).insert(note).select('*').single();
      if (error) throw new Error(error.message);
      return normalize(data || note);
    },
    // PUBLIC_INTERFACE
    async updateNote(id, updates = {}) {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return normalize(data);
    },
    // PUBLIC_INTERFACE
    async deleteNote(id) {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    },
  };
}
