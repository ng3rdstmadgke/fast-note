'use server';

import { prisma } from '@/lib/prisma';
import { Note, Tag, Prisma } from '@/lib/generated/prisma/client';
import { auth } from '@/auth';
import { get } from 'http';

export type ListNotesSchema = Prisma.NoteGetPayload<{
  include: { tags: true },
  omit: { content: true },
}>

export type ListTagsSchema = Prisma.TagGetPayload<{
  select: {
    id: true,
    name: true,
  }
}>

export type GetNoteByIdSchema = Prisma.NoteGetPayload<{
  include: { tags: true },
}>


async function getOrCreateUser(): Promise<{id: string}> {
  const session = await auth();
  if (!session || !session.user?.email) {
    throw new Error("User not authenticated");
  }

  // ユーザーが存在しない場合は作成
  let user = await prisma.user.findUnique({
    where: { id: session.user.email },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.email,
        name: session.user.name || session.user.email.replace(/@.*/, ""),
        email: session.user.email,
      },
    });
  }
  return user
}




export async function listNotes(): Promise<ListNotesSchema[]> {
  const user = await getOrCreateUser();

  return await prisma.note.findMany({
    where: { userId: user.id },
    include: { tags: true},
    omit: { content: true },  // contentを除外
    orderBy: { createdAt: 'desc' },
  })
}

export async function listTags(): Promise<ListTagsSchema[]> {
  const user = await getOrCreateUser();

  return await prisma.tag.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
    }
  })
}

export async function getNoteById(noteId: string): Promise<GetNoteByIdSchema | null> {
  const user = await getOrCreateUser();

  return await prisma.note.findUnique({
    where: {userId: user.id, id: noteId},
    include: { tags: true },
  });
}

export async function createNote(): Promise<{id: string}> {
  const user = await getOrCreateUser();

  return await prisma.note.create({
    data: {
      userId: user.id,
      title: "新しいノート",
      content: "",
    },
  });
}

async function deleteOrphanTags(userId: string): Promise<void> {
  // 孤立したタグの削除
  await prisma.tag.deleteMany({
    where: {
      userId: userId,
      notes: {
        // notesに関連付けられていないタグを削除: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#filter-on-absence-of--to-many-records
        none: {}
      }
    }
  })
}

export async function updateNote(noteId: string, title: string, tags: string, content: string): Promise<{success: boolean, error?: string}> {
  try {
    const user = await getOrCreateUser();

    const tagList = tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
    await prisma.note.update({
      where: { id: noteId, userId: user.id },
      data: {
        title,
        content,
        tags: {
          // 既存の関連付けを一旦クリア: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#disconnect-all-related-records
          set: [],
          // リレーションを接続または作成: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-or-create-a-record
          connectOrCreate: tagList.map(tagName => ({
            where: {
              userId_name: {
                userId: user.id,
                name: tagName
              }
            },
            create: {
              userId: user.id,
              name: tagName
            },
          })),
        },
      },
    })

    // 孤立したタグの削除
    await deleteOrphanTags(user.id);

    return { success: true };
  } catch (error) {
    console.error('Failed to update note:', error);
    return { success: false, error: 'ノートの保存に失敗しました' };
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  const user = await getOrCreateUser();

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete
  await prisma.note.delete({
    where: { id: noteId, userId: user.id },
  });

  // 孤立したタグの削除
  await deleteOrphanTags(user.id);
}
