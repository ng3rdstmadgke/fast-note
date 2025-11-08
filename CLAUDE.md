# fast-note

## プロジェクト概要

**fast-note** は、ローカルのメモ帳で作業記録を取っている作業を代替するために開発されたWebアプリケーションです。シンプルで高速なメモ管理を実現し、日々の作業記録を効率的に管理することを目的としています。

- **プロジェクトタイプ**: 個人プロジェクト
- **開発段階**: 初期段階（UI設計・プロトタイプフェーズ）
- **主なユースケース**: 作業記録の作成・管理・検索

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.1 | React フレームワーク（App Router） |
| React | 19.2.0 | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | - | UIコンポーネントライブラリ |
| Radix UI | - | アクセシブルなプリミティブコンポーネント |
| Lucide React | 0.553.0 | アイコンライブラリ |

### バックエンド

| 技術 | 用途 |
|------|------|
| Next.js Server Actions | サーバーサイド処理（APIサーバーレス構成） |
| PostgreSQL | メインデータベース |
| Keycloak | アイデンティティプロバイダー（IdP） |
| NextAuth.js (Auth.js) | OIDC認証クライアント |

### 開発ツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| pnpm | - | パッケージマネージャ |
| ESLint | 9.x | コード品質管理 |
| TypeScript | 5.x | 静的型チェック |

### インフラストラクチャ

| 技術 | 用途 |
|------|------|
| AWS EKS | Kubernetes クラスタ（本番環境） |
| AWS ECR | コンテナレジストリ |
| Terraform | Infrastructure as Code |
| GitHub Actions | CI（継続的インテグレーション） |
| ArgoCD | CD（継続的デリバリー）※将来的に導入 |
| kubectl | 初期デプロイメント（手動） |
| Docker | コンテナ化 |

### ローカル開発環境

| サービス | ポート | 用途 |
|---------|--------|------|
| PostgreSQL | 5432 | メインデータベース |
| Keycloak | 8080 | 認証・認可（Identity Provider） |
| MySQL | 3306 | （オプション） |
| Redis | 6379 | キャッシュ・セッション管理 |
| RabbitMQ | 15672 | メッセージキュー |
| LocalStack | 4566 | AWS サービスエミュレーション |

## 機能要件

### MVP機能（v1.0）

1. **メモ管理**
   - メモの作成
   - メモの編集
   - メモの削除
   - メモの一覧表示

2. **タグ機能**
   - メモにタグを設定
   - タグの自動登録（メモに設定したタグが自動的にタグマスターに追加）
   - タグによるフィルタリング

3. **検索機能**
   - メモタイトルでの検索
   - メモ本文での検索
   - タグでの検索

4. **認証機能**
   - ユーザーログイン
   - ユーザー登録
   - セッション管理

### 将来的な機能拡張

- マークダウンエディタ
- メモのバージョン管理
- メモの共有機能
- リアルタイム同期
- モバイルアプリ対応
- メモのエクスポート（Markdown, PDF）
- ダークモード
- キーボードショートカット

## アーキテクチャ設計

### システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                       ユーザー                           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js App                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         App Router (Pages)                      │   │
│  │  - /login    - /memos    - /search              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         NextAuth.js (Auth.js)                   │   │
│  │  - OIDC認可コードフロー                          │   │
│  │  - セッション管理（JWT）                         │   │
│  │  - ミドルウェア認証                              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Server Actions                          │   │
│  │  - createMemo    - updateMemo                   │   │
│  │  - deleteMemo    - searchMemos                  │   │
│  │  - getTags                                      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         UI Components (shadcn/ui)               │   │
│  │  - Button    - Input    - Card                  │   │
│  │  - Dialog    - Select   - Toast                 │   │
│  └─────────────────────────────────────────────────┘   │
└───────────┬─────────────────────┬───────────────────────┘
            │                     │ OIDC/OAuth 2.0
            │ SQL Queries         │
            ▼                     ▼
