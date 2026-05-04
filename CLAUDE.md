# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Non-standard Next.js

This project uses **Next.js 16** (`next@16.2.3`), which has breaking changes vs. older Next.js versions. APIs, conventions, and file structure may differ from training data. **Before writing Next.js code, consult `node_modules/next/dist/docs/`** (see `01-app/`) and heed deprecation notices.

Two notable deviations from "stock" Next.js in this repo:
- Routing middleware lives in `src/proxy.ts` and exports `proxy` + `config` (not `middleware`).
- React Compiler is enabled in `next.config.ts` (`reactCompiler: true`) — avoid manual `useMemo`/`useCallback` micro-optimizations; the compiler handles them.

## Commands

Package manager is **pnpm** (`pnpm-workspace.yaml` present). Use `pnpm`, not npm/yarn.

- `pnpm dev` — dev server
- `pnpm build` — `prisma generate && next build`
- `pnpm vercel-build` — `prisma generate && prisma migrate deploy && next build` (deploy)
- `pnpm lint` — `eslint` (flat config in `eslint.config.mjs`, extends `eslint-config-next`)
- `pnpm start` — production server

Prisma:
- Schema: `prisma/schema.prisma`; runtime config: `prisma.config.ts` (loads `DATABASE_URL` via `dotenv/config`).
- Generate client: `pnpm prisma generate`. New migration: `pnpm prisma migrate dev --name <name>`.

No test runner is configured.

## Architecture

### App Router layout (`src/app/`)
- Route groups: `(auth)` (sign-in, sign-up, forgot-password, unauthorized) and `(dashboard)` (analytics, api-docs, api-management, billing, dashboard, training), each with its own `layout.tsx`.
- API routes under `src/app/api/`: `auth/` (better-auth handler) and `checkout/` (Xendit invoice creation).
- Path alias: `@/*` → `./src/*`.

### Auth — better-auth
- Server config: `src/lib/utils/auth/auth.ts`; client: `auth-client.ts`; error mapping: `get-auth-error-message.ts`.
- `src/proxy.ts` reads cookies `better-auth.session_token` / `__Secure-better-auth.session_token` and: redirects unauthenticated users away from protected routes (`/dashboard`, `/admin`, etc.); redirects authenticated users away from auth pages; for `/admin/*`, fetches `/api/auth/get-session` and gates on `user.role` (`ADMIN`, with `ADMIN_QR` allowed for `/admin/presension`). Roles enum in Prisma: `GUEST | BUSINESS_OWNER | ADMIN` — keep `proxy.ts` role strings in sync with `UserRole` in `schema.prisma`.

### Database — Prisma 7
- Uses `@prisma/adapter-pg` + `@prisma/extension-accelerate`. Client wrapper: `src/lib/utils/prisma.ts`.
- Models follow better-auth shape (`User`, `Session`, `Account`, `Verification`), mapped to lowercase tables via `@@map`.

### Payments
- Xendit (`xendit-node`) and Midtrans (`midtrans-node-client`) clients in `src/lib/utils/payment-gateway/`.
- `XENDIT_SECRET_KEY` is required at module load — `xendit.ts` throws if missing.

### Code organization conventions
- `src/components/`: `ui/` (shadcn primitives — see `components.json`), `features/` (feature-scoped: `analytics`, `billing`, `dashboard`, `landing`, `training`, `auth`, `api-docs`, `api-management`), `personal/`, `providers/`. Prefer feature-scoped components in `features/<feature>/` over inlining in pages.
- `src/hooks/` — shared hooks. New hooks belong here, not in pages/components.
- `src/types/` — shared TS types. Existing files use a `.md.ts` suffix (e.g., `user.md.ts`, `page-prop.md.ts`); follow this when adding new ones. Same convention in `src/validations/` (`authValidation.md.ts`).
- `src/lib/utils/` — server/shared utilities (auth, prisma, payment-gateway). UI helper `cn` lives in `src/lib/utils.ts`.

### TypeScript
- `strict: true`. Project rule: no `any`; define interfaces/types in `src/types/`.

## Dependency notes
- React 19 + `babel-plugin-react-compiler` 1.0.
- UI: Tailwind v4 (`@tailwindcss/postcss`), `tw-animate-css`, Radix UI, shadcn, Motion, GSAP, Embla, Vaul, Sonner, cmdk.
- Forms: `react-hook-form` + `@hookform/resolvers` + `zod` v4.
- Mail: `nodemailer`.
