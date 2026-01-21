import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DbNote = Tables<'notes'>;
type DbFolder = Tables<'folders'>;

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  isPinned: boolean;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  activeNote: Note | null;
  activeFolder: string;
  loading: boolean;
  setActiveNote: (note: Note | null) => void;
  setActiveFolder: (folderId: string) => void;
  createNote: (folderId?: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  createFolder: (name: string, icon: string, color: string) => Promise<void>;
  getNotesForFolder: (folderId: string) => Note[];
  getRecentNotes: (limit?: number) => Note[];
  getDeletedNotes: () => Note[];
  getNotesForDate: (date: Date) => Note[];
  refreshNotes: () => Promise<void>;
  refreshFolders: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const mapDbNoteToNote = (dbNote: DbNote): Note => ({
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content || '',
    folderId: dbNote.folder_id,
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    isDeleted: dbNote.is_deleted,
    deletedAt: dbNote.deleted_at ? new Date(dbNote.deleted_at) : undefined,
    isPinned: dbNote.is_pinned || false,
  });

  const mapDbFolderToFolder = (dbFolder: DbFolder): Folder => ({
    id: dbFolder.id,
    name: dbFolder.name,
    icon: dbFolder.icon || 'Folder',
    color: dbFolder.color || 'default',
  });

  const refreshNotes = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data.map(mapDbNoteToNote));
  }, [user]);

  const refreshFolders = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
      return;
    }

    setFolders(data.map(mapDbFolderToFolder));
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setNotes([]);
        setFolders([]);
        setActiveNote(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([refreshNotes(), refreshFolders()]);
      setLoading(false);
    };

    loadData();
  }, [user, refreshNotes, refreshFolders]);

  const createNote = async (folderId?: string): Promise<Note | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: 'Untitled Note',
        content: '<p>Start writing...</p>',
        folder_id: folderId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    const newNote = mapDbNoteToNote(data);
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return;

    const dbUpdates: Partial<DbNote> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
    if (updates.isDeleted !== undefined) dbUpdates.is_deleted = updates.isDeleted;
    if (updates.deletedAt !== undefined) dbUpdates.deleted_at = updates.deletedAt?.toISOString() || null;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;

    const { error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating note:', error);
      return;
    }

    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );

    if (activeNote?.id === id) {
      setActiveNote(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteNote = async (id: string) => {
    await updateNote(id, { isDeleted: true, deletedAt: new Date() });
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
  };

  const togglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      await updateNote(id, { isPinned: !note.isPinned });
    }
  };

  const restoreNote = async (id: string) => {
    await updateNote(id, { isDeleted: false, deletedAt: undefined });
  };

  const permanentlyDeleteNote = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return;
    }

    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const createFolder = async (name: string, icon: string, color: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        icon,
        color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return;
    }

    setFolders(prev => [...prev, mapDbFolderToFolder(data)]);
  };

  const getNotesForFolder = (folderId: string): Note[] => {
    if (folderId === 'all') {
      return notes.filter(note => !note.isDeleted);
    }
    return notes.filter(note => note.folderId === folderId && !note.isDeleted);
  };

  const getRecentNotes = (limit: number = 5): Note[] => {
    return notes
      .filter(note => !note.isDeleted)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  };

  const getDeletedNotes = (): Note[] => {
    return notes.filter(note => note.isDeleted);
  };

  const getNotesForDate = (date: Date): Note[] => {
    return notes.filter(note => {
      const noteDate = new Date(note.updatedAt);
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear() &&
        !note.isDeleted
      );
    });
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        activeNote,
        activeFolder,
        loading,
        setActiveNote,
        setActiveFolder,
        createNote,
        updateNote,
        togglePin,
        deleteNote,
        restoreNote,
        permanentlyDeleteNote,
        createFolder,
        getNotesForFolder,
        getRecentNotes,
        getDeletedNotes,
        getNotesForDate,
        refreshNotes,
        refreshFolders,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
