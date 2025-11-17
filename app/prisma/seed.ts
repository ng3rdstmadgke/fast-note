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

  await prisma.note.create({
    data: {
      userId: "keita.midorikawa",
      title: "fast-noteプロジェクト立ち上げ",
      content: "# プロジェクト立ち上げ",
      tags: {
        // リレーションを接続または作成: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-or-create-a-record
        connectOrCreate: [
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "作業記録" } },
            create: { userId: "keita.midorikawa", name: "作業記録" },
          }
        ]
      }
    },
  }),
  await prisma.note.create({
    data: {
      userId: "keita.midorikawa",
      title: "データベーススキーマ設計",
      content: "# データベーススキーマ設計",
      tags: {
        connectOrCreate: [
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "作業記録" } },
            create: { userId: "keita.midorikawa", name: "作業記録" },
          },
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "機能開発" } },
            create: { userId: "keita.midorikawa", name: "機能開発" },
          }
        ]
      }
    },
  }),
  await prisma.note.create({
    data: {
      userId: "keita.midorikawa",
      title: "認証実装方針",
      content: "# 認証実装方針",
      tags: {
        connectOrCreate: [
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "機能開発" } },
            create: { userId: "keita.midorikawa", name: "機能開発" },
          }
        ]
      }
    },
  }),
  await prisma.note.create({
    data: {
      userId: "keita.midorikawa",
      title: "UI/UXデザイン方針",
      content: "# UI/UXデザイン方針",
      tags: {
        connectOrCreate: [
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "作業記録" } },
            create: { userId: "keita.midorikawa", name: "作業記録" },
          }
        ]
      }
    },
  }),
  await prisma.note.create({
    data: {
      userId: "keita.midorikawa",
      title: "バグ: PostgreSQL接続エラー",
      content: "# バグ: PostgreSQL接続エラー",
      tags: {
        connectOrCreate: [
          {
            where: { userId_name: { userId: "keita.midorikawa", name: "バグ修正" } },
            create: { userId: "keita.midorikawa", name: "バグ修正" },
          }
        ]
      }
    },
  }),

  console.log("Seed data created successfully!");
  const tags = await prisma.tag.findMany({ where: { userId: "keita.midorikawa" } });
  console.log(`- Created ${tags.length} tags`);
  const notes = await prisma.note.findMany({ where: { userId: "keita.midorikawa" } });
  console.log(`- Created ${notes.length} notes`);
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