# データベースマイグレーション手順

## 概要

fast-note では、EKS上でアプリケーション起動前に自動的にデータベースマイグレーションが実行されます。

## マイグレーション方式

### 1. Init Container方式（自動実行）

**推奨方式**: Deploymentの各Podが起動する前に自動的にマイグレーションを実行します。

#### 設定場所

Init Containerは `k8s/base/deployment.yaml` に定義されており、dev/prod両環境で共通して使用されます。

#### 仕組み

```yaml
# k8s/base/deployment.yaml
spec:
  template:
    spec:
      initContainers:
        - name: db-migration
          image: fast-note:latest
          command:
            - sh
            - -c
            - |
              echo "Starting database migration..."
              cd /app
              pnpm prisma migrate deploy
              echo "Migration completed successfully"
          envFrom:
            - configMapRef:
                name: fast-note-config
            - secretRef:
                name: fast-note-secrets
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: fast-note-secrets
                  key: database-url
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

#### メリット

- ✅ アプリケーションと同じDockerイメージを使用
- ✅ 環境変数・Secretを自動的に共有
- ✅ マイグレーション失敗時はPodが起動しない（安全）
- ✅ Kubernetes の標準機能のみで実現
- ✅ 各環境（dev/prod）で自動的に実行

#### デメリット

- ⚠️ 複数レプリカの場合、各Podで同時にマイグレーションが実行される
  - Prisma Migrate は冪等性があるため、通常は問題なし
  - ただし、同時実行によるロック競合の可能性あり

#### 動作フロー

```
1. kubectl apply でDeploymentを更新
   ▼
2. 新しいPodが作成される
   ▼
3. Init Container (db-migration) が起動
   ▼
4. Prisma Migrate が実行される
   ▼
   成功 → メインコンテナ起動
   失敗 → Pod起動失敗（自動リトライ）
```

### 2. Kubernetes Job方式（手動実行）

**特殊なケース用**: 手動でマイグレーションを実行したい場合に使用します。

#### 使用ケース

- 大規模なマイグレーション（ダウンタイムが必要）
- マイグレーション失敗時のロールバック
- 本番環境でのマイグレーション確認
- デバッグ目的

#### 実行方法

```bash
# 本番環境でマイグレーションJobを実行
kubectl apply -f k8s/overlays/prod/migration-job.yaml

# ログを確認
kubectl logs -f job/prod-db-migration -n fast-note-prod

# ジョブの状態確認
kubectl get job -n fast-note-prod

# ジョブの削除（手動）
kubectl delete job prod-db-migration -n fast-note-prod
```

#### 注意点

- Jobは `ttlSecondsAfterFinished: 3600` により、完了後1時間で自動削除されます
- 失敗時は最大3回リトライされます（`backoffLimit: 3`）

## マイグレーションの作成方法

### ローカル開発環境

```bash
cd /workspaces/fast-note/app

# 1. Prismaスキーマを編集
vim prisma/schema.prisma

# 2. マイグレーションファイルを生成
pnpm prisma migrate dev --name add_user_profile

# 3. 自動的にローカルDBに適用される
```

### 本番環境へのデプロイ

```bash
# 1. マイグレーションファイルをコミット
git add prisma/migrations/
git commit -m "feat(db): ユーザープロフィール機能を追加"

# 2. プッシュ
git push origin main

# 3. GitHub ActionsでDockerイメージがビルドされる

# 4. Kubernetesにデプロイ
kubectl apply -k k8s/overlays/prod/

# 5. Init Containerが自動的にマイグレーションを実行
kubectl logs -f deployment/prod-fast-note -c db-migration -n fast-note-prod
```

## トラブルシューティング

### マイグレーション失敗時の対処

#### 1. ログの確認

```bash
# Init Containerのログを確認
kubectl logs deployment/prod-fast-note -c db-migration -n fast-note-prod

# 前回のPodのログを確認
kubectl logs deployment/prod-fast-note -c db-migration -n fast-note-prod --previous
```

#### 2. マイグレーション状態の確認

手動でマイグレーション状態を確認する場合：

```bash
# 一時的なPodを起動してPrismaコマンドを実行
kubectl run -it --rm debug \
  --image=ghcr.io/ng3rdstmadgke/fast-note:latest \
  --env="DATABASE_URL=$(kubectl get secret fast-note-secrets -n fast-note-prod -o jsonpath='{.data.database-url}' | base64 -d)" \
  -n fast-note-prod \
  -- sh

