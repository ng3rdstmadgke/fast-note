# ベースイメージ: Debian Bookworm with Node.js
FROM node:22-bookworm-slim AS base

# pnpmをインストール
RUN npm install -g pnpm@9

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

# セキュリティ: 非rootユーザーを作成
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# 必要なファイルのみをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 非rootユーザーに切り替え
USER nextjs

# ポート3000を公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"]