┌────────────────────┐   ┌────────────────────────────────┐
│   PostgreSQL       │   │        Keycloak                │
│    Database        │   │   (Identity Provider)          │
│                    │   │                                │
│ - memos            │   │ - ユーザー管理                  │
│ - tags             │   │ - 認証・認可                    │
│ - memo_tags        │   │ - OIDC/OAuth 2.0               │
└────────────────────┘   │ - セッション管理                │
                         │ - トークン発行                  │
                         └────────────────────────────────┘
```

### 認証フロー（OIDC認可コードフロー）

```
1. ユーザーが保護されたページにアクセス
   ▼
2. NextAuth.js が未認証を検知
   ▼
3. Keycloak ログインページへリダイレクト
   ▼
4. ユーザーがKeycloakでログイン（ID/パスワード入力）
   ▼
5. Keycloak が認可コードを発行
   ▼
6. ブラウザが認可コードとともにNext.jsのコールバックURLへリダイレクト
   ▼
7. NextAuth.js が認可コードをアクセストークン・IDトークンと交換
   ▼
8. NextAuth.js がJWTセッションを作成（Cookie）
   ▼
9. ユーザーをダッシュボードへリダイレクト
   ▼
10. 以降のリクエストではJWTセッションで認証
```

### データフロー（メモ作成）

```
1. ユーザーがメモ作成フォームを入力
   ▼
2. フォーム送信（React Hook Form）
   ▼
3. Server Action: createMemo()
   ▼
4. バリデーション
   ▼
5. PostgreSQLにINSERT（memos テーブル）
   ▼
6. タグの自動登録（tags テーブル）
   ▼
7. メモとタグの関連付け（memo_tags テーブル）
   ▼
8. クライアントへレスポンス（Revalidate）
   ▼
