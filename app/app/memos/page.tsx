"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/memo/sidebar";
import { NoteDetail } from "@/components/memo/note-detail";
import { useState } from "react";

// Sample data
const sampleNotes = [
  {
    id: "1",
    title: "プロジェクトのアイデア",
    content:
      "新しいメモアプリを作成する。Keycloakで認証を実装し、Next.jsとPostgreSQLを使用する。",
    tags: ["アイデア", "プロジェクト"],
    date: "2025/01/15",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "今日のタスク",
    content:
      "1. デザインレビュー\n2. データベース設計\n3. API実装\n4. テストコード作成",
    tags: ["タスク", "作業"],
    date: "2025/01/20",
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "3",
    title: "技術メモ",
    content:
      "Next.js 16では、Server Actionsが標準になった。認証はNextAuth.jsを使うと簡単。",
    tags: ["技術", "メモ"],
    date: "2025/01/18",
    createdAt: "2025-01-18T14:45:00Z",
  },
  {
    id: "4",
    title: "会議メモ",
    content:
      "デザインミーティングの議事録。UIはミニマルに保つ。グレースケールを基調とする。",
    tags: ["会議", "デザイン"],
    date: "2025/01/22",
    createdAt: "2025-01-22T15:30:00Z",
  },
];

export default function MemosPage() {
  const [notes, setNotes] = useState(sampleNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(
    sampleNotes[0]?.id
  );

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const handleNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "",
      content: "",
      tags: [],
      date: new Date().toLocaleDateString("ja-JP"),
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote: any) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("このノートを削除してもよろしいですか？")) {
      setNotes(notes.filter((note) => note.id !== noteId));
      setSelectedNoteId(notes[0]?.id);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout with NextAuth
    alert("ログアウト機能は準備中です");
  };

  return (
    <>
      {/* Header */}
      <Header
        user={{ name: "テストユーザー", email: "test@example.com" }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onNoteSelect={setSelectedNoteId}
          onNewNote={handleNewNote}
        />

        {/* Main Panel */}
        <NoteDetail
          note={selectedNote}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      </div>
    </>
  );
}
