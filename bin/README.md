# bin/ - ユーティリティスクリプト

このディレクトリには、開発・運用で使用するユーティリティスクリプトが含まれています。

## コンテナイメージ管理

### build-image.sh

コンテナイメージのビルドとGitHub Container Registry (GHCR) へのプッシュを行います。

**基本的な使い方:**

```bash
# ビルドのみ（プッシュしない）
./bin/build-image.sh -o your-username -b

# ビルドしてGHCRにプッシュ
./bin/build-image.sh -o your-username -t v1.0.0 -p

# 開発用タグでビルド&プッシュ
./bin/build-image.sh -o your-username -t dev -p
```

**オプション:**

- `-h, --help`: ヘルプメッセージを表示
- `-t, --tag TAG`: イメージタグを指定（デフォルト: latest）
- `-o, --owner OWNER`: GitHubのユーザー名またはOrganization名（必須）
- `-p, --push`: ビルド後にGHCRにプッシュ
- `-b, --build-only`: ビルドのみ実行（プッシュしない）

**環境変数:**

- `GITHUB_OWNER`: GitHubのユーザー名またはOrganization名
- `GITHUB_TOKEN`: GitHub Personal Access Token（プッシュ時に必要）

**使用例:**

```bash
# 1. 環境変数を設定
export GITHUB_OWNER="your-username"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"

# 2. GHCRにログイン
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_OWNER --password-stdin

# 3. イメージをビルド＆プッシュ
./bin/build-image.sh -o $GITHUB_OWNER -t latest -p
```

### push-image.sh

`build-image.sh` のラッパースクリプトで、`--push` オプションをデフォルトで有効にします。

**使い方:**

```bash
# 開発環境用
./bin/push-image.sh -o your-username -t dev

# 本番環境用
./bin/push-image.sh -o your-username -t latest

# 特定バージョン
./bin/push-image.sh -o your-username -t v1.0.0
```

## ローカル開発環境

### postgresql.sh

PostgreSQL データベースをDockerコンテナで起動します。

```bash
./bin/postgresql.sh
```

**接続情報:**
- ホスト: localhost
- ポート: 5432
- データベース: sample
- ユーザー: app
- パスワード: root1234

### redis.sh

Redis をDockerコンテナで起動します。

```bash
./bin/redis.sh
```

### rabbitmq.sh

RabbitMQ をDockerコンテナで起動します。

```bash
./bin/rabbitmq.sh
```

### localstack.sh

LocalStack (AWS サービスエミュレーション) をDockerコンテナで起動します。

```bash
./bin/localstack.sh
```

## GitHub Personal Access Token の作成

GHCRへのプッシュには、適切な権限を持つGitHub Personal Access Tokenが必要です。

**必要な権限:**

- `write:packages` - パッケージのアップロード
- `read:packages` - パッケージの読み取り（オプション）
- `delete:packages` - パッケージの削除（オプション）

**作成手順:**

1. GitHub にログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token" → "Generate new token (classic)"
4. Token の名前を入力（例: "fast-note-ghcr"）
5. 必要な権限を選択:
   - `write:packages`
   - `read:packages`
6. "Generate token" をクリック
7. 生成されたトークンをコピー（再表示不可のため注意）

**トークンの保存:**

```bash
# ~/.bashrc または ~/.zshrc に追加
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

## CI/CD での使用

GitHub Actions でイメージをビルド＆プッシュする例:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main
      - develop

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./app
          file: ./docker/app/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## トラブルシューティング

### ログインエラー

```bash
Error response from daemon: Get https://ghcr.io/v2/: unauthorized
```

**解決方法:**

```bash
# トークンを再確認
echo $GITHUB_TOKEN

# 再ログイン
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### ビルドエラー

```bash
ERROR: failed to solve: failed to read dockerfile
```

**解決方法:**

Dockerfileのパスが正しいか確認してください。スクリプトはプロジェクトルートから実行される必要があります。

```bash
cd /workspaces/fast-note
./bin/build-image.sh -o your-username -t dev -p
```

### プッシュエラー

```bash
denied: permission_denied: write_package
```

**解決方法:**

1. GitHub Personal Access Token に `write:packages` 権限があるか確認
2. リポジトリがプライベートの場合、Organization の設定を確認
3. パッケージの可視性設定を確認（Settings → Packages）

## 参考リンク

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
