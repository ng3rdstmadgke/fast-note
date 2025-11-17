"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { updateNote, GetNoteByIdSchema } from "@/actions/main";
import { useDebouncedCallback } from "use-debounce";

interface NoteDetailProps {
  note: GetNoteByIdSchema | null;
  refreshSidebar: () => Promise<void>;
  onDelete?: (noteId: string) => void;
}

export function NoteDetail({ note, refreshSidebar, onDelete }: NoteDetailProps) {
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // noteが変わったときにローカルステートを更新
  useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setTags(note.tags.map(tag => tag.name).join(", "));
    setContent(note.content);
  }, [note]);

  const handleUpdate = useDebouncedCallback((value) => {
    if (!note) return;
    updateNote(note.id, title, tags, content);
    // サイドバーの情報も更新
    refreshSidebar();
  }, 1000);


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
  } else {
    return (
      <div className="flex-1 bg-white flex flex-col">
        <div className="flex flex-col h-full p-6 space-y-4">
          {/* Title and Delete Button */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-16">
              タイトル
            </label>
            <Input
              type="text"
              placeholder="タイトルを入力..."
              className="flex-1 text-lg font-medium border-gray-200 focus:border-gray-300"
              value={title}
              onChange={
                (e) => {
                  setTitle(e.target.value);
                  handleUpdate(e.target.value);
                }
              }
              //onBlur={handleUpdate}
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
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-16">
              タグ
            </label>
            <Input
              type="text"
              placeholder="タグをカンマ区切りで入力 (例: 仕事, アイデア)"
              className="flex-1 border-gray-200 focus:border-gray-300"
              value={tags}
              onChange={
                (e) => {
                  setTags(e.target.value);
                  handleUpdate(e.target.value);
                }
              }
              //onBlur={handleUpdate}
            />
          </div>

          {/* Content */}
          <Textarea
            placeholder="ノートの内容を入力..."
            className="flex-1 resize-none border-gray-200 focus:border-gray-300 min-h-0"
            value={content}
            onChange={
              (e) => {
                setContent(e.target.value);
                handleUpdate(e.target.value);
              }
            }
            //onBlur={handleUpdate}
          />

          {/* Created Date */}
          <div className="text-xs text-gray-400">
            作成日時: {new Date(note.createdAt).toLocaleString("ja-JP")}
          </div>
        </div>
      </div>
    );
  }

}
