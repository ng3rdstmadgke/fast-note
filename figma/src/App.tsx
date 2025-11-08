import React, { useState, useMemo } from 'react';
import { Search, Plus, User, LogOut } from 'lucide-react';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { NoteListItem } from './components/NoteListItem';
import { NoteDetail } from './components/NoteDetail';
import { LoginScreen } from './components/LoginScreen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';

interface Note {
  id: number;
  title: string;
  tags: string[];
  body: string;
  createdAt: string;
}

// Mock data
const initialNotes: Note[] = [
  {
    id: 1,
    title: 'Project Ideas',
    tags: ['work', 'brainstorm'],
    body: 'Some exciting ideas for the next quarter:\n\n1. Redesign the dashboard\n2. Improve mobile experience\n3. Add dark mode support\n4. Implement real-time collaboration',
    createdAt: 'November 8, 2025'
  },
  {
    id: 2,
    title: 'Meeting Notes - Design Review',
    tags: ['work', 'meeting'],
    body: 'Discussed the new design system:\n- Color palette looks great\n- Need to adjust spacing tokens\n- Typography needs refinement\n- Team approved overall direction',
    createdAt: 'November 7, 2025'
  },
  {
    id: 3,
    title: 'Book Recommendations',
    tags: ['personal', 'reading'],
    body: 'Books to read:\n- Atomic Habits by James Clear\n- The Design of Everyday Things\n- Thinking, Fast and Slow\n- Deep Work by Cal Newport',
    createdAt: 'November 5, 2025'
  },
  {
    id: 4,
    title: 'Weekly Goals',
    tags: ['personal', 'goals'],
    body: 'Goals for this week:\n- Complete the dashboard redesign\n- Exercise 4 times\n- Read for 30 minutes daily\n- Meal prep for the week',
    createdAt: 'November 4, 2025'
  },
  {
    id: 5,
    title: 'Travel Plans',
    tags: ['personal', 'travel'],
    body: 'Summer vacation ideas:\n- Japan (Tokyo, Kyoto)\n- Iceland\n- New Zealand\n- Portugal\n\nNeed to book flights by March.',
    createdAt: 'November 1, 2025'
  },
  {
    id: 6,
    title: 'Recipe: Pasta Carbonara',
    tags: ['cooking', 'recipes'],
    body: 'Ingredients:\n- 400g spaghetti\n- 200g pancetta\n- 4 egg yolks\n- 100g Parmesan\n- Black pepper\n- Salt\n\nCook pasta, crisp pancetta, mix eggs and cheese, combine everything while hot.',
    createdAt: 'October 30, 2025'
  },
  {
    id: 7,
    title: 'Workout Routine',
    tags: ['personal', 'fitness'],
    body: 'New workout split:\n\nMonday - Upper body\nTuesday - Lower body\nWednesday - Rest\nThursday - Push\nFriday - Pull\nWeekend - Active recovery',
    createdAt: 'October 28, 2025'
  },
  {
    id: 8,
    title: 'App Feature Ideas',
    tags: ['work', 'brainstorm'],
    body: 'Features to consider:\n- Advanced search with filters\n- Note templates\n- Collaboration features\n- Export to PDF\n- Voice notes\n- Note linking',
    createdAt: 'October 25, 2025'
  }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('田中太郎');
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  // Get all unique tags from all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter notes based on search query and selected tag
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

  const handleUpdateNote = (field: keyof Note, value: string | string[]) => {
    if (!selectedNoteId) return;
    
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === selectedNoteId
          ? { ...note, [field]: value }
          : note
      )
    );
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => note.id !== selectedNoteId);
      
      // Select the first note if available, otherwise null
      if (updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0].id);
      } else {
        setSelectedNoteId(null);
      }
      
      return updatedNotes;
    });
  };

  const confirmDeleteNote = () => {
    if (!noteToDelete) return;
    
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => note.id !== noteToDelete);
      
      // If the deleted note was selected, select the first remaining note
      if (noteToDelete === selectedNoteId) {
        setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
      
      return updatedNotes;
    });
    
    setNoteToDelete(null);
  };

  const noteToDeleteData = notes.find(note => note.id === noteToDelete);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Math.max(...notes.map(n => n.id), 0) + 1,
      title: '',
      tags: [],
      body: '',
      createdAt: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
    
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
    setSearchQuery('');
    setSelectedTag(null);
  };

  const handleLogin = (newUsername: string) => {
    setUsername(newUsername);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <h1 className="text-gray-900">Fast Notes</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer outline-none">
                <span className="text-gray-700">{username}</span>
                <Avatar className="h-8 w-8 bg-gray-100">
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2" size={16} />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* New Note Button */}
        <div className="p-4 pb-2">
          <Button
            onClick={handleCreateNote}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus size={18} className="mr-2" />
            New Note
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-10 bg-white border-gray-200 focus:border-gray-300"
            />
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Tag Filters */}
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? 'default' : 'outline'}
              className={`cursor-pointer ${
                selectedTag === null
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Notes List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No notes found
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  title={note.title}
                  date={note.createdAt}
                  isSelected={note.id === selectedNoteId}
                  onClick={() => setSelectedNoteId(note.id)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note.id);
                  }}
                />
              ))
            )}
            </div>
          </ScrollArea>
        </div>
      </div>

        {/* Right Panel - Note Detail */}
        <div className="flex-1 bg-white">
          <NoteDetail note={selectedNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
        </div>
      </div>

      {/* Delete Confirmation Dialog for List Items */}
      <AlertDialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note "{noteToDeleteData?.title || 'Untitled'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
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
