import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
}

export const useTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<NoteTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
      return;
    }

    setTags(data.map(t => ({ id: t.id, name: t.name, color: t.color })));
  }, [user]);

  const fetchNoteTags = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('note_tags')
      .select('note_id, tag_id');

    if (error) {
      console.error('Error fetching note tags:', error);
      return;
    }

    setNoteTags(data.map(nt => ({ noteId: nt.note_id, tagId: nt.tag_id })));
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTags(), fetchNoteTags()]);
      setLoading(false);
    };
    load();
  }, [fetchTags, fetchNoteTags]);

  const createTag = async (name: string, color: string = '#6366f1'): Promise<Tag | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('tags')
      .insert({ user_id: user.id, name, color })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.error('Tag already exists');
      } else {
        console.error('Error creating tag:', error);
      }
      return null;
    }

    const newTag = { id: data.id, name: data.name, color: data.color };
    setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
    return newTag;
  };

  const deleteTag = async (tagId: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', tagId);
    if (error) {
      console.error('Error deleting tag:', error);
      return;
    }
    setTags(prev => prev.filter(t => t.id !== tagId));
    setNoteTags(prev => prev.filter(nt => nt.tagId !== tagId));
  };

  const addTagToNote = async (noteId: string, tagId: string) => {
    const { error } = await supabase
      .from('note_tags')
      .insert({ note_id: noteId, tag_id: tagId });

    if (error) {
      if (error.code !== '23505') {
        console.error('Error adding tag to note:', error);
      }
      return;
    }

    setNoteTags(prev => [...prev, { noteId, tagId }]);
  };

  const removeTagFromNote = async (noteId: string, tagId: string) => {
    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag_id', tagId);

    if (error) {
      console.error('Error removing tag from note:', error);
      return;
    }

    setNoteTags(prev => prev.filter(nt => !(nt.noteId === noteId && nt.tagId === tagId)));
  };

  const getTagsForNote = (noteId: string): Tag[] => {
    const tagIds = noteTags.filter(nt => nt.noteId === noteId).map(nt => nt.tagId);
    return tags.filter(t => tagIds.includes(t.id));
  };

  return {
    tags,
    noteTags,
    loading,
    createTag,
    deleteTag,
    addTagToNote,
    removeTagFromNote,
    getTagsForNote,
    refreshTags: fetchTags,
  };
};
