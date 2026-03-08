import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  lastEdited: number;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  createNote: () => string; // returns new note id
  deleteNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

const defaultWelcomeNote: Note = {
  id: 'welcome-note',
  title: 'Welcome to Block Notes',
  lastEdited: Date.now(),
  blocks: [
    { id: 'b1', type: 'h1', content: 'Getting Started' },
    { id: 'b2', type: 'paragraph', content: 'This is a minimal, block-based workspace for your thoughts. Everything is treated as a block.' },
    { id: 'b3', type: 'h2', content: 'Features' },
    { id: 'b4', type: 'bullet', content: 'Drag and drop blocks to reorder them' },
    { id: 'b5', type: 'bullet', content: 'Markdown shortcuts: type "# " for H1, "- " for bullets' },
    { id: 'b6', type: 'todo', content: 'Try creating your own note!', checked: false },
  ],
};

function rowToNote(row: { id: string; title: string; blocks: Block[]; last_edited: string }): Note {
  return {
    id: row.id,
    title: row.title ?? '',
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    lastEdited: row.last_edited ? new Date(row.last_edited).getTime() : Date.now(),
  };
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes on mount: from Supabase if enabled, else default local
  useEffect(() => {
    if (isSupabaseEnabled() && supabase) {
      supabase
        .from('notes')
        .select('id, title, blocks, last_edited')
        .order('last_edited', { ascending: false })
        .then(({ data, error }) => {
          setIsLoading(false);
          if (error) {
            console.error('Failed to load notes from Supabase:', error);
            setNotes([defaultWelcomeNote]);
            return;
          }
          const loaded = (data ?? []).map(rowToNote);
          setNotes(loaded.length > 0 ? loaded : [defaultWelcomeNote]);
        });
    } else {
      setIsLoading(false);
      setNotes([defaultWelcomeNote]);
    }
  }, []);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      lastEdited: Date.now(),
      blocks: [{ id: Math.random().toString(36).substring(2, 9), type: 'paragraph', content: '' }],
    };
    setNotes((prev) => [newNote, ...prev]);

    if (isSupabaseEnabled() && supabase) {
      supabase
        .from('notes')
        .insert({
          id: newNote.id,
          title: newNote.title,
          blocks: newNote.blocks,
          last_edited: new Date(newNote.lastEdited).toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Failed to create note in Supabase:', error);
        });
    }
    return newNote.id;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseEnabled() && supabase) {
      supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Failed to delete note from Supabase:', error);
        });
    }
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const lastEdited = Date.now();
    const merged = { ...updates, lastEdited };
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...merged } : n));
      const updated = next.find((n) => n.id === id);
      if (isSupabaseEnabled() && supabase && updated) {
        supabase
          .from('notes')
          .upsert(
            {
              id: updated.id,
              title: updated.title,
              blocks: updated.blocks,
              last_edited: new Date(updated.lastEdited).toISOString(),
            },
            { onConflict: 'id' }
          )
          .then(({ error }) => {
            if (error) console.error('Failed to update note in Supabase:', error);
          });
      }
      return next;
    });
  }, []);

  return (
    <NotesContext.Provider value={{ notes, isLoading, createNote, deleteNote, updateNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within NotesProvider');
  return context;
}
