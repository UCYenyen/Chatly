# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## STRICT CONVENTIONS — Always Follow

**These are non-negotiable rules. Every commit must satisfy all of them.**

### 1. Types & Interfaces — STRICT TYPING
- **ALL types and interfaces MUST go in `src/types/`** — never inline in component/utility files
- Use the `.md.ts` suffix convention: `user.md.ts`, `analytics.md.ts`, `api-response.md.ts`
- **NO `any` type** — use strict `strict: true` TypeScript. If uncertain, use `unknown` and narrow via type guards
- All API responses must have defined types in `src/types/`
- Example:
  ```typescript
  // ✅ src/types/analytics.md.ts
  export interface ConversionData {
    totalChatCustomers: number;
    totalBuyingCustomers: number;
    conversionRate: number;
  }
  
  // ✅ components/features/analytics/ConversionRateCard.tsx
  const [data, setData] = useState<ConversionData | null>(null);
  
  // ❌ WRONG: Never define types inline
  // const [data, setData] = useState<any>(null);
  ```

### 2. Hooks — DEDICATED FOLDER
- **ALL custom hooks MUST go in `src/hooks/`** — never inline in components
- Each hook is its own file: `useConversionRate.ts`, `useAnalytics.ts`, etc.
- Hooks exported from `src/hooks/index.ts` for clean imports
- Example:
  ```typescript
  // ✅ src/hooks/useConversionRate.ts
  export function useConversionRate(businessId: string) {
    const [data, setData] = useState<ConversionData | null>(null);
    // ...
  }
  
  // ✅ src/components/features/analytics/ConversionRateCard.tsx
  import { useConversionRate } from '@/hooks';
  
  // ❌ WRONG: Never define hooks inside components
  ```

### 3. UI Components — SHADCN ONLY
- **ALL UI must use shadcn/ui components** — never custom div/button/input styling
- Use the `/shadcn` skill when adding or composing UI: it handles component setup, imports, and conventions
- Semantic colors from design system: `text-on-surface`, `bg-surface-container-low`, `border-outline-variant`
- Never override shadcn colors with raw Tailwind values like `bg-blue-500`
- Example:
  ```typescript
  // ✅ Use shadcn
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
  
  // ❌ WRONG: Never build custom card from divs
  // <div className="bg-blue-500 p-4 rounded-lg">...</div>
  ```

### 4. Component Organization — FEATURE-BASED
- **`src/components/ui/`** — shadcn primitives only (Card, Button, Dialog, etc.)
- **`src/components/features/<feature_name>/`** — feature-scoped compositions
  - Example: `src/components/features/analytics/ConversionRateCard.tsx`
  - Feature components compose ui primitives + business logic
  - Each feature is self-contained (dialogs, tables, forms all in same folder)
- **`src/components/personal/`** — reusable non-feature components (headers, footers, etc.)
- **`src/components/providers/`** — context providers, layout wrappers
- Example structure:
  ```
  src/components/
  ├── ui/                    (shadcn primitives)
  ├── features/
  │   ├── analytics/        (ConversionRateCard.tsx, IntentDashboard.tsx)
  │   ├── billing/
  │   ├── dashboard/
  │   └── auth/
  ├── personal/             (reusable across features)
  └── providers/            (context, layout)
  ```

### 5. Code Style — NO COMMENTS
- **Write self-documenting code** — variable/function names must be clear
- **NO comments** — not even single-line comments
- If logic is complex, refactor to smaller functions with clear names
- Type annotations replace comment documentation
- Example:
  ```typescript
  // ✅ Clear naming, no comments needed
  const calculateConversionRate = (buyers: number, chatters: number): number => {
    return chatters > 0 ? (buyers / chatters) * 100 : 0;
  };
  
  // ❌ WRONG: Comments + unclear names
  // Get conversion rate
  const getConvRate = (b: number, c: number) => {
    // Calculate percentage
    return c > 0 ? (b / c) * 100 : 0;
  };
  ```

