# fast-note

## プロジェクト概要

**fast-note** は、ローカルのメモ帳で作業記録を取っている作業を代替するために開発されたWebアプリケーションです。シンプルで高速なノート管理を実現し、日々の作業記録を効率的に管理することを目的としています。

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

1. **ノート管理**
   - ノートの作成
   - ノートの編集
   - ノートの削除
   - ノートの一覧表示

2. **タグ機能**
   - ノートにタグを設定
   - タグの自動登録（ノートに設定したタグが自動的にタグマスターに追加）
   - タグによるフィルタリング

3. **検索機能**
   - ノートタイトルでの検索
   - ノート本文での検索
   - タグでの検索

4. **認証機能**
   - ユーザーログイン
   - ユーザー登録
   - セッション管理

### 将来的な機能拡張

- マークダウンエディタ
- ノートのバージョン管理
- ノートの共有機能
- リアルタイム同期
- モバイルアプリ対応
- ノートのエクスポート（Markdown, PDF）
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
│  │  - /login    - /notes    - /search              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         NextAuth.js (Auth.js)                   │   │
│  │  - OIDC認可コードフロー                          │   │
│  │  - セッション管理（JWT）                         │   │
│  │  - ミドルウェア認証                              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Server Actions                          │   │
│  │  - createNote    - updateNote                   │   │
│  │  - deleteNote    - searchNotes                  │   │
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
│ - notes            │   │ - ユーザー管理                  │
│ - tags             │   │ - 認証・認可                    │
│ - note_tags        │   │ - OIDC/OAuth 2.0               │
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

### データフロー（ノート作成）

```
1. ユーザーがノート作成フォームを入力
   ▼
2. フォーム送信（React Hook Form）
   ▼
3. Server Action: createNote()
   ▼
4. バリデーション
   ▼
5. PostgreSQLにINSERT（notes テーブル）
   ▼
6. タグの自動登録（tags テーブル）
   ▼
7. ノートとタグの関連付け（note_tags テーブル）
   ▼
8. クライアントへレスポンス（Revalidate）
   ▼
9. UI更新（React Server Components）
```

## データベース設計（案）

### ER図

```mermaid
erDiagram
    users ||--o{ notes : "has"
    notes }o--o{ note_tags : "has"
    tags ||--o{ note_tags : "has"

    users {
        varchar keycloak_user_id PK "KeycloakのユーザーID"
        varchar email UK
        varchar name
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }

    notes {
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

    note_tags {
        uuid note_id PK_FK
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

#### notes テーブル

```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(keycloak_user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_title ON notes(title);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
-- 全文検索用インデックス（PostgreSQL の GIN インデックス）
CREATE INDEX idx_notes_content_search ON notes USING gin(to_tsvector('japanese', content));
CREATE INDEX idx_notes_title_search ON notes USING gin(to_tsvector('japanese', title));
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

#### note_tags テーブル（中間テーブル）

```sql
CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
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

## 更新履歴

- 2025-11-08: 初版作成、プロジェクト名をFast Noteに更新、テーブル名をnotesに変更
