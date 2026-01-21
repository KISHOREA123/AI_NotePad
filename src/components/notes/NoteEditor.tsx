import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2,
  Trash2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotes } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';
import AISummarizer from './AISummarizer';

const NoteEditor: React.FC = () => {
  const { activeNote, updateNote, deleteNote } = useNotes();
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef('');

  useEffect(() => {
    if (activeNote && editorRef.current) {
      setTitle(activeNote.title);
      editorRef.current.innerHTML = activeNote.content;
      contentRef.current = activeNote.content;
    }
  }, [activeNote]);

  // Auto-save simulation
  useEffect(() => {
    if (!activeNote) return;

    const timer = setTimeout(() => {
      const currentContent = contentRef.current;
      if (title !== activeNote.title || currentContent !== activeNote.content) {
        setIsSaving(true);
        updateNote(activeNote.id, { title, content: currentContent });
        setTimeout(() => {
          setIsSaving(false);
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, activeNote, updateNote]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
    }
  };

  const handleDelete = () => {
    if (activeNote) {
      deleteNote(activeNote.id);
    }
  };

  if (!activeNote) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-1">No note selected</p>
          <p className="text-sm">Select a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-border bg-card flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('bold')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('italic')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('formatBlock', 'h1')}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('formatBlock', 'h2')}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('insertUnorderedList')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('insertOrderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFormat('formatBlock', 'blockquote')}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        {/* Save indicator */}
        <div className={cn(
          "text-xs text-muted-foreground flex items-center gap-1 transition-opacity",
          isSaving ? "opacity-100" : "opacity-0"
        )}>
          <Save className="w-3 h-3 animate-pulse-soft" />
          Saving...
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
          />
          
          <div
            ref={editorRef}
            contentEditable
            dir="ltr"
            suppressContentEditableWarning
            className={cn(
              "min-h-[300px] focus:outline-none prose prose-sm max-w-none",
              "prose-headings:text-foreground prose-p:text-foreground",
              "prose-strong:text-foreground prose-em:text-foreground",
              "prose-ul:text-foreground prose-ol:text-foreground",
              "prose-blockquote:border-primary prose-blockquote:text-muted-foreground",
              "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
              "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3",
              "[&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3",
              "[&_blockquote]:pl-4 [&_blockquote]:italic"
            )}
            onInput={handleContentChange}
            onBlur={handleContentChange}
          />
        </div>
      </div>

      {/* AI Summarizer */}
      <AISummarizer content={contentRef.current} />
    </div>
  );
};

export default NoteEditor;
