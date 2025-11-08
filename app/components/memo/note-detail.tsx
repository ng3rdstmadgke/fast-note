"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface NoteDetailProps {
  note?: Note | null;
  onUpdate?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteDetail({ note, onUpdate, onDelete }: NoteDetailProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(note?.tags.join(", ") || "");

  // Auto-save when values change (debounced in real implementation)
  const handleUpdate = () => {
    if (note && onUpdate) {
      onUpdate({
        ...note,
        title,
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }
  };

  if (!note) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-gray-400">ノートが選択されていません</p>
          <p className="text-sm text-gray-300">
            左のリストからノートを選択するか、新しいノートを作成してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col">
      <div className="flex flex-col h-full p-6 space-y-3">
        {/* Title and Delete Button */}
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="タイトル"
            className="flex-1 text-lg font-medium border-gray-200 focus:border-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => note && onDelete?.(note.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Tags */}
        <Input
          type="text"
          placeholder="タグ (カンマ区切り)"
          className="border-gray-200 focus:border-gray-300"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={handleUpdate}
        />

        {/* Content */}
        <Textarea
          placeholder="ノートの内容を入力..."
          className="flex-1 resize-none border-gray-200 focus:border-gray-300 min-h-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleUpdate}
        />

        {/* Created Date */}
        <div className="text-xs text-gray-400">
          作成日時: {new Date(note.createdAt).toLocaleString("ja-JP")}
        </div>
      </div>
    </div>
  );
}
