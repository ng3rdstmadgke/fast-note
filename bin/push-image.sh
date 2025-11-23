#!/bin/bash

set -e

# このスクリプトはbuild-image.shのラッパーで、プッシュをデフォルトで有効にします

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# すべての引数をbuild-image.shに渡し、--pushオプションを追加
"${SCRIPT_DIR}/build-image.sh" "$@" --push
