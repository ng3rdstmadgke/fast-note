#!/bin/bash

set -e

# デフォルト値
IMAGE_NAME="fast-note"
TAG="latest"
REGISTRY="ghcr.io"
GITHUB_OWNER=""
PUSH=false
BUILD_ONLY=false

function usage() {
cat >&2 <<EOF
Usage: $0 [options]

コンテナイメージのビルドとGitHub Container Registryへのプッシュを行います。

[options]
  -h, --help              このヘルプメッセージを表示
  -t, --tag TAG           イメージタグを指定 (デフォルト: latest)
  -o, --owner OWNER       GitHubのユーザー名またはOrganization名 (必須)
  -p, --push              ビルド後にGHCRにプッシュ
  -b, --build-only        ビルドのみ実行（プッシュしない）

例:
  # ビルドのみ
  $0 -o your-username -b

  # ビルドしてGHCRにプッシュ
  $0 -o your-username -t v1.0.0 -p

  # 開発用タグでビルド&プッシュ
  $0 -o your-username -t dev -p

環境変数:
  GITHUB_OWNER    GitHubのユーザー名またはOrganization名
  GITHUB_TOKEN    GitHub Personal Access Token (プッシュ時に必要)

注意:
  プッシュを行う場合、事前に以下のコマンドでGHCRにログインしてください:
  echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
EOF
exit 1
}

# 引数解析
args=()
while [ "$1" != "" ]; do
  case $1 in
    -h | --help )
      usage
      ;;
    -t | --tag )
      shift
      TAG="$1"
      ;;
    -o | --owner )
      shift
      GITHUB_OWNER="$1"
      ;;
    -p | --push )
      PUSH=true
      ;;
    -b | --build-only )
      BUILD_ONLY=true
      ;;
    * )
      args+=("$1")
      ;;
  esac
  shift
done

# 環境変数からGitHub Ownerを取得（オプションで指定されていない場合）
if [ -z "$GITHUB_OWNER" ]; then
  if [ -n "$GITHUB_OWNER_ENV" ]; then
    GITHUB_OWNER="$GITHUB_OWNER_ENV"
  else
    echo "Error: GitHub owner must be specified with -o option or GITHUB_OWNER environment variable" >&2
    usage
  fi
fi

# 完全なイメージ名を構築
FULL_IMAGE_NAME="${REGISTRY}/${GITHUB_OWNER}/${IMAGE_NAME}:${TAG}"
LOCAL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "=========================================="
echo "  Container Image Build"
echo "=========================================="
echo "Image Name: ${IMAGE_NAME}"
echo "Tag:        ${TAG}"
echo "Registry:   ${REGISTRY}"
echo "Owner:      ${GITHUB_OWNER}"
echo "Full Name:  ${FULL_IMAGE_NAME}"
echo "=========================================="
echo ""

# プロジェクトルートに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

echo "Building Docker image..."
echo "Context: ${PROJECT_ROOT}/app"
echo "Dockerfile: ${PROJECT_ROOT}/docker/app/Dockerfile"
echo ""

# Dockerイメージのビルド
docker build \
  -f docker/app/Dockerfile \
  -t "${LOCAL_IMAGE_NAME}" \
  -t "${FULL_IMAGE_NAME}" \
  ./app

echo ""
echo "✓ Build completed successfully!"
echo ""

# プッシュ処理
if [ "$BUILD_ONLY" = false ] && [ "$PUSH" = true ]; then
  echo "Pushing to GitHub Container Registry..."
  echo "Target: ${FULL_IMAGE_NAME}"
  echo ""

  # GHCRにログインしているか確認
  if ! docker info 2>/dev/null | grep -q "ghcr.io"; then
    echo "Warning: Not logged in to GitHub Container Registry"
    echo "Please login with:"
    echo "  echo \$GITHUB_TOKEN | docker login ghcr.io -u ${GITHUB_OWNER} --password-stdin"
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 1
    fi
  fi

  docker push "${FULL_IMAGE_NAME}"

  echo ""
  echo "✓ Push completed successfully!"
  echo ""
  echo "Image URL: https://github.com/${GITHUB_OWNER}/${IMAGE_NAME}/pkgs/container/${IMAGE_NAME}"
else
  echo "Skipping push (use -p to push to registry)"
fi

echo ""
echo "=========================================="
echo "  Summary"
echo "=========================================="
echo "Local Image:  ${LOCAL_IMAGE_NAME}"
echo "Remote Image: ${FULL_IMAGE_NAME}"
if [ "$PUSH" = true ]; then
  echo "Status:       Built and pushed"
else
  echo "Status:       Built (not pushed)"
fi
echo "=========================================="
