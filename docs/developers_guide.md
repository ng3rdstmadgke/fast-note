# 開発環境の起動

## DBのセットアップ

DBの起動

```bash
./bin/postgresql.sh
```

ログイン

```bash
CONTAINER_NAME=${PROJECT_NAME}-sample-postgresql
PGPASSWORD=root1234 psql -U app -h ${CONTAINER_NAME} -d sample -p 5432
```

環境変数ファイルの作成

```bash
cp .devcontainer/.env.example .devcontainer/.env
```

- `AUTH_KEYCLOAK_ID` `AUTH_KEYCLOAK_SECRET` `AUTH_KEYCLOAK_ISSUER` を設定


マイグレーション

```bash
(cd app && pnpm prisma migrate deploy)
```

初期データ投入

```bash
(cd app && pnpm seed)
```

## アプリの起動

```bash
# 開発環境
(cd app && pnpm dev)
```