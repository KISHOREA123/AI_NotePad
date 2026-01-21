import React from 'react';
import { Trash2, RotateCcw, Trash, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RecycleBin: React.FC = () => {
  const { getDeletedNotes, restoreNote, permanentlyDeleteNote } = useNotes();
  const deletedNotes = getDeletedNotes();

  const handleRestore = (id: string) => {
    restoreNote(id);
  };

  const handlePermanentDelete = (id: string) => {
    permanentlyDeleteNote(id);
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Recycle Bin</h1>
          </div>
          <p className="text-muted-foreground">
            {deletedNotes.length} {deletedNotes.length === 1 ? 'note' : 'notes'} in trash
          </p>
        </div>

        {/* Notes list */}
        {deletedNotes.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Trash is empty</h2>
            <p className="text-muted-foreground">Deleted notes will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deletedNotes.map((note, index) => (
              <div
                key={note.id}
                className="bg-card border border-border rounded-xl p-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground truncate">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {stripHtml(note.content).slice(0, 100) || 'Empty note'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deleted {note.deletedAt && formatDistanceToNow(new Date(note.deletedAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(note.id)}
                      className="gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Restore</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                        >
                          <Trash className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete note?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The note "{note.title}" will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePermanentDelete(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecycleBin;
