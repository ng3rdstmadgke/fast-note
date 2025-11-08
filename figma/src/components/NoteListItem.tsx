import React from 'react';
import { Trash2 } from 'lucide-react';

interface NoteListItemProps {
  title: string;
  date: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function NoteListItem({ title, date, isSelected, onClick, onDelete }: NoteListItemProps) {
  return (
    <div
      className={`group relative w-full px-4 py-3 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-gray-100 border border-gray-200' 
          : 'bg-white hover:bg-gray-50 border border-transparent'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full text-left"
      >
        <div className="flex flex-col gap-1 pr-6">
          <div className={isSelected ? 'text-gray-900' : 'text-gray-700'}>
            {title || 'Untitled'}
          </div>
          <div className="text-gray-400 text-sm">
            {date}
          </div>
        </div>
      </button>
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
