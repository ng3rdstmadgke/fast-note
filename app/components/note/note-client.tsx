"use client";

import { Sidebar } from "@/components/note/sidebar";
import { NoteDetail } from "@/components/note/note-detail";
import { useEffect, useState } from "react";
import { ListNotesSchema, ListTagsSchema, GetNoteByIdSchema, getNoteById } from "@/actions/main";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export default function NotesPage({notesFromDB, tagsFromDB}: {notesFromDB: ListNotesSchema[], tagsFromDB: ListTagsSchema[]}) {
  const [notes, setNotes] = useState(notesFromDB);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(
    notesFromDB[0]?.id
  );
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<GetNoteByIdSchema | null>(null); 
  const [isLoading, setIsLoading] = useState(false);

  // サイドバーで選択されたノートIDが変わったときに詳細を取得
  useEffect(() => {
    if (!selectedNoteId) return;
    const fetchNoteDetail = async () => {
      setIsLoading(true);
      const detail = await getNoteById(selectedNoteId);
      setSelectedNoteDetail(detail);
      //console.log("Fetching detail:", selectedNoteDetail);
      setIsLoading(false);
    };
    fetchNoteDetail();

  }, [selectedNoteId]);

  // ノートの新規作成
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

  // ノートの更新
  const handleUpdateNote = (note: Note ) => {
    if (!selectedNoteDetail) return;
    const updatedNote = {
      ...selectedNoteDetail,
      title: note.title ?? selectedNoteDetail.title,
      // tags: tags ?? selectedNoteDetail.tags,
      content: note.content ?? selectedNoteDetail.content,
    };
    setSelectedNoteDetail(updatedNote);
  };

  // ノートの削除
  const handleDeleteNote = (noteId: string) => {
    if (confirm("このノートを削除してもよろしいですか？")) {
      setNotes(notes.filter((note) => note.id !== noteId));
      setSelectedNoteId(notes[0]?.id);
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          notes={notes}
          tags={tagsFromDB}
          selectedNoteId={selectedNoteId}
          onNoteSelect={setSelectedNoteId}
          onNewNote={handleNewNote}
        />

        {/* Main Panel */}
        <NoteDetail
          note={selectedNoteDetail}
          onDelete={handleDeleteNote}
        />
      </div>
    </>
  );
}
