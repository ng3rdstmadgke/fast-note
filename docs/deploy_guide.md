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

```bash
export GITHUB_OWNER="your-github-username"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

### 3. GHCRへのログイン

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_OWNER --password-stdin
```

### 4. イメージのビルドとプッシュ

プロジェクトルートで以下のコマンドを実行：

```bash
# 開発環境用（devタグ）
./bin/push-image.sh -o $GITHUB_OWNER -t dev

# 本番環境用（latestタグ）
./bin/push-image.sh -o $GITHUB_OWNER -t latest

# 特定バージョン（例: v1.0.0）
./bin/push-image.sh -o $GITHUB_OWNER -t v1.0.0
```

**ビルドのみ実行する場合:**

```bash
./bin/build-image.sh -o $GITHUB_OWNER -t dev -b
```

## Kubernetesマニフェストの設定

### 1. Secretファイルの作成

環境ごとにSecretファイルを作成します。

#### 開発環境

```bash
cd k8s/overlays/dev
cp secret.yaml.example secret.yaml
vim secret.yaml
```

`secret.yaml` の例:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fast-note-secrets
  namespace: fast-note-dev
type: Opaque
stringData:
  # PostgreSQL接続情報
  database-url: "postgresql://app:PASSWORD@fast-note-dev-postgres.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/fastnote"

  # NextAuth.js設定
  nextauth-url: "https://dev.fast-note.example.com"
  nextauth-secret: "GENERATE_WITH_openssl_rand_base64_32"

  # Keycloak設定
  keycloak-client-id: "fast-note-web-dev"
  keycloak-client-secret: "YOUR_KEYCLOAK_CLIENT_SECRET"
  keycloak-issuer: "https://keycloak.example.com/realms/fast-note-dev"
```

**NextAuth Secretの生成:**

```bash
openssl rand -base64 32
```

#### 本番環境

```bash
cd k8s/overlays/prod
cp secret.yaml.example secret.yaml
vim secret.yaml
```

### 2. Kustomization.yamlの編集

各環境の `kustomization.yaml` を編集してプレースホルダーを置き換えます。

#### 開発環境（k8s/overlays/dev/kustomization.yaml）

```yaml
images:
  - name: fast-note
    newName: ghcr.io/your-username/fast-note
    newTag: dev
```

#### 本番環境（k8s/overlays/prod/kustomization.yaml）

```yaml
images:
  - name: fast-note
    newName: ghcr.io/your-username/fast-note
    newTag: latest
```

### 3. Ingress Patchの編集

各環境の `ingress-patch.yaml` を編集します。

#### 開発環境（k8s/overlays/dev/ingress-patch.yaml）

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fast-note
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-1:123456789012:certificate/xxxxx
spec:
  rules:
    - host: dev.fast-note.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: fast-note
                port:
                  number: 80
```

#### 本番環境（k8s/overlays/prod/ingress-patch.yaml）

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fast-note
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-1:123456789012:certificate/yyyyy
spec:
  rules:
    - host: fast-note.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: fast-note
                port:
                  number: 80
```

### 4. マニフェストのビルド確認

デプロイ前に生成されるマニフェストを確認します：

```bash
# 開発環境
kubectl kustomize k8s/overlays/dev

# 本番環境
kubectl kustomize k8s/overlays/prod
```

## デプロイメント

### 1. Namespaceの作成

```bash
# 開発環境
kubectl create namespace fast-note-dev

# 本番環境
kubectl create namespace fast-note-prod
```

### 2. アプリケーションSecretのデプロイ

```bash
# 開発環境
kubectl apply -f k8s/overlays/dev/secret.yaml

# 本番環境
kubectl apply -f k8s/overlays/prod/secret.yaml
```

### 3. GHCR Image Pull Secretの作成

プライベートリポジトリの場合のみ必要です。パブリックイメージの場合はスキップできます。

```bash
# 開発環境
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_OWNER \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=your-email@example.com \
  -n fast-note-dev

# 本番環境
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_OWNER \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=your-email@example.com \
  -n fast-note-prod
```

### 4. アプリケーションのデプロイ

Kustomizeを使用してデプロイします：

```bash
# 開発環境
kubectl apply -k k8s/overlays/dev

# 本番環境
kubectl apply -k k8s/overlays/prod
```

### 5. デプロイ状況の確認

```bash
# Podの状態確認
kubectl get pods -n fast-note-dev
kubectl get pods -n fast-note-prod

