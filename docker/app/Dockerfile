# ベースイメージ: Debian Bookworm with Node.js
FROM node:22-bookworm-slim AS base

# pnpmをインストール
RUN npm install -g pnpm@10

# 依存関係のインストール用ステージ
FROM base AS deps
WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma

# 依存関係をインストール (本番用のみ)
RUN pnpm install --frozen-lockfile --prod=false

# Prismaクライアントを生成
RUN pnpm exec prisma generate

# ビルドステージ
FROM base AS builder
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/lib/generated/prisma ./lib/generated/prisma

# ソースコードをコピー
COPY . .

# Next.jsアプリケーションをビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 本番実行用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/lib/generated/prisma/libquery_engine-debian-openssl-1.1.x.so.node

# セキュリティ: 非rootユーザーを作成
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# 必要なファイルのみをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated/prisma ./lib/generated/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Prisma CLIをマイグレーション用にコピー（pnpmの構造に対応）
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

# 非rootユーザーに切り替え
USER nextjs

# ポート3000を公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"]