9. UI更新（React Server Components）
```

## データベース設計（案）

### ER図

```mermaid
erDiagram
    users ||--o{ memos : "has"
    memos }o--o{ memo_tags : "has"
    tags ||--o{ memo_tags : "has"

    users {
        varchar keycloak_user_id PK "KeycloakのユーザーID"
        varchar email UK
        varchar name
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }

    memos {
        uuid id PK
        varchar user_id FK "KeycloakのユーザーID"
        varchar title
        text content
        timestamp created_at
        timestamp updated_at
    }

    tags {
        uuid id PK
        varchar name UK
        timestamp created_at
        timestamp updated_at
    }

    memo_tags {
        uuid memo_id PK_FK
        uuid tag_id PK_FK
        timestamp created_at
    }
```

### テーブル定義

#### users テーブル

Keycloakから取得したユーザー情報をキャッシュするテーブルです。

```sql
CREATE TABLE users (
    keycloak_user_id VARCHAR(255) PRIMARY KEY, -- KeycloakのユーザーID（sub claim）
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**注意**: パスワードはKeycloakで管理されるため、このテーブルには保存しません。

#### memos テーブル

```sql
CREATE TABLE memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(keycloak_user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memos_user_id ON memos(user_id);
CREATE INDEX idx_memos_title ON memos(title);
CREATE INDEX idx_memos_created_at ON memos(created_at DESC);
-- 全文検索用インデックス（PostgreSQL の GIN インデックス）
CREATE INDEX idx_memos_content_search ON memos USING gin(to_tsvector('japanese', content));
CREATE INDEX idx_memos_title_search ON memos USING gin(to_tsvector('japanese', title));
```

#### tags テーブル

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);
```

#### memo_tags テーブル（中間テーブル）

```sql
CREATE TABLE memo_tags (
    memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (memo_id, tag_id)
);

CREATE INDEX idx_memo_tags_tag_id ON memo_tags(tag_id);
```

## ディレクトリ構造

```
/workspaces/fast-note/
├── app/                          # Next.js アプリケーション
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホームページ
│   │   ├── globals.css           # グローバルスタイル
│   │   ├── (auth)/               # 認証グループ
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (dashboard)/          # ダッシュボードグループ
│   │       ├── memos/
│   │       │   ├── page.tsx      # メモ一覧
│   │       │   ├── [id]/         # メモ詳細・編集
│   │       │   └── new/          # メモ作成
│   │       └── search/
│   ├── components/               # コンポーネント
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   ├── memo/                 # メモ関連コンポーネント
│   │   ├── auth/                 # 認証関連コンポーネント
│   │   └── layout/               # レイアウトコンポーネント
│   ├── lib/                      # ユーティリティ・ヘルパー
│   │   ├── utils.ts              # 汎用ユーティリティ
│   │   ├── db.ts                 # データベース接続
│   │   ├── auth.ts               # 認証ロジック
│   │   └── validations.ts        # バリデーション
│   ├── actions/                  # Server Actions
│   │   ├── memo-actions.ts
│   │   ├── auth-actions.ts
│   │   └── tag-actions.ts
│   ├── types/                    # TypeScript 型定義
│   │   ├── memo.ts
│   │   ├── user.ts
│   │   └── tag.ts
│   ├── public/                   # 静的ファイル
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── components.json
├── figma/                        # Figma デザインサンプル
├── bin/                          # ユーティリティスクリプト
│   ├── postgresql.sh
│   ├── mysql.sh
│   ├── redis.sh
│   └── localstack.sh
├── docker/                       # Docker 設定
│   └── app/
│       └── Dockerfile
├── terraform/                    # Terraform 設定（予定）
│   ├── modules/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── main.tf
├── k8s/                          # Kubernetes マニフェスト（予定）
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── secrets.yaml
├── .github/                      # GitHub Actions（予定）
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docs/                         # ドキュメント
│   ├── local_service.md
│   └── memo.md
├── README.md
└── claude.md                     # このファイル
```

## 開発環境セットアップ

### 前提条件

- Node.js 20.x 以上
- pnpm 8.x 以上
- Docker と Docker Compose
- PostgreSQL 15 以上（ローカル開発用）

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd fast-note
```

2. **依存関係のインストール**

```bash
cd app
pnpm install
```

3. **PostgreSQL の起動**

```bash
cd /workspaces/fast-note
./bin/postgresql.sh
```

PostgreSQL 接続情報:
- ホスト: localhost
- ポート: 5432
- データベース: sample
- ユーザー: app
- パスワード: root1234

4. **Keycloak の起動**

```bash
# Dockerで起動（開発モード）
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

Keycloak 管理画面:
- URL: http://localhost:8080
- ユーザー: admin
- パスワード: admin

**初回セットアップ**: Keycloak管理画面で以下を設定
1. Realmを作成: `fast-note`
2. Clientを作成: `fast-note-web`（confidential, OIDC）
3. Valid Redirect URIs: `http://localhost:3000/api/auth/callback/keycloak`
4. Client Secretを取得してメモ

5. **環境変数の設定**

`app/.env.local` ファイルを作成:

```env
# Database
DATABASE_URL="postgresql://app:root1234@localhost:5432/sample"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
AUTH_TRUST_HOST="true"

# Keycloak
KEYCLOAK_CLIENT_ID="fast-note-web"
KEYCLOAK_CLIENT_SECRET="your-client-secret-from-keycloak"
KEYCLOAK_ISSUER="http://localhost:8080/realms/fast-note"
```

シークレットキーの生成:
```bash
openssl rand -base64 32
```

6. **データベースマイグレーション**

```bash
# マイグレーションツール導入後に実行
pnpm db:migrate
```

7. **開発サーバーの起動**

```bash
cd app
pnpm dev
```

アプリケーションが http://localhost:3000 で起動します。

### その他のローカルサービス

必要に応じて以下のサービスを起動できます：

```bash
# Redis（セッション管理・キャッシュ用）
./bin/redis.sh

# RabbitMQ（メッセージキュー用）
./bin/rabbitmq.sh

# LocalStack（AWS サービスエミュレーション用）
./bin/localstack.sh
```

## 開発フロー & ガイドライン

### コーディング規約

#### TypeScript

- **厳格な型定義**: `any` の使用を避け、適切な型を定義する
- **型推論の活用**: 明示的な型注釈が不要な場合は省略する
- **Interface vs Type**: 拡張性が必要な場合は `interface`、それ以外は `type` を使用

#### React / Next.js

- **Server Components 優先**: デフォルトで Server Components を使用し、必要な場合のみ Client Components (`"use client"`) を使用
- **Server Actions**: データの変更操作は Server Actions を使用
- **命名規則**:
  - コンポーネント: PascalCase (`MemoList.tsx`)
  - Server Actions: camelCase + "Action" サフィックス (`createMemoAction`)
  - ファイル名: kebab-case または PascalCase
- **コンポーネント構成**:
  - 1ファイル1コンポーネントを原則とする
  - 複雑なコンポーネントは適切に分割する

#### スタイリング

- **Tailwind CSS**: ユーティリティクラスを優先
- **shadcn/ui**: 既存のコンポーネントを最大限活用
- **カスタムスタイル**: `globals.css` で定義されたCSSカスタムプロパティを使用

### Git ワークフロー

#### ブランチ戦略

- `main`: 本番環境用（常にデプロイ可能な状態）
- `develop`: 開発用メインブランチ（将来的に導入）
- `feature/*`: 機能開発用
- `bugfix/*`: バグ修正用
- `hotfix/*`: 緊急修正用

#### コミットメッセージ規約

Conventional Commits 形式を採用:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: バグ修正も機能追加もしないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

**例:**

```
feat(memo): メモ作成機能を追加

- メモ作成フォームの実装
- Server Action による DB 保存処理
- バリデーションの実装

Closes #123
```

### コードレビュー

- Pull Request 作成時には必ず以下を確認:
  - [ ] TypeScript のビルドエラーがないこと
  - [ ] ESLint のエラーがないこと
  - [ ] 意図した動作をすること
  - [ ] 適切なコミットメッセージが書かれていること

## デプロイメント

### デプロイメントフロー

```
1. コード変更 & コミット
   ▼
2. GitHub へプッシュ
   ▼
3. GitHub Actions（CI）
   - Lint チェック
   - TypeScript ビルド
   - テスト実行
   - Docker イメージビルド
   - ECR へプッシュ
   ▼
4. 【手動 kubectl】（初期フェーズ）
   kubectl apply -f k8s/
   ▼
5. 【ArgoCD】（将来的に）
   - Git リポジトリを監視
   - 自動デプロイメント
   ▼
6. EKS クラスタにデプロイ
```

### AWS リソース構成（予定）

#### Terraform で管理するリソース

- **VPC**: プライベート・パブリックサブネット
- **EKS Cluster**: Kubernetes クラスタ
- **RDS PostgreSQL**: マネージドデータベース
- **ECR**: コンテナレジストリ
- **ALB**: アプリケーションロードバランサー
- **Route53**: DNS 管理
- **ACM**: SSL/TLS 証明書
- **CloudWatch**: ログ・メトリクス監視
- **Secrets Manager**: 機密情報管理

### 初期デプロイメント手順（kubectl）

1. **Docker イメージのビルド**

```bash
cd /workspaces/fast-note
docker build -f docker/app/Dockerfile -t fast-note:latest ./app
```

2. **ECR へのプッシュ**

```bash
# ECR ログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com

# タグ付け
docker tag fast-note:latest <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/fast-note:latest

# プッシュ
docker push <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/fast-note:latest
```

3. **kubectl によるデプロイ**

```bash
# EKS クラスタへの接続設定
aws eks update-kubeconfig --region ap-northeast-1 --name fast-note-cluster

# Kubernetes リソースのデプロイ
kubectl apply -f k8s/

# デプロイメント状況の確認
kubectl get pods
kubectl get services
```

4. **動作確認**

```bash
# サービスのURLを取得
kubectl get ingress
```

### CI/CD パイプライン（GitHub Actions）

#### CI ワークフロー (.github/workflows/ci.yml)

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: cd app && pnpm install
      - run: cd app && pnpm lint
      - run: cd app && pnpm build

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: ap-northeast-1
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push Docker image
        run: |
          docker build -f docker/app/Dockerfile -t fast-note:${{ github.sha }} ./app
          docker tag fast-note:${{ github.sha }} $ECR_REGISTRY/fast-note:${{ github.sha }}
          docker tag fast-note:${{ github.sha }} $ECR_REGISTRY/fast-note:latest
          docker push $ECR_REGISTRY/fast-note:${{ github.sha }}
          docker push $ECR_REGISTRY/fast-note:latest
```

## 認証実装

### 認証アーキテクチャ

**fast-note** では、Keycloak をアイデンティティプロバイダー（IdP）として使用し、OIDC（OpenID Connect）の認可コードフローで認証を行います。

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │  Next.js    │         │  Keycloak   │
│   (User)    │         │  (Client)   │         │    (IdP)    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. Access Protected  │                       │
       │     Page              │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  2. Redirect to       │                       │
       │     Keycloak Login    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  3. Login Form        │                       │
       ├───────────────────────────────────────────────>│
       │                       │                       │
       │  4. Auth Code         │                       │
       │<───────────────────────────────────────────────┤
       │                       │                       │
       │  5. Callback with     │                       │
       │     Auth Code         │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  6. Exchange Code     │
       │                       │     for Tokens        │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │  7. ID Token +        │
       │                       │     Access Token      │
       │                       │<──────────────────────┤
       │                       │                       │
       │  8. Set Session       │                       │
       │     & Redirect        │                       │
       │<──────────────────────┤                       │
       │                       │                       │
```

### 技術スタック

- **Keycloak**: エンタープライズグレードのOSSアイデンティティプロバイダー
- **NextAuth.js (Auth.js)**: Next.js向け認証ライブラリ
- **OIDC認可コードフロー**: セキュアな認証フロー

### メリット

- **セキュリティ**: Keycloakは実績のあるセキュアな認証基盤
- **標準準拠**: OIDC/OAuth 2.0に準拠
- **柔軟性**: ソーシャルログイン、多要素認証、シングルサインオン等の拡張が容易
- **ユーザー管理**: Keycloakの管理画面でユーザー管理が可能
- **スケーラビリティ**: クラスタリング対応

### NextAuth.js 実装例

```typescript
// app/auth.ts
import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER, // https://keycloak.example.com/realms/fast-note
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初回ログイン時にKeycloakから取得した情報をトークンに保存
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      if (profile) {
        token.id = profile.sub
      }

      return token
    },
    async session({ session, token }) {
      // セッションにユーザーIDとトークンを含める
      session.user.id = token.id as string
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
```

### API Route ハンドラー

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### ミドルウェアで保護

```typescript
// app/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isPublicPage = req.nextUrl.pathname === "/"

  if (!isAuthenticated && !isAuthPage && !isPublicPage) {
    // 未認証ユーザーをログインページにリダイレクト
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && isAuthPage) {
    // 認証済みユーザーをダッシュボードにリダイレクト
    return NextResponse.redirect(new URL("/memos", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### ログインボタンコンポーネント

```typescript
// app/components/auth/login-button.tsx
import { signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("keycloak", { redirectTo: "/memos" })
      }}
    >
      <Button type="submit">ログイン</Button>
    </form>
  )
}

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/" })
      }}
    >
      <Button type="submit" variant="outline">ログアウト</Button>
    </form>
  )
}
```

### セッション情報の取得

```typescript
// app/app/memos/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function MemosPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div>
      <h1>ようこそ、{session.user.name}さん</h1>
      {/* メモ一覧 */}
    </div>
  )
}
```

### Keycloak セットアップ

#### ローカル開発環境

```bash
# Keycloak をDockerで起動
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

#### Realm と Client の設定

1. **Realm の作成**
   - Keycloak管理画面（http://localhost:8080）にアクセス
   - 新しいRealmを作成: `fast-note`

2. **Client の作成**
   - Client ID: `fast-note-web`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/api/auth/callback/keycloak`
   - Web Origins: `http://localhost:3000`

3. **Client Secret の取得**
   - Credentials タブから Client Secret をコピー

4. **ユーザーの作成**
   - テストユーザーを作成し、パスワードを設定

## パフォーマンス最適化

### Next.js の最適化機能

- **Server Components**: デフォルトでサーバーサイドレンダリング
- **Streaming**: React Suspense による段階的レンダリング
- **Image Optimization**: next/image による自動最適化
- **Font Optimization**: next/font による自動フォント最適化

### データベースクエリ最適化

- **インデックス**: 検索対象カラムに適切なインデックスを設定
- **N+1問題の回避**: JOIN を使用した効率的なクエリ
- **全文検索**: PostgreSQL の `to_tsvector` / `to_tsquery` を使用
- **ページネーション**: LIMIT / OFFSET による結果の分割

### キャッシング戦略

- **Redis**: セッション、頻繁にアクセスされるデータのキャッシュ
- **Next.js キャッシュ**: `revalidate` オプションによる静的生成
- **CDN**: 静的アセットの配信