# Serviceの確認
kubectl get svc -n fast-note-dev
kubectl get svc -n fast-note-prod

# Ingressの確認（ALBのDNS名を取得）
kubectl get ingress -n fast-note-dev
kubectl get ingress -n fast-note-prod

# Podのログ確認
kubectl logs -f -n fast-note-dev deployment/dev-fast-note
kubectl logs -f -n fast-note-prod deployment/prod-fast-note
```

## 動作確認

### 1. ヘルスチェック

Port Forwardでローカルから確認：

```bash
# Port Forward
kubectl port-forward -n fast-note-dev svc/dev-fast-note 3000:80

# 別のターミナルで
curl http://localhost:3000/api/health
```

期待されるレスポンス：

```json
{
  "status": "ok",
  "timestamp": "2025-11-23T12:34:56.789Z",
  "database": "connected"
}
```

### 2. ALB DNS名の取得

```bash
kubectl get ingress -n fast-note-prod -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'
```

### 3. DNSの設定

Route 53でCNAMEレコードを作成：

- **Name**: `fast-note.example.com` (本番) / `dev.fast-note.example.com` (開発)
- **Type**: CNAME
- **Value**: ALBのDNS名

### 4. ブラウザでアクセス

```
https://dev.fast-note.example.com
https://fast-note.example.com
```

## 運用

### イメージの更新

#### 1. 新しいイメージをビルド＆プッシュ

```bash
# 新しいバージョンをビルド
./bin/push-image.sh -o $GITHUB_OWNER -t v1.1.0
```

#### 2. Kustomization.yamlのイメージタグを更新

```yaml
# k8s/overlays/prod/kustomization.yaml
images:
  - name: fast-note
    newName: ghcr.io/your-username/fast-note
    newTag: v1.1.0  # 更新
```

#### 3. 再デプロイ

```bash
kubectl apply -k k8s/overlays/prod

# ロールアウト状況の確認
kubectl rollout status deployment/prod-fast-note -n fast-note-prod
```

### 設定の更新

ConfigMapやSecretを更新した場合、Podを再起動します：

```bash
# Secret更新後
kubectl apply -f k8s/overlays/prod/secret.yaml

# Podの再起動
kubectl rollout restart deployment/prod-fast-note -n fast-note-prod
```

### ロールバック

デプロイに問題がある場合、前のバージョンにロールバックできます：

```bash
# ロールバック履歴の確認
kubectl rollout history deployment/prod-fast-note -n fast-note-prod

# 直前のバージョンにロールバック
kubectl rollout undo deployment/prod-fast-note -n fast-note-prod

# 特定のリビジョンにロールバック
kubectl rollout undo deployment/prod-fast-note -n fast-note-prod --to-revision=2
```

### スケーリング

#### 手動スケーリング

```bash
# レプリカ数を変更
kubectl scale deployment/prod-fast-note --replicas=5 -n fast-note-prod
```

#### Horizontal Pod Autoscaler（HPA）

HPA用のマニフェストを追加する場合：

```yaml
# k8s/base/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fast-note
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fast-note
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

適用：

```bash
kubectl apply -f k8s/base/hpa.yaml -n fast-note-prod
```

### ログの確認

```bash
# 特定のPodのログ
kubectl logs <pod-name> -n fast-note-prod

# リアルタイムでログを追跡
kubectl logs -f deployment/prod-fast-note -n fast-note-prod

# 過去のログ（前回のコンテナ）
kubectl logs <pod-name> -n fast-note-prod --previous

# すべてのPodのログ
kubectl logs -l app=fast-note -n fast-note-prod
```

## セキュリティのベストプラクティス

1. **Secretの管理**
   - Secretファイルは絶対にGitにコミットしない（`.gitignore`に追加済み）
   - 本番環境では AWS Secrets Manager や External Secrets Operator の使用を推奨

2. **ネットワークポリシー**
   - 必要に応じてNetworkPolicyを設定し、Pod間通信を制限

3. **RBAC**
   - 最小権限の原則に従ってServiceAccountとRoleを設定

4. **Pod Security Standards**
   - Pod Security Admission を使用してセキュリティポリシーを強制

5. **イメージの脆弱性スキャン**
   - 定期的にイメージの脆弱性をスキャン
   - Trivy や Snyk などのツールを使用

## 参考リンク

### 公式ドキュメント

- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### ベストプラクティス

- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)
