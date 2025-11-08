import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Note {
  id: number;
  title: string;
  tags: string[];
  body: string;
  createdAt: string;
}

interface NoteDetailProps {
  note: Note | null;
  onUpdate: (field: keyof Note, value: string | string[]) => void;
  onDelete: () => void;
}

export function NoteDetail({ note, onUpdate, onDelete }: NoteDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a note to view details
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          id="title"
          value={note.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Enter note title"
          className="flex-1 border-gray-200 focus:border-gray-300"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <Input
        id="tags"
        value={note.tags.join(', ')}
        onChange={(e) => onUpdate('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
        placeholder="Tags (comma-separated)"
        className="border-gray-200 focus:border-gray-300"
      />

      <Textarea
        id="body"
        value={note.body}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder="Start writing your note..."
        className="flex-1 resize-none border-gray-200 focus:border-gray-300"
      />

      <div className="text-sm text-gray-400 pt-1">
        Created {note.createdAt}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note "{note.title || 'Untitled'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
