import { PrismaClient } from "@/lib/generated/prisma/client";

// https://www.prisma.io/docs/orm/reference/prisma-client-reference
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main () {
  console.log("Seeding database...");

  // createMany: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismaclient
  await prisma.user.createMany({
    data: [
      {
        id: "keita.midorikawa",
        email: "keita.midorikawa@example.com",
        name: "Keita Midorikawa",
      },
      {
        id: "taro.yamada",
        email: "taro.yamada@example.com",
        name: "Taro Yamada"
      },
    ],
    skipDuplicates: true, // 既に同じID/uniqueキーがあればスキップ
  })

  console.log("Creating tags and notes...");

  // Keita Midorikawa のデータ
  const keitaTags = await Promise.all([
    prisma.tag.create({
      data: { userId: "keita.midorikawa", name: "作業記録" },
    }),
    prisma.tag.create({
      data: { userId: "keita.midorikawa", name: "バグ修正" },
    }),
    prisma.tag.create({
      data: { userId: "keita.midorikawa", name: "機能開発" },
    }),
    prisma.tag.create({
      data: { userId: "keita.midorikawa", name: "会議メモ" },
    }),
  ]);

  const keitaNotes = await Promise.all([
    prisma.note.create({
      data: {
        userId: "keita.midorikawa",
        title: "fast-noteプロジェクト立ち上げ",
        content: "# プロジェクト立ち上げ"
      },
    }),
    prisma.note.create({
      data: {
        userId: "keita.midorikawa",
        title: "データベーススキーマ設計",
        content: "# データベーススキーマ設計",
      },
    }),
    prisma.note.create({
      data: {
        userId: "keita.midorikawa",
        title: "認証実装方針",
        content: "# 認証実装方針"
      },
    }),
    prisma.note.create({
      data: {
        userId: "keita.midorikawa",
        title: "UI/UXデザイン方針",
        content: "# UI/UXデザイン方針"
      },
    }),
    prisma.note.create({
      data: {
        userId: "keita.midorikawa",
        title: "バグ: PostgreSQL接続エラー",
        content: "# バグ: PostgreSQL接続エラー"
      },
    }),
  ]);

  // Keita のメモにタグを関連付け
  await prisma.noteTag.createMany({
    data: [
      { noteId: keitaNotes[0].id, tagId: keitaTags[0].id }, // 立ち上げ -> 作業記録
      { noteId: keitaNotes[1].id, tagId: keitaTags[0].id }, // スキーマ設計 -> 作業記録
      { noteId: keitaNotes[1].id, tagId: keitaTags[2].id }, // スキーマ設計 -> 機能開発
      { noteId: keitaNotes[2].id, tagId: keitaTags[2].id }, // 認証 -> 機能開発
      { noteId: keitaNotes[3].id, tagId: keitaTags[0].id }, // UI/UX -> 作業記録
      { noteId: keitaNotes[4].id, tagId: keitaTags[1].id }, // バグ -> バグ修正
    ],
  });

  console.log("Seed data created successfully!");
  console.log(`- Created ${keitaTags.length} tags`);
  console.log(`- Created ${keitaNotes.length} notes`);
}

main()
  .then(async () => {
    console.log('Seeding done');
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });