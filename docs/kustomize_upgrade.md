# Kustomize設定のアップグレード

## 概要

Kustomizeの非推奨フィールドを最新の推奨形式に更新しました。

## 変更内容

### 非推奨フィールドの置き換え

| 旧フィールド名 | 新フィールド名 | 説明 |
|---------------|---------------|------|
| `bases` | `resources` | 参照する基底リソースの指定 |
| `commonLabels` | `labels` | 共通ラベルの指定（includeSelectorsオプション追加） |
| `patchesStrategicMerge` | `patches` | ストラテジックマージパッチの指定（pathで明示） |

### 自動修正コマンド

```bash
# baseの修正
cd /workspaces/fast-note/k8s/base
kustomize edit fix

# prodの修正
cd /workspaces/fast-note/k8s/overlays/prod
kustomize edit fix

# devの修正
cd /workspaces/fast-note/k8s/overlays/dev
kustomize edit fix
```

## 修正前と修正後の比較

### 修正前（非推奨）

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: fast-note-prod

bases:                          # ❌ 非推奨
  - ../../base

commonLabels:                   # ❌ 非推奨
  environment: prod

patchesStrategicMerge:          # ❌ 非推奨
  - ingress-patch.yaml
  - deployment-patch.yaml
```

### 修正後（推奨）

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: fast-note-prod

resources:                      # ✅ 推奨
  - ../../base

labels:                         # ✅ 推奨
  - includeSelectors: true
    pairs:
      environment: prod

patches:                        # ✅ 推奨
  - path: ingress-patch.yaml
  - path: deployment-patch.yaml
```

## 主な変更点の詳細

### 1. `bases` → `resources`

**変更理由**: `resources`の方がより明確で一貫性がある

```yaml
# 修正前
bases:
  - ../../base

# 修正後
resources:
  - ../../base
```

### 2. `commonLabels` → `labels`

**変更理由**: より柔軟なラベル管理が可能

**重要な違い**:
- `includeSelectors: true`: Deployment/Serviceのselectorにもラベルを適用
- `pairs`: ラベルのキー・バリューペアを明示的に指定

```yaml
# 修正前
commonLabels:
  environment: prod

# 修正後
labels:
  - includeSelectors: true
    pairs:
      environment: prod
```

**注意**: `includeSelectors: true`にしないと、既存のDeploymentのselectorと一致せず、エラーになる可能性があります。

### 3. `patchesStrategicMerge` → `patches`

**変更理由**: 複数のパッチタイプ（Strategic Merge, JSON Patch, JSON 6902）を統一的に管理

```yaml
# 修正前
patchesStrategicMerge:
  - ingress-patch.yaml
  - deployment-patch.yaml

# 修正後
patches:
  - path: ingress-patch.yaml
  - path: deployment-patch.yaml
```

**補足**: `path`を指定することで、ファイルベースのパッチであることを明示

## 検証方法

### 警告が出ないことを確認

```bash
# 本番環境
kubectl kustomize /workspaces/fast-note/k8s/overlays/prod/

# 開発環境
kubectl kustomize /workspaces/fast-note/k8s/overlays/dev/

# 警告メッセージが表示されないことを確認
# ✅ 正常: 警告なし
# ❌ 問題: "Warning: 'bases' is deprecated..." などが表示される
```

### 出力結果の確認

```bash
# Init Containerが正しく含まれているか確認
kubectl kustomize /workspaces/fast-note/k8s/overlays/prod/ | grep -A 30 "initContainers:"

# ラベルが正しく適用されているか確認
kubectl kustomize /workspaces/fast-note/k8s/overlays/prod/ | grep -A 5 "labels:"
```

## デプロイ方法（変更なし）

修正後も、デプロイコマンドは変更ありません：

```bash
# 本番環境へのデプロイ
kubectl apply -k k8s/overlays/prod/

# 開発環境へのデプロイ
kubectl apply -k k8s/overlays/dev/
```

## 関連ファイル

- [k8s/base/kustomization.yaml](../k8s/base/kustomization.yaml)
- [k8s/overlays/prod/kustomization.yaml](../k8s/overlays/prod/kustomization.yaml)
- [k8s/overlays/dev/kustomization.yaml](../k8s/overlays/dev/kustomization.yaml)

## 参考リンク

- [Kustomize Documentation - Deprecations](https://kubectl.docs.kubernetes.io/references/kustomize/glossary/#deprecated-fields)
- [Kustomize Migration Guide](https://kubectl.docs.kubernetes.io/guides/config_management/components/)
- [Kustomize edit fix command](https://kubectl.docs.kubernetes.io/references/kustomize/cmd/edit/fix/)

## トラブルシューティング

### Q: `kustomize edit fix` を実行したが警告が消えない

**A**: 以下を確認してください：

1. すべてのkustomization.yamlファイルで実行したか
   ```bash
   # base, dev, prod の全てで実行
   cd k8s/base && kustomize edit fix
   cd k8s/overlays/prod && kustomize edit fix
   cd k8s/overlays/dev && kustomize edit fix
   ```

2. 手動でフォーマットを整えたか
   - 自動修正後、フォーマットが崩れる場合があります
   - 必要に応じて手動で整形してください

### Q: デプロイ後、Podが起動しない

**A**: ラベルセレクタの不一致が原因の可能性があります。

```bash
# Deploymentの詳細を確認
kubectl describe deployment prod-fast-note -n fast-note-prod

# エラーメッセージを確認
# "selector does not match template labels" などが表示される場合、
# labels設定の includeSelectors: true を確認
```

### Q: 既存のリソースとコンフリクトする

**A**: 既存のリソースを一度削除してから再デプロイ

```bash
# 既存リソースの削除
kubectl delete -k k8s/overlays/prod/

# 再デプロイ
kubectl apply -k k8s/overlays/prod/
```

## 更新履歴

- 2025-11-24: 初版作成（Kustomize非推奨フィールドの更新）
