# Next.js プロジェクト作成
https://nextjs.org/docs/app/getting-started/installation

```bash
pnpm create next-app@latest app --yes
cd app
pnpm dev
```

# shadcnインストール

https://ui.shadcn.com/docs/installation/next

```bash
cd app
pnpm dlx shadcn@latest init
```

コンポーネントの追加

```bash
pnpm dlx shadcn@latest add button
```

`app/page.tsx` を編集して動作確認してください。

```tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```


### shadcn/ui の設定ファイル `components.json` 

https://ui.shadcn.com/docs/components-json


- 主な設定項目
  - `$schema`: スキーマ定義のURL（shadcn/ui公式のスキーマ）
  - `style`: コンポーネントのスタイルバリアント（"new-york" または "default"）
  - `rsc`: React Server Components を使用するかどうか
  - `tsx`: TypeScript を使用するかどうか
- Tailwind CSS 設定
  - `config`: Tailwind設定ファイルのパス
  - `css`: グローバルCSSファイルのパス
  - `baseColor`: ベースカラー（"neutral"）
  - `cssVariables`: CSS変数を使用するかどうか
  - `prefix`: クラス名のプレフィックス
- その他
  - `iconLibrary`: 使用するアイコンライブラリ（"lucide"）
  - `aliases`: パスエイリアスの定義（@/components, @/libなど）
  - `registries`: カスタムコンポーネントレジストリの設定

# DBマイグレーション


```bash
# Prisma & Client
pnpm add -D prisma
pnpm add @prisma/client
npm add -D dotenv

# 初期化（datasource を postgresql に）
npx prisma init --datasource-provider postgresql
```

モデルの実装

`app/prisma/schema.prisma` を編集してモデルを定義します。

環境変数にDATABASE_URLを設定します。

`app/.env` ファイルに以下を追加します。


```bash
DATABASE_URL="postgresql://app:root1234@fast-note-sample-postgresql:5432/sample?schema=public"
```

`app/prisma.config.ts` を編集して環境変数を読み込みます。

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// ...
```

マイグレーションの実行

```bash
# マイグレーションファイルの作成
#   --name: マイグレーション名
pnpm prisma migrate dev --name init --create-only

# マイグレーションの適用
pnpm prisma migrate deploy

# マイグレーションのリセット
pnpm prisma migrate reset
```

# DBのseedデータ投入

https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding

## TypeScriptのランタイムとして `tsx` をインストールします。

```bash
pnpm add -D tsx
```

### サンプル

`tmp/hello.ts`

```ts
let hello: string = "Hello, Fast Note!";
console.log(hello);
```
```bash
pnpm tsx ${PROJECT_DIR}/tmp/hello.ts
# Hello, Fast Note!
```

## コマンドの設定

`package.json` に以下を追加します。

```json
{
  "scripts": {
    // pnpm seed でシードを実行する
    "seed": "prisma db seed",
  },
  "prisma": {
    // prisma db seed コマンドで実行されるスクリプトを指定する
    "seed": "tsx prisma/seed.ts"
  }
}

```

[Prisma Client Reference - PrismaClient](https://www.prisma.io/docs/orm/reference/prisma-client-reference)


`app/prisma/seed.ts`

```ts
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
```


```bash
pnpm seed
```