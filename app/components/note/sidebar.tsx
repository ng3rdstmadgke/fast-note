"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { ListNotesSchema, ListTagsSchema } from "@/actions/main";

interface SidebarProps {
  notes?: ListNotesSchema[];
  tags?: ListTagsSchema[];
  selectedNoteId?: string;
  onNoteSelect?: (noteId: string) => void;
  onNewNote?: () => void;
  onDelete?: (noteId: string) => void;
}

export function Sidebar({
  notes = [],
  tags = [],
  selectedNoteId,
  onNoteSelect,
  onNewNote,
  onDelete,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // タグの抽出
  const allTags = tags.map(tag => tag.name).sort();

  // フィルタリング
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || note.tags.find(tag => tag.name === selectedTag);
    return matchesSearch && matchesTag;
  });

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-gray-200 bg-gray-50 flex flex-col h-full items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewNote}
          className="text-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full relative">
      <div className="p-4 space-y-3">
        {/* Header with New Note Button and Collapse Button */}
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            onClick={onNewNote}
          >
            <Plus className="mr-2 h-4 w-4" />
            新しいノート
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

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
              <div
                key={note.id}
                className={`group relative w-full px-4 py-3 rounded-lg transition-colors ${
                  selectedNoteId === note.id
                    ? "bg-gray-300 border border-gray-200"
                    : "bg-white hover:bg-gray-50 border border-transparent"
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => onNoteSelect?.(note.id)}
                >
                  <div className="flex flex-col gap-1 pr-8">
                    <div
                      className={`font-medium text-sm line-clamp-1 ${
                        selectedNoteId === note.id
                          ? "text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {note.title || "無題のノート"}
                    </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(note.createdAt).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  </div>
                </button>
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(note.id);
                  }}
                  className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
