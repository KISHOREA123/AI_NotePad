import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2,
  Trash2, Save, X, Pin, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotes, Note } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';
import AISummarizer from './AISummarizer';
import AIWritingAssistant from './AIWritingAssistant';
import TagManager from './TagManager';
import ImageAttachments from './ImageAttachments';

interface NoteEditorSheetProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoteEditorSheet: React.FC<NoteEditorSheetProps> = ({ note, open, onOpenChange }) => {
  const { updateNote, deleteNote, togglePin } = useNotes();
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef('');

  useEffect(() => {
    if (note && editorRef.current) {
      setTitle(note.title);
      editorRef.current.innerHTML = note.content;
      contentRef.current = note.content;
    }
  }, [note, open]);

  useEffect(() => {
    if (!note || !open) return;
    const timer = setTimeout(() => {
      const currentContent = contentRef.current;
      if (title !== note.title || currentContent !== note.content) {
        setIsSaving(true);
        updateNote(note.id, { title, content: currentContent });
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, note, open, updateNote]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    setSelectedText(selection?.toString() || '');
  };

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
      onOpenChange(false);
    }
  };

  const handleInsertImage = (url: string) => {
    if (editorRef.current) {
      const img = `<img src="${url}" alt="attachment" style="max-width: 100%; margin: 8px 0; border-radius: 8px;" />`;
      document.execCommand('insertHTML', false, img);
      handleContentChange();
    }
  };

  const handleApplyAI = (text: string) => {
    document.execCommand('insertText', false, text);
    handleContentChange();
  };

  if (!note) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col bg-background/95 backdrop-blur-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Edit Note</SheetTitle>
        </SheetHeader>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent max-w-md"
          />
          <div className="flex items-center gap-2">
            <div className={cn("text-xs text-muted-foreground flex items-center gap-1.5 transition-opacity mr-2", isSaving ? "opacity-100" : "opacity-0")}>
              <Save className="w-3.5 h-3.5 animate-pulse" />
              <span>Saving...</span>
            </div>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", note.isPinned && "text-primary")} onClick={() => togglePin(note.id)}>
              <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-2 border-b border-border/50">
          <TagManager noteId={note.id} />
        </div>

        <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-b border-border/50">
          <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-muted/50 border border-border/50">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('bold')}><Bold className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('italic')}><Italic className="w-3.5 h-3.5" /></Button>
            <div className="w-px h-4 bg-border/50 mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('formatBlock', 'h1')}><Heading1 className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('formatBlock', 'h2')}><Heading2 className="w-3.5 h-3.5" /></Button>
            <div className="w-px h-4 bg-border/50 mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('insertUnorderedList')}><List className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('insertOrderedList')}><ListOrdered className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleFormat('formatBlock', 'blockquote')}><Quote className="w-3.5 h-3.5" /></Button>
          </div>
          <AIWritingAssistant onApply={handleApplyAI} selectedText={selectedText} />
        </div>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-2 w-fit">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="attachments"><Image className="w-3.5 h-3.5 mr-1.5" />Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 overflow-auto px-6 pb-6 mt-0">
            <div
              ref={editorRef}
              contentEditable
              dir="ltr"
              suppressContentEditableWarning
              className={cn(
                "min-h-[400px] focus:outline-none text-foreground leading-relaxed mt-4",
                "prose prose-sm max-w-none dark:prose-invert",
                "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
                "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3",
                "[&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4",
                "[&_img]:rounded-lg [&_img]:max-w-full"
              )}
              onInput={handleContentChange}
              onBlur={handleContentChange}
              onMouseUp={handleSelectionChange}
              onKeyUp={handleSelectionChange}
            />
          </TabsContent>
          
          <TabsContent value="attachments" className="flex-1 overflow-auto px-6 pb-6 mt-4">
            <ImageAttachments noteId={note.id} onInsertImage={handleInsertImage} />
          </TabsContent>
        </Tabs>

        <div className="border-t border-border/50">
          <AISummarizer content={contentRef.current} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NoteEditorSheet;
