常に日本語で応答してください。

コード生成、セットアップ手順、設定作業が必要な場合、またはライブラリ/APIのドキュメントを参照する必要がある場合は常にcontext7を使用してください。
これは、ライブラリIDの解決やライブラリドキュメントの取得において、明示的な指示がなくても自動的にContext7 MCPツールを使用するべきであることを意味します。


# fast-note

## プロジェクト概要

**fast-note** は、ローカルのメモ帳で作業記録を取っている作業を代替するために開発されたWebアプリケーションです。シンプルで高速なメモ管理を実現し、日々の作業記録を効率的に管理することを目的としています。


## ディレクトリ構造

```
/workspaces/fast-note/
├── app/                          # Next.js アプリケーション
│   ├── app/                      # App Router
│   ├── components/               # コンポーネント
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   ├── note/                 # メモ関連コンポーネント
│   │   └── layout/               # レイアウトコンポーネント
│   ├── lib/                      # ユーティリティ・ヘルパー
│   │   ├── utils.ts              # 汎用ユーティリティ
│   │   ├── db.ts                 # データベース接続
│   │   ├── auth.ts               # 認証ロジック
│   │   └── validations.ts        # バリデーション
│   ├── actions/                  # Server Actions
│   │   └── main.ts
│   ├── prisma/                   # TypeScript 型定義
│   │   ├── migrations/           # Prisma マイグレーションファイル
│   │   ├── schema.prisma         # Prisma スキーマ定義
│   │   └── seed.ts               # 初期データ投入スクリプト
│   ├── public/                   # 静的ファイル
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── components.json
├── figma/                        # Figma デザインサンプル
├── bin/                          # ユーティリティスクリプト
├── docker/                       # Dockerfile 置き場
├── k8s/                          # Kubernetes マニフェスト
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── secrets.yaml
├── .github/                      # GitHub Actions
├── docs/                         # ドキュメント関連
│   ├── local_service.md
│   └── memo.md
├── README.md
└── CLAUDE.md                     # このファイル
```

## テーブル設計

app/prisma/schema.prisma を参照

## 開発環境

開発環境はDevContainerを使用してセットアップします。

- `.devcontainer/Dockerfile` `.devcontainer/devcontainer.json` に定義されているすべてのツールがインストールされた状態でコンテナが起動します。

### 開発環境の構築

docs/developers_guide.md を参照してください。

### 開発用のローカルサービス

`PostgreSQL` `MySQL` `Redis` `RabbitMQ` `LocalStack` などのローカルサービスを起動・操作する場合は `docs/local_service.md` を参照してください。


## 認証

**fast-note** では、Keycloak をアイデンティティプロバイダー（IdP）として使用し、OIDC（OpenID Connect）の認可コードフローで認証を行います。
