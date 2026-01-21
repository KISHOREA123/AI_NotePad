import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useNotes } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';

const QuickNoteButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createNote } = useNotes();

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      console.log('Empty note: Please add a title or content.');
      return;
    }

    await createNote(title.trim() || 'Untitled Note');
    setTitle('');
    setContent('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-45"
        )}
        size="icon"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>

      {/* Quick Note Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-card border border-border rounded-xl shadow-medium z-50 animate-scale-in overflow-hidden">
          <div className="p-4 space-y-3">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
            />
            <Textarea
              placeholder="Start typing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setTitle('');
                  setContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickNoteButton;