# Pod内で実行
cd /app
pnpm prisma migrate status
pnpm prisma migrate resolve --help
```

#### 3. マイグレーションのロールバック

Prisma Migrate にはロールバック機能がないため、以下のいずれかの方法で対処：

**方法A: 新しいマイグレーションで修正**

```bash
# ローカルで修正用マイグレーションを作成
cd app
pnpm prisma migrate dev --name fix_previous_migration

# コミット & デプロイ
git add prisma/migrations/
git commit -m "fix(db): マイグレーションを修正"
git push origin main
kubectl apply -k k8s/overlays/prod/
```

**方法B: データベースを直接修正（最終手段）**

```bash
# RDS PostgreSQLに接続
kubectl run -it --rm psql-client \
  --image=postgres:15 \
  --env="PGPASSWORD=your-password" \
  -n fast-note-prod \
  -- psql -h your-rds-endpoint.ap-northeast-1.rds.amazonaws.com -U app -d fastnote

# PostgreSQL内で実行
\dt  -- テーブル一覧
SELECT * FROM "_prisma_migrations";  -- マイグレーション履歴
-- 必要に応じてテーブルを修正
```

### 同時実行によるロック競合

複数レプリカで同時にマイグレーションが実行され、ロック競合が発生する場合：

```bash
# レプリカ数を一時的に1に減らす
kubectl scale deployment prod-fast-note --replicas=1 -n fast-note-prod

# マイグレーション完了後、元に戻す
kubectl scale deployment prod-fast-note --replicas=3 -n fast-note-prod
```

または、手動でJobを先に実行してからDeploymentを更新：

```bash
# 1. マイグレーションJobを先に実行
kubectl apply -f k8s/overlays/prod/migration-job.yaml
kubectl wait --for=condition=complete job/prod-db-migration -n fast-note-prod --timeout=300s

# 2. Deploymentを更新（Init Containerは冪等なので問題なし）
kubectl apply -k k8s/overlays/prod/
```

## ベストプラクティス

### マイグレーション作成時

1. **破壊的変更を避ける**
   - カラムの削除や型変更は段階的に行う
   - 例: カラム削除 → まず `nullable: true` に変更 → 次のリリースで削除

2. **大量データのマイグレーションは避ける**
   - マイグレーション中にタイムアウトする可能性
   - 別途データ移行スクリプトを作成

3. **ダウンタイムが必要な場合**
   - メンテナンスモードを有効化
   - 手動でJobを実行
   - 完了後にアプリケーションをデプロイ

### 本番環境デプロイ前

1. **ステージング環境でテスト**
   ```bash
   kubectl apply -k k8s/overlays/dev/
   ```

2. **マイグレーションの確認**
   ```bash
   pnpm prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-schema-datasource prisma/schema.prisma
   ```

3. **バックアップの取得**
   - RDSの自動バックアップ確認
   - 必要に応じて手動スナップショット作成

## FAQ

### Q: マイグレーションが既に実行済みかどうか確認したい

```bash
kubectl run -it --rm debug \
  --image=ghcr.io/ng3rdstmadgke/fast-note:latest \
  --env="DATABASE_URL=$(kubectl get secret fast-note-secrets -n fast-note-prod -o jsonpath='{.data.database-url}' | base64 -d)" \
  -n fast-note-prod \
  -- pnpm prisma migrate status
```

### Q: Dockerイメージに最新のマイグレーションが含まれているか確認したい

```bash
# ローカルでDockerイメージの内容を確認
docker run --rm ghcr.io/ng3rdstmadgke/fast-note:latest ls -la /app/prisma/migrations/
```

### Q: Init Container のタイムアウトを調整したい

Init Container にはタイムアウト設定がありません。マイグレーションが長時間かかる場合は、Kubernetes の Pod 作成タイムアウト（デフォルト30分）に依存します。

### Q: マイグレーションをスキップしたい

```bash
# Init Containerパッチを一時的に削除
kubectl edit deployment prod-fast-note -n fast-note-prod

# または、Kustomizationファイルから削除
vim k8s/overlays/prod/kustomization.yaml
# migration-init-container-patch.yaml をコメントアウト
kubectl apply -k k8s/overlays/prod/
```

## 参考リンク

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Kubernetes Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- [Kubernetes Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
