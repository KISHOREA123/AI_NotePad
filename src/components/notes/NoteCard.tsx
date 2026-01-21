import React from 'react';
import { FileText, Clock, Folder, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/hooks/useTags';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  isActive?: boolean;
  viewMode: 'grid' | 'list';
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, isActive, viewMode }) => {
  const { folders, togglePin } = useNotes();
  const { getTagsForNote } = useTags();

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const folder = folders.find(f => f.id === note.folderId);
  const tags = getTagsForNote(note.id);

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(note.id);
  };

  if (viewMode === 'list') {
    return (
      <Card
        onClick={onClick}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isActive && "ring-2 ring-primary",
          note.isPinned && "border-primary/50 bg-primary/5"
        )}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 relative">
            <FileText className="w-5 h-5 text-primary" />
            {note.isPinned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Pin className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-card-foreground truncate">{note.title}</h3>
              {note.isPinned && (
                <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {stripHtml(note.content).slice(0, 100) || 'Empty note'}
            </p>
            {tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {tags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
            {folder && (
              <span className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                {folder.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        isActive && "ring-2 ring-primary",
        note.isPinned && "border-primary/50 bg-primary/5"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 relative">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          {note.isPinned && (
            <button
              onClick={handlePinClick}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Pin className="w-4 h-4 text-primary fill-primary" />
            </button>
          )}
        </div>
        <h3 className="font-medium text-card-foreground line-clamp-1">{note.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {stripHtml(note.content).slice(0, 80) || 'Empty note'}
        </p>
        {tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {tags.slice(0, 2).map(tag => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs px-1.5 py-0"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          {folder ? (
            <span className="flex items-center gap-1">
              <Folder className="w-3 h-3" />
              {folder.name}
            </span>
          ) : (
            <span>No folder</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
