"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

interface SidebarProps {
  notes?: Note[];
  selectedNoteId?: string;
  onNoteSelect?: (noteId: string) => void;
  onNewNote?: () => void;
}

export function Sidebar({
  notes = [],
  selectedNoteId,
  onNoteSelect,
  onNewNote,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // タグの抽出
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  // フィルタリング
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 space-y-3">
        {/* New Note Button */}
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          onClick={onNewNote}
        >
          <Plus className="mr-2 h-4 w-4" />
          新しいノート
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ノートを検索..."
            className="pl-9 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag Filters */}
        <ScrollArea className="h-30 px-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === "All"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setSelectedTag("All")}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Note List */}
      <ScrollArea className="flex-1 h-0 px-4">
        <div className="space-y-2 pb-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {searchQuery || selectedTag !== "All"
                ? "該当するノートがありません"
                : "ノートがありません"}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                className={`group relative w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  selectedNoteId === note.id
                    ? "bg-gray-100 border border-gray-200"
                    : "bg-white hover:bg-gray-50 border border-transparent"
                }`}
                onClick={() => onNoteSelect?.(note.id)}
              >
                <div className="flex flex-col gap-1">
                  <div
                    className={`font-medium text-sm line-clamp-1 ${
                      selectedNoteId === note.id
                        ? "text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {note.title || "無題のノート"}
                  </div>
                  <div className="text-gray-400 text-xs">{note.date}</div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