## セキュリティ

### 基本的なセキュリティ対策

- **SQL インジェクション対策**: パラメータ化クエリの使用
- **XSS 対策**: React の自動エスケープを活用
- **CSRF 対策**: Next.js の組み込み CSRF 保護
- **認証情報の保護**:
  - パスワードのハッシュ化（bcrypt / Argon2）
  - 環境変数による機密情報管理
  - AWS Secrets Manager の活用
- **HTTPS**: 本番環境では必須
- **セキュリティヘッダー**: next.config.ts で設定

```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ]
}
```

## テスト戦略

### テストの種類

1. **単体テスト**: ユーティリティ関数、バリデーション
2. **統合テスト**: Server Actions、データベース操作
3. **E2Eテスト**: Playwright によるブラウザテスト

### 推奨ツール

- **Jest**: 単体テスト
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト

## ロードマップ

### Phase 1: MVP開発（現在）

- [x] プロジェクト初期化
- [x] Next.js + shadcn/ui セットアップ
- [ ] データベース設計
- [ ] 認証機能実装
- [ ] メモCRUD機能実装
- [ ] タグ機能実装
- [ ] 検索機能実装
- [ ] 基本的なUI実装

### Phase 2: インフラ構築

- [ ] Terraform による AWS リソース構築
- [ ] EKS クラスタのセットアップ
- [ ] RDS PostgreSQL のセットアップ
- [ ] CI/CD パイプライン構築
- [ ] 初回デプロイ

### Phase 3: 機能拡張

- [ ] マークダウンエディタ
- [ ] メモのバージョン管理
- [ ] タグの階層構造
- [ ] 高度な検索（全文検索）
- [ ] メモのエクスポート機能

### Phase 4: UX改善

- [ ] ダークモード
- [ ] キーボードショートカット
- [ ] レスポンシブデザイン最適化
- [ ] パフォーマンス最適化

### Phase 5: 運用改善

- [ ] ArgoCD 導入
- [ ] 監視・アラート設定
- [ ] ログ収集・分析
- [ ] バックアップ戦略

## トラブルシューティング

### よくある問題

#### PostgreSQL 接続エラー

```bash
# PostgreSQL コンテナが起動しているか確認
docker ps | grep postgres

# コンテナを再起動
./bin/postgresql.sh
```

#### pnpm install エラー

```bash
# キャッシュをクリア
pnpm store prune

# 再インストール
pnpm install
```

#### Next.js ビルドエラー

```bash
# .next ディレクトリを削除
rm -rf app/.next

# 再ビルド
cd app && pnpm build
```

## 参考リンク

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)

### チュートリアル

- [Next.js Learn](https://nextjs.org/learn)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com)
- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## 更新履歴

- 2025-11-08: 初版作成
