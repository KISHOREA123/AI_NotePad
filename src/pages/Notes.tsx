import React, { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, List, Filter, SortAsc, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NoteCard from '@/components/notes/NoteCard';
import NoteEditorSheet from '@/components/notes/NoteEditorSheet';
import { useNotes, Note } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';

type SortOption = 'updated' | 'created' | 'title';
type ViewMode = 'grid' | 'list';

const Notes: React.FC = () => {
  const { notes, folders, createNote, activeFolder, setActiveFolder } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleCreateNote = async () => {
    const folderId = selectedFolder === 'all' ? undefined : selectedFolder;
    await createNote(folderId);
    // Find the newly created note and open it
    setTimeout(() => {
      const latestNote = notes[0];
      if (latestNote) {
        setSelectedNote(latestNote);
        setEditorOpen(true);
      }
    }, 100);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setEditorOpen(true);
  };

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes.filter(note => !note.isDeleted);

    // Filter by folder
    if (selectedFolder !== 'all') {
      result = result.filter(note => note.folderId === selectedFolder);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Sort - pinned notes first, then by selected sort option
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [notes, selectedFolder, searchQuery, sortBy]);

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-card-foreground">Notes</h1>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={handleCreateNote}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Folder Filter */}
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-[160px]">
                <FolderOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SortAsc className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="updated">Last Updated</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">Date Created</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex border border-border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-r-none",
                  viewMode === 'grid' && "bg-muted"
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-l-none",
                  viewMode === 'list' && "bg-muted"
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredAndSortedNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No notes found</p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          )}>
            {filteredAndSortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
                isActive={selectedNote?.id === note.id}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Editor Sheet */}
      <NoteEditorSheet
        note={selectedNote}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </div>
  );
};

export default Notes;
