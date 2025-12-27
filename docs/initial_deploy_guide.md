# EKS デプロイメントガイド

このガイドでは、fast-noteアプリケーションをAWS EKS（Elastic Kubernetes Service）にデプロイする手順を説明します。

## 目次

1. [コンテナイメージのビルド](#コンテナイメージのビルド)
2. [Kubernetesマニフェストの設定](#kubernetesマニフェストの設定)
3. [デプロイメント](#デプロイメント)
4. [動作確認](#動作確認)
5. [運用](#運用)

## コンテナイメージのビルド

### 1. GitHub Personal Access Token の作成

[コンテナレジストリの利用 | GitHub](https://docs.github.com/ja/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

1. GitHub の Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" をクリック
3. 必要な権限を選択:
   - `write:packages` - パッケージのアップロード
   - `read:packages` - パッケージの読み取り
4. トークンを生成してコピー

### 2. 環境変数の設定

`.devcontainer/.env`

```bash
GITHUB_OWNER=your-github-username
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_EMAIL=your-github-email
```

```bash
source ~/.bashrc
```

### 3. GHCRへのログイン

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_OWNER --password-stdin
```

### 4. イメージのビルドとプッシュ


#### ビルド

```bash
./bin/build-image.sh -t latest
```

起動確認

```bash
docker run --rm -ti \
  --name fast-note-test \
  --network $DOCKER_NETWORK \
  --env-file $PROJECT_DIR/app/.env \
  -e AUTH_TRUST_HOST=true \
  -p 3000:3000 \
  fast-note:latest
```

- `fast-note-test:3000` でポートフォワーディング
- ブラウザで `http://localhost:3000` にアクセスして動作確認


プロジェクトルートで以下のコマンドを実行：

```bash
# 本番環境用（latestタグ）
./bin/push-image.sh  -t latest
```

## Kubernetesマニフェストの設定

### 1. Secretファイルの作成

環境ごとにSecretファイルを作成します。

```bash
STAGE=prod
cd k8s/overlays/$STAGE
cp secret.yaml.example secret.yaml
vim secret.yaml
```

`secret.yaml` の例:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fast-note-secrets
  namespace: fast-note-prod
type: Opaque
stringData:
  # PostgreSQL接続情報
  database-url: "postgresql://DB_USER:DB_PASSWORD@$DB_HOST:$DB_PORT/fastnote"

  # NextAuth.js設定
  nextauth-url: "https://fast-note.prd.baseport.net"
  nextauth-secret: "GENERATE_WITH_openssl_rand_base64_32"

  # Keycloak設定
  keycloak-client-id: "fast-note-web-prod"
  keycloak-client-secret: "YOUR_KEYCLOAK_CLIENT_SECRET"
  keycloak-issuer: "https://keycloak.prd.baseport.net/realms/REALM_NAME"
```

**NextAuth Secretの生成:**

```bash
openssl rand -base64 32
```

**PostgreSQL接続情報の取得**

```bash
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id /baseport/prd/postgresql-common | jq -r ".SecretString")
DB_USER=$(echo $DB_SECRET | jq -r ".db_user")
DB_PASSWORD=$(echo $DB_SECRET | jq -r ".db_password")
DB_HOST=$(echo $DB_SECRET | jq -r ".db_host")
DB_PORT=$(echo $DB_SECRET | jq -r ".db_port")
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/fastnote"

echo $DB_URL

# DBの作成
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d baseport
> CREATE DATABASE fastnote;
```

### 2. Kustomization.yamlの編集

各環境の `kustomization.yaml` を編集してプレースホルダーを置き換えます。

`k8s/overlays/$STAGE/kustomization.yaml`

```yaml
images:
  - name: fast-note
    newName: ghcr.io/your-username/fast-note
    newTag: latest
```

### 4. マニフェストのビルド確認

デプロイ前に生成されるマニフェストを確認します：

```bash
kubectl kustomize k8s/overlays/$STAGE
```

## デプロイメント

### 1. Namespaceの作成

```bash
kubectl create namespace fast-note-$STAGE
```

### 2. アプリケーションSecretのデプロイ

```bash
kubectl apply -f k8s/overlays/${STAGE}/secret.yaml
```

### 3. GHCR Image Pull Secretの作成

プライベートリポジトリの場合のみ必要

```bash
# 本番環境
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_OWNER \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=$GITHUB_EMAIL \
  -n fast-note-$STAGE
```

### 4. アプリケーションのデプロイ

Kustomizeを使用してデプロイします：

```bash
kubectl apply -k k8s/overlays/$STAGE
```


## 動作確認

### 1. ヘルスチェック

Port Forwardでローカルから確認：

```bash
# Port Forward
kubectl port-forward -n fast-note-$STAGE svc/$STAGE-fast-note 3000:80

# 別のターミナルで
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"2025-11-24T15:02:02.041Z","database":"connected"}
```

### 4. ブラウザでアクセス

- https://fast-note.prd.baseport.net/
