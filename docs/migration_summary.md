# マイグレーション設定完了サマリー

## 追加・変更されたファイル

### 1. ベース設定

#### [k8s/base/deployment.yaml](../k8s/base/deployment.yaml)
- **役割**: Init Containerをベース設定に追加
- **動作**: Pod起動前に `pnpm prisma migrate deploy` を実行
- **リソース**: CPU 100m-500m, Memory 256Mi-512Mi
- **理由**: dev/prod で処理内容は同じなので、baseに統一

### 2. 手動マイグレーション用Job

#### [k8s/overlays/prod/migration-job.yaml](../k8s/overlays/prod/migration-job.yaml)
- **役割**: 手動マイグレーション用のKubernetes Job
- **用途**: デバッグや特殊なマイグレーションケース
- **実行方法**: `kubectl apply -f k8s/overlays/prod/migration-job.yaml`

### 3. ドキュメント

#### [docs/database_migration.md](./database_migration.md)
- **内容**: マイグレーションの詳細手順、トラブルシューティング、FAQ

#### [docs/migration_summary.md](./migration_summary.md)（このファイル）
- **内容**: 設定のサマリーと確認方法

#### [CLAUDE.md](../CLAUDE.md)
- **変更点**: デプロイメントフローにマイグレーションの説明を追加

## 動作確認方法

### 1. Kustomizeの出力確認

```bash
# 本番環境の設定を確認
kubectl kustomize k8s/overlays/prod/ | grep -A 30 "initContainers:"

# 開発環境の設定を確認
kubectl kustomize k8s/overlays/dev/ | grep -A 30 "initContainers:"
```

### 2. 本番環境へのデプロイ

```bash
# 設定を適用
kubectl apply -k k8s/overlays/prod/

# Init Containerのログを確認
kubectl logs deployment/prod-fast-note -c db-migration -n fast-note-prod -f

# Podの状態確認
kubectl get pods -n fast-note-prod -w
```

### 3. マイグレーション成功の確認

```bash
# 全てのPodがRunningになっていることを確認
kubectl get pods -n fast-note-prod

# アプリケーションのログを確認
kubectl logs deployment/prod-fast-note -n fast-note-prod
```

## デプロイフロー

```
開発者がコミット & プッシュ
   ▼
GitHub Actions でビルド & ECRへプッシュ
   ▼
kubectl apply -k k8s/overlays/prod/
   ▼
新しいPodが作成される
   ▼
Init Container (db-migration) 起動
   ▼
pnpm prisma migrate deploy 実行
   ▼
   成功 ─→ メインコンテナ起動 ─→ アプリ稼働
   │
   失敗 ─→ Pod起動失敗 ─→ Kubernetesが自動リトライ
```

## トラブルシューティング

### マイグレーションが失敗する場合

1. **Init Containerのログを確認**
   ```bash
   kubectl logs deployment/prod-fast-note -c db-migration -n fast-note-prod
   ```

2. **前回のPodのログも確認**
   ```bash
   kubectl logs deployment/prod-fast-note -c db-migration -n fast-note-prod --previous
   ```

3. **データベース接続を確認**
   ```bash
   # Secretの内容確認（base64デコード）
   kubectl get secret fast-note-secrets -n fast-note-prod -o jsonpath='{.data.database-url}' | base64 -d
   ```

### 複数レプリカでロック競合が発生する場合

```bash
# 一時的にレプリカ数を1に減らす
kubectl scale deployment prod-fast-note --replicas=1 -n fast-note-prod

# または、先にJobでマイグレーションを実行
kubectl apply -f k8s/overlays/prod/migration-job.yaml
kubectl wait --for=condition=complete job/prod-db-migration -n fast-note-prod --timeout=300s
kubectl apply -k k8s/overlays/prod/
```

## ベストプラクティス

### ✅ DO

- マイグレーションファイルは必ずGitにコミットする
- 本番デプロイ前にステージング環境でテストする
- 破壊的変更（カラム削除など）は段階的に行う
- Init Containerのログを必ず確認する

### ❌ DON'T

- マイグレーション中に手動でDBを変更しない
- 大量データを含むマイグレーションは避ける（別途データ移行）
- マイグレーションファイルを直接編集しない
- 本番環境で未テストのマイグレーションを実行しない

## 参考リンク

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Kubernetes Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/)

## 更新履歴

- 2025-11-24: 初版作成（Init Container方式のマイグレーション実装）
