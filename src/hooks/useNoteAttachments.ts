import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Attachment {
  id: string;
  noteId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export const useNoteAttachments = (noteId: string | null) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!noteId || !user) return;

    const { data, error } = await supabase
      .from('note_attachments')
      .select('*')
      .eq('note_id', noteId);

    if (error) {
      console.error('Error fetching attachments:', error);
      return;
    }

    const withUrls = data.map(a => {
      const { data: urlData } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(a.file_path);

      return {
        id: a.id,
        noteId: a.note_id,
        fileName: a.file_name,
        filePath: a.file_path,
        fileType: a.file_type,
        fileSize: a.file_size,
        url: urlData.publicUrl,
      };
    });

    setAttachments(withUrls);
  }, [noteId, user]);

  const uploadAttachment = async (file: File): Promise<Attachment | null> => {
    if (!noteId || !user) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${noteId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data, error: insertError } = await supabase
        .from('note_attachments')
        .insert({
          note_id: noteId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const { data: urlData } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(filePath);

      const attachment: Attachment = {
        id: data.id,
        noteId: data.note_id,
        fileName: data.file_name,
        filePath: data.file_path,
        fileType: data.file_type,
        fileSize: data.file_size,
        url: urlData.publicUrl,
      };

      setAttachments(prev => [...prev, attachment]);
      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (!attachment) return;

    const { error: storageError } = await supabase.storage
      .from('note-attachments')
      .remove([attachment.filePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    const { error } = await supabase
      .from('note_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('Error deleting attachment:', error);
      return;
    }

    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  return {
    attachments,
    uploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
