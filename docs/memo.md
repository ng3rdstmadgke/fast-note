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