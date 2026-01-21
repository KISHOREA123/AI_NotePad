import React, { useState, useRef } from 'react';
import { Tag, Plus, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags, Tag as TagType } from '@/hooks/useTags';

interface TagManagerProps {
  noteId: string;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const TagManager: React.FC<TagManagerProps> = ({ noteId }) => {
  const { tags, getTagsForNote, createTag, addTagToNote, removeTagFromNote } = useTags();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [open, setOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const noteTags = getTagsForNote(noteId);
  const availableTags = tags.filter(t => !noteTags.find(nt => nt.id === t.id));

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim(), selectedColor);
    if (tag) {
      await addTagToNote(noteId, tag.id);
      setNewTagName('');
    }
  };

  const handleAddTag = async (tagId: string) => {
    await addTagToNote(noteId, tagId);
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromNote(noteId, tagId);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {noteTags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs pl-2 pr-1 py-0.5 flex items-center gap-1"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="hover:bg-black/10 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
            <Tag className="w-3 h-3" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Existing tags */}
            {availableTags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Existing tags</p>
                <div className="flex flex-wrap gap-1">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer text-xs hover:opacity-80 transition-opacity"
                      style={{ borderColor: tag.color, color: tag.color }}
                      onClick={() => handleAddTag(tag.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Create new tag */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Create new tag</p>
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                }}
              />
              <div className="flex gap-1 items-center">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
                <input
                  ref={colorInputRef}
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="sr-only"
                />
                <button
                  className={`w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-muted-foreground transition-colors ${!TAG_COLORS.includes(selectedColor) ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: !TAG_COLORS.includes(selectedColor) ? selectedColor : 'transparent' }}
                  onClick={() => colorInputRef.current?.click()}
                  title="Custom color"
                >
                  {TAG_COLORS.includes(selectedColor) && <Palette className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Tag
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagManager;