### 6. No "any" Type — ENFORCE STRICT TYPING
- Every variable, parameter, and return type must have an explicit type
- If you don't know the type, use `unknown` and narrow it
- TypeScript `strict: true` is enforced — treat all errors as blocking
- Example:
  ```typescript
  // ✅ Explicit types
  interface User {
    id: string;
    email: string;
  }
  const getUser = async (id: string): Promise<User> => { ... };
  
  // ❌ WRONG: Never use any
  // const getUser = async (id: any): any => { ... };
  ```

---

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

Docker (production only — not for local dev):
- `Dockerfile`: Multi-stage build (`build-deps` → `builder` → `runtime`) with pnpm cache mount optimization, health check on `/api/health`, security hardening (nextjs user), and resource limits.
- `docker-compose.yml`: Runs `chatly_prod_app` on external `global_proxy` network with health checks and resource limits (1.0 CPU, 1GB memory). Includes optional `prisma_studio` service (dev profile) on port 5555 for database inspection.
- Local dev: Use `pnpm dev`, not Docker. For Prisma Studio in docker: `docker-compose --profile dev up prisma_studio` (requires DATABASE_URL in `.env`).

Prisma:
- Schema: `prisma/schema.prisma`; runtime config: `prisma.config.ts` (loads `DATABASE_URL` via `dotenv/config`).
- Generate client: `pnpm prisma generate`. New migration: `pnpm prisma migrate dev --name <name>`.
- **Important**: Schema has FK constraints and cascade deletes on ChatLog, ConversationState, AnalyticsEvent, DocumentChunk. Run migrations before deploying: `pnpm prisma migrate deploy`.

No test runner is configured.

## Architecture

### Chatbot Conversation Pipeline

Chatly processes WhatsApp messages through a multi-step pipeline:

1. **Webhook Handler** (`src/app/api/whatsapp/webhook/route.ts`):
   - HMAC-SHA256 signature verification via Gowa
   - Message deduplication (prevents duplicates from webhook retries)
   - Atomic ChatLog save (customer message persisted immediately, before AI processing)
   - Conversation mode detection (AI vs HUMAN mode)

2. **AI Engine** (`src/lib/ai-engine.ts`) — 10-step pipeline:
   - Fetch business config + intents
   - RAG retrieval (pgvector cosine similarity search)
   - System prompt composition with knowledge context
   - Conversation history fetch
   - Gemini 2.5 Flash Lite inference with JSON schema
   - Intent mapping (sanitized keys ↔ intent IDs)
   - Returns: response text, intent analytics, transaction flag, escalation signal

3. **Intent Analytics** (`src/lib/system-prompts/intents.ts`):
   - **Implicit Intent Detection**: AI recognizes intent from behavior (asking about product = interested in product), not just explicit statements
   - Patterns: curiosity (asking about features), pricing (cost inquiries), availability, comparison, process questions
   - System prompt guides AI to detect both explicit + implicit customer intent
   - Dynamic schema generation prevents hallucinated intent keys
   - Results saved to AnalyticsEvent for conversion tracking

4. **RAG System** (`src/lib/rag-ingestion.ts`):
   - Document upload → Gemini 2.5 Pro extraction → chunking on `\n\n`
   - Gemini Embedding 001 (768-dimensional vectors)
   - Atomic DELETE-then-INSERT for chunk updates
   - Retrieval: pgvector cosine distance, top-5 chunks per query, filtered by businessId

5. **Conversion Rate Analytics** (`src/app/api/businesses/[id]/analytics/conversion-rate/`):
   - Tracks: unique chatters vs unique buyers, transaction count, revenue
   - Component: `ConversionRateCard.tsx` with clickable stats → detail dialogs
   - Endpoint returns: summary metrics + detailed lists (chat customers, buyers, transactions)
   - Used for ROI measurement and chatbot effectiveness

