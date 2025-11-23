# Kubernetes マニフェスト (Kustomize)

このディレクトリには、fast-noteアプリケーションをEKSにデプロイするためのKubernetesマニフェストが含まれています。

## ディレクトリ構成

```
k8s/
├── base/                           # 共通マニフェスト
│   ├── kustomization.yaml          # ベース設定
│   ├── deployment.yaml             # Deploymentリソース
│   ├── service.yaml                # Serviceリソース
│   └── ingress.yaml                # Ingressリソース (ALB)
├── overlays/                       # 環境別設定
│   ├── dev/                        # 開発環境
│   │   ├── kustomization.yaml
│   │   ├── ingress-patch.yaml
│   │   └── secret.yaml.example
│   └── prod/                       # 本番環境
│       ├── kustomization.yaml
│       ├── ingress-patch.yaml
│       ├── deployment-patch.yaml
│       └── secret.yaml.example
├── .gitignore
└── README.md
```

## Kustomizeについて

このプロジェクトでは、Kubernetesマニフェストの管理にKustomizeを使用しています。

- **base/**: 環境に依存しない共通のマニフェスト
- **overlays/**: 環境別（dev/prod）の設定をパッチとして適用

## クイックスタート

詳細なデプロイ手順は [docs/deploy_guide.md](../docs/deploy_guide.md) を参照してください。

### 1. Secretの作成

```bash
cd k8s/overlays/dev
cp secret.yaml.example secret.yaml
vim secret.yaml  # 実際の値を設定
```

### 2. イメージのビルド＆プッシュ

```bash
# プロジェクトルートで実行
./bin/push-image.sh -o YOUR_GITHUB_USERNAME -t dev
```

### 3. 設定の編集

`kustomization.yaml` と `ingress-patch.yaml` のプレースホルダーを実際の値に置き換えます。

### 4. デプロイ

```bash
# Secretをデプロイ
kubectl apply -f k8s/overlays/dev/secret.yaml

# GHCR Secret を作成（プライベートリポジトリの場合）
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=your-email@example.com \
  -n fast-note-dev

# アプリケーションをデプロイ
kubectl apply -k k8s/overlays/dev
```

## マニフェストの確認

デプロイ前に生成されるマニフェストを確認できます：

```bash
# 開発環境
kubectl kustomize k8s/overlays/dev

# 本番環境
kubectl kustomize k8s/overlays/prod
```

## リソース構成

### Deployment

- **レプリカ数**:
  - 開発環境: 1
  - 本番環境: 3
- **リソース制限**: CPU/メモリの制限を設定
- **ヘルスチェック**: liveness/readiness probeを設定
- **イメージプルシークレット**: GHCRからイメージを取得

### Service

- **Type**: ClusterIP
- **Port**: 80 → 3000（コンテナポート）

### Ingress

- **Controller**: AWS Load Balancer Controller
- **Type**: ALB (Application Load Balancer)
- **機能**:
  - HTTPS対応（ACM証明書）
  - ヘルスチェック（/api/health）
  - ホストベースルーティング

### ConfigMap

環境変数の設定:
- `NODE_ENV`: production / development
- `NEXT_TELEMETRY_DISABLED`: 1
- `AUTH_TRUST_HOST`: true

### Secret

機密情報の管理:
- データベース接続情報
- NextAuth.js設定
- Keycloak設定

## 環境別の設定

### 開発環境（dev）

- Namespace: `fast-note-dev`
- レプリカ数: 1
- イメージタグ: `dev`
- ホスト: `dev.fast-note.example.com`

### 本番環境（prod）

- Namespace: `fast-note-prod`
- レプリカ数: 3
- イメージタグ: `latest`
- ホスト: `fast-note.example.com`
- リソース制限: 開発環境より高い設定

## よく使うコマンド

### デプロイ状況の確認

```bash
# Podの状態
kubectl get pods -n fast-note-dev

# Serviceの確認
kubectl get svc -n fast-note-dev

# Ingressの確認（ALB DNS名）
kubectl get ingress -n fast-note-dev

# ログの確認
kubectl logs -f deployment/dev-fast-note -n fast-note-dev
```

### 更新とロールバック

```bash
# 再デプロイ
kubectl apply -k k8s/overlays/prod

# ロールアウト状況
kubectl rollout status deployment/prod-fast-note -n fast-note-prod

# ロールバック
kubectl rollout undo deployment/prod-fast-note -n fast-note-prod
```

### スケーリング

```bash
# 手動スケーリング
kubectl scale deployment/prod-fast-note --replicas=5 -n fast-note-prod
```

## トラブルシューティング

### Podが起動しない

```bash
kubectl describe pod <pod-name> -n fast-note-prod
kubectl logs <pod-name> -n fast-note-prod
kubectl get events -n fast-note-prod --sort-by='.lastTimestamp'
```

### データベース接続エラー

```bash
# Secret確認
kubectl get secret fast-note-secrets -n fast-note-prod -o yaml

# 環境変数確認
kubectl exec -it <pod-name> -n fast-note-prod -- env | grep DATABASE
```

### ALBが作成されない

```bash
# AWS Load Balancer Controller確認
kubectl get pods -n kube-system | grep aws-load-balancer-controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Ingress確認
kubectl describe ingress fast-note -n fast-note-prod
```

## セキュリティ

- **Secret管理**: secret.yaml は `.gitignore` に含まれており、Gitにコミットされません
- **本番環境**: AWS Secrets Manager または External Secrets Operator の使用を推奨
- **イメージプルシークレット**: プライベートリポジトリの場合、ghcr-secretが必要

## 詳細なドキュメント

より詳細な情報は以下のドキュメントを参照してください：

- **[デプロイガイド](../docs/deploy_guide.md)**: EKSへの完全なデプロイ手順
- **[bin/README.md](../bin/README.md)**: コンテナイメージのビルドとプッシュ

## 参考リンク

- [Kustomize Documentation](https://kustomize.io/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
