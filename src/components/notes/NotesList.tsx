import React from 'react';
import { FileText, Clock, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotes, Note } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';

interface NotesListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ searchQuery, setSearchQuery }) => {
  const { activeFolder, activeNote, setActiveNote, getNotesForFolder, folders } = useNotes();

  const notes = getNotesForFolder(activeFolder).filter(note => {
    if (!searchQuery) return true;
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getFolderName = () => {
    if (activeFolder === 'all') return 'All Notes';
    const folder = folders.find(f => f.id === activeFolder);
    return folder?.name || 'Notes';
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-card-foreground">{getFolderName()}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes found</p>
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200",
                activeNote?.id === note.id
                  ? "bg-accent"
                  : "hover:bg-muted"
              )}
            >
              <h3 className={cn(
                "font-medium truncate text-sm",
                activeNote?.id === note.id
                  ? "text-accent-foreground"
                  : "text-card-foreground"
              )}>
                {note.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {stripHtml(note.content).slice(0, 60) || 'Empty note'}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