### App Router layout (`src/app/`)
- Route groups: `(auth)` (sign-in, sign-up, forgot-password, unauthorized) and `(dashboard)` (analytics, api-docs, api-management, billing, dashboard, training), each with its own `layout.tsx`.
- API routes under `src/app/api/`: `auth/` (better-auth), `businesses/` (multi-tenant business data), `whatsapp/` (Gowa webhook handler), `health/` (liveness + dependency checks).
- Path alias: `@/*` → `./src/*`.

### Auth — better-auth
- Server config: `src/lib/utils/auth/auth.ts`; client: `auth-client.ts`; error mapping: `get-auth-error-message.ts`.
- `src/proxy.ts` reads cookies `better-auth.session_token` / `__Secure-better-auth.session_token` and: redirects unauthenticated users away from protected routes (`/dashboard`, `/admin`, etc.); redirects authenticated users away from auth pages; for `/admin/*`, fetches `/api/auth/get-session` and gates on `user.role` (`ADMIN`, with `ADMIN_QR` allowed for `/admin/presension`). Roles enum in Prisma: `GUEST | BUSINESS_OWNER | ADMIN` — keep `proxy.ts` role strings in sync with `UserRole` in `schema.prisma`.

### Database — Prisma 7
- Uses `@prisma/adapter-pg` + `@prisma/extension-accelerate`. Client wrapper: `src/lib/utils/prisma.ts`.
- Models follow better-auth shape (`User`, `Session`, `Account`, `Verification`), mapped to lowercase tables via `@@map`.
- **Key models for analytics**: ChatLog (all messages), AnalyticsEvent (intent mentions), CustomerTransaction (PAID purchases), ConversationState (AI/HUMAN mode per customer).
- **Cascade deletes**: Deleting a Business cascades to all its ChatLog, ConversationState, AnalyticsEvent, DocumentChunk records (prevents orphaned data).

### Payments
- Xendit (`xendit-node`) and Midtrans (`midtrans-node-client`) clients in `src/lib/utils/payment-gateway/`.
- `XENDIT_SECRET_KEY` is required at module load — `xendit.ts` throws if missing.
- Transactions generated by AI (`generate_transaction` flag) → customer phone + amount → invoice created via Xendit webhook → ChatLog + AnalyticsEvent recorded atomically.

### Code organization
- `src/components/ui/` — shadcn primitives only
- `src/components/features/<feature_name>/` — feature-scoped components (analytics, billing, dashboard, etc.)
- `src/hooks/` — all custom hooks, exported via index.ts
- `src/types/` — all interfaces/types with `.md.ts` suffix
- `src/lib/utils/` — server/shared utilities (auth, prisma, payment-gateway)
- `src/lib/system-prompts/` — modular AI system prompts (admin.ts, composer.ts, intents.ts, personalities.ts, training.ts)

### TypeScript
- **`strict: true`** — enforced, no exceptions
- **NO `any` type** — use explicit types or `unknown`
- All API response types in `src/types/`
- All component props typed
- All function signatures explicitly typed (parameters + return)

## Dependency notes
- React 19 + `babel-plugin-react-compiler` 1.0.
- UI: Tailwind v4 (`@tailwindcss/postcss`), shadcn/ui, Radix UI
- Forms: `react-hook-form` + `@hookform/resolvers` + `zod` v4
- Mail: `nodemailer`
- AI: Gemini API (2.5 Pro for extraction, 2.5 Flash Lite for inference, Embedding 001 for vectors)
- WhatsApp: Gowa API (multi-device support, webhook signature verification)

## Available subagents

**prisma-backend**: Specialized agent for database work. Use for:
- Writing Prisma queries and designing schema migrations
- Building API route handlers that touch the database
- Debugging query performance
- Understanding the Chatly data model

**chatly-shadcn-ui**: Specialized agent for UI composition. Use for:
- Adding shadcn components and composing feature components
- Building forms with react-hook-form + zod
- Ensuring design system consistency
- Working with Tailwind v4 and lucide-react icons
