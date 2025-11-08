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
npx prisma migrate dev --name init --create-only

# マイグレーションの適用
npx prisma migrate deploy
```