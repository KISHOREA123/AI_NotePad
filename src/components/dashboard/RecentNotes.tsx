import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import { useNotes, Note } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const RecentNotes: React.FC = () => {
  const { getRecentNotes, setActiveNote, folders } = useNotes();
  const navigate = useNavigate();
  const recentNotes = getRecentNotes(5);

  const getFolderColor = (folderId: string | null) => {
    if (!folderId) return '#0d9488';
    const folder = folders.find(f => f.id === folderId);
    return folder?.color || '#0d9488';
  };

  const handleNoteClick = (note: Note) => {
    setActiveNote(note);
    navigate('/notes');
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-muted-foreground" />
        Recent Notes
      </h2>
      
      <div className="space-y-2">
        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          recentNotes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className={cn(
                "w-full text-left p-4 rounded-xl bg-card border border-border",
                "hover:border-primary/30 hover:shadow-soft transition-all duration-200",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getFolderColor(note.folderId) }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-card-foreground truncate">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {stripHtml(note.content).slice(0, 100)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentNotes;
