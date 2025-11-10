'use server';

import { prisma } from '@/lib/prisma';

export async function listNotes() {
  const user = await prisma.user.findUnique({ where: { id: "keita.midorikawa"}});
  return await prisma.note.findMany({
    where: { userId: user?.id },
    include: { noteTags: { include: { tag: true } } },
  })
}