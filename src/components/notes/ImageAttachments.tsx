import React, { useEffect, useRef } from 'react';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNoteAttachments, Attachment } from '@/hooks/useNoteAttachments';

interface ImageAttachmentsProps {
  noteId: string;
  onInsertImage?: (url: string) => void;
}

const ImageAttachments: React.FC<ImageAttachmentsProps> = ({ noteId, onInsertImage }) => {
  const { attachments, uploading, fetchAttachments, uploadAttachment, deleteAttachment } = useNoteAttachments(noteId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const attachment = await uploadAttachment(file);
    if (attachment && onInsertImage) {
      onInsertImage(attachment.url);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInsert = (attachment: Attachment) => {
    if (onInsertImage) {
      onInsertImage(attachment.url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Image className="w-4 h-4" />
          Images ({attachments.length})
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            Upload
          </Button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="relative group rounded-lg overflow-hidden border border-border bg-muted/30"
            >
              <img
                src={attachment.url}
                alt={attachment.fileName}
                className="w-full h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleInsert(attachment)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleInsert(attachment)}
                >
                  Insert
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteAttachment(attachment.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <p className="text-[10px] text-white truncate">{formatFileSize(attachment.fileSize)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <div className="text-center py-4 text-xs text-muted-foreground">
          No images attached
        </div>
      )}
    </div>
  );
};

export default ImageAttachments;
