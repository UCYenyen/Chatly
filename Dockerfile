# build-deps: install dependencies with layer caching
FROM node:24-alpine AS build-deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY prisma ./prisma
# pnpm 11 errors when dependencies ship build scripts that were not run
# (ERR_PNPM_IGNORED_BUILDS). We don't need them: Prisma's client is generated
# explicitly below and its query engines are bundled in @prisma/engines, while
# sharp ships prebuilt binaries. strict-dep-builds=false downgrades that to a
# warning. NB: this only takes effect as a CLI flag, not via .npmrc.
RUN --mount=type=cache,target=/root/.pnpm-store pnpm i --frozen-lockfile --config.strict-dep-builds=false

# builder: compile Next.js and Prisma
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
RUN corepack enable pnpm
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# CI=true stops pnpm from prompting (no TTY in the build) before its
# dependency-status check, which otherwise aborts with
# ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY. The host CI var does not
# propagate into the Docker build, so set it explicitly.
ENV CI=true
# verify-deps-before-run=false stops pnpm from running an implicit `install`
# (which would re-trigger ERR_PNPM_IGNORED_BUILDS) before these commands; the
# image already has node_modules from the build-deps stage.
RUN pnpm --config.verify-deps-before-run=false prisma generate
RUN pnpm --config.verify-deps-before-run=false run build
RUN pnpm prune --production --config.strict-dep-builds=false

# runtime: minimal production image
FROM node:24-alpine AS runtime
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
