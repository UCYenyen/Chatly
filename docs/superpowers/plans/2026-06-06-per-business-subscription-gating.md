# Per-Business Subscription Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow unlimited businesses per account, and run a business's WhatsApp chatbot only when that business has an active paid subscription.

**Architecture:** Remove the plan-based cap on business creation; add a single subscription gate in the webhook (before any persistence) using existing `getBusinessPlan` + `isPaidPlan`; drop the now-meaningless `businesses` dimension from the plan-limit system.

**Tech Stack:** Next.js 16 (App Router), Prisma 7, TypeScript strict. Package manager: pnpm.

**Testing note:** This repo has **no test runner** (per CLAUDE.md). Tasks are verified with `pnpm lint`, `pnpm build`, and manual checks instead of automated tests. Follow project conventions: strict typing, **no `any`**, **no comments** (`console.log` is logging, not a comment, and is allowed).

---

## File Structure

- `src/app/api/whatsapp/webhook/route.ts` — add chatbot subscription gate (message path only).
- `src/app/api/businesses/route.ts` — remove business-count plan gate from `POST`.
- `src/types/plan-limits.md.ts` — drop `businesses` from `NumericLimitKey` and `PlanLimits`.
- `src/lib/utils/payment-gateway/plan-limits.ts` — drop `businesses` from `PLAN_LIMITS`, labels, and order.

---

## Task 1: Gate the chatbot on an active paid plan (webhook)

**Files:**
- Modify: `src/app/api/whatsapp/webhook/route.ts` (imports near top; insert gate after line ~300)

- [ ] **Step 1: Add imports**

In `src/app/api/whatsapp/webhook/route.ts`, after the existing import
`import { runChatlyAIEngine } from "@/lib/ai-engine";`, add:

```ts
import { getBusinessPlan } from "@/lib/utils/payment-gateway/plan-guard";
import { isPaidPlan } from "@/lib/utils/payment-gateway/plans";
```

- [ ] **Step 2: Insert the gate before any persistence**

Find this existing block (around line 297-300):

```ts
  if (!from || !text) {
    console.log(`[webhook] Early return: empty from or text. from=${from}, text=${text}`);
    return NextResponse.json({ ok: true });
  }
```

Immediately **after** that block (and before the `try {` that does the ignore-list
lookup), insert:

```ts
  const activePlan = await getBusinessPlan(whatsappAuth.businessId);
  if (!isPaidPlan(activePlan)) {
    console.log(
      `[webhook] No active paid plan for business ${whatsappAuth.businessId} — staying silent, nothing persisted.`,
    );
    return NextResponse.json({ ok: true });
  }
```

- [ ] **Step 3: Verify lint passes**

Run: `pnpm lint`
Expected: no errors for `src/app/api/whatsapp/webhook/route.ts`.

- [ ] **Step 4: Manual reasoning check**

Confirm the gate sits **after** the connection/disconnection handlers (those return
earlier, around lines 221/242/257) and **before** `prisma.chatLog.create` (line ~339).
Result: connection events still update status; unpaid businesses persist nothing on
inbound messages.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/whatsapp/webhook/route.ts
git commit -m "feat: gate chatbot on active paid subscription per business"
```

---

## Task 2: Allow unlimited businesses (remove creation cap)

**Files:**
- Modify: `src/app/api/businesses/route.ts`

- [ ] **Step 1: Remove the plan-guard import block**

Delete this import block near the top of `src/app/api/businesses/route.ts`:

```ts
import {
  PlanLimitError,
  enforceNumericLimit,
  getUserPlan,
  planLimitResponse,
} from "@/lib/utils/payment-gateway/plan-guard";
```

- [ ] **Step 2: Remove the business-count gate in `POST`**

Delete these four lines from the `POST` handler (they sit just before
`const created = await prisma.business.create(...)`):

```ts
    const plan = await getUserPlan(session.user.id);
    const businessCount = await prisma.business.count({
      where: { userId: session.user.id },
    });
    enforceNumericLimit(plan, "businesses", businessCount, "bisnis");
```

- [ ] **Step 3: Remove the now-dead PlanLimitError catch branch**

In the `catch (error)` block of `POST`, delete:

```ts
    if (error instanceof PlanLimitError) {
      return planLimitResponse(error);
    }
```

The remaining catch logic (generic 500 response) stays unchanged. After this, the file
no longer references `PlanLimitError`, `enforceNumericLimit`, `getUserPlan`, or
`planLimitResponse`.

- [ ] **Step 4: Verify lint passes (no unused imports)**

Run: `pnpm lint`
Expected: no "unused variable/import" errors in `src/app/api/businesses/route.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/businesses/route.ts
git commit -m "feat: allow unlimited businesses per account"
```

---

## Task 3: Drop the `businesses` dimension from the plan-limit system

**Files:**
- Modify: `src/types/plan-limits.md.ts`
- Modify: `src/lib/utils/payment-gateway/plan-limits.ts`

- [ ] **Step 1: Remove `businesses` from the type definitions**

In `src/types/plan-limits.md.ts`:

Change the `NumericLimitKey` union from:

```ts
export type NumericLimitKey =
  | "businesses"
  | "channels"
  | "knowledgeDocuments"
  | "ignoredContacts";
```

to:

```ts
export type NumericLimitKey =
  | "channels"
  | "knowledgeDocuments"
  | "ignoredContacts";
```

And in the `PlanLimits` interface, delete the line:

```ts
  businesses: LimitValue;
```

- [ ] **Step 2: Remove `businesses` from every `PLAN_LIMITS` entry**

In `src/lib/utils/payment-gateway/plan-limits.ts`, delete the `businesses: ...,` line
from all five entries (`FREE`, `STARTER`, `GROWTH`, `PRO`, `ENTERPRISE`). For example,
the `FREE` entry changes from:

```ts
  FREE: {
    businesses: 1,
    channels: 1,
    knowledgeDocuments: 5,
    ignoredContacts: 10,
```

to:

```ts
  FREE: {
    channels: 1,
    knowledgeDocuments: 5,
    ignoredContacts: 10,
```

Apply the same deletion to `STARTER` (`businesses: 1`), `GROWTH` (`businesses: 3`),
`PRO` (`businesses: 10`), and `ENTERPRISE` (`businesses: "unlimited"`).

- [ ] **Step 3: Remove the `businesses` feature label**

In `src/lib/utils/payment-gateway/plan-limits.ts`, in `NUMERIC_FEATURE_LABELS`, delete
the line:

```ts
  businesses: (value) => `${value} bisnis`,
```

- [ ] **Step 4: Remove `businesses` from the feature order**

In `src/lib/utils/payment-gateway/plan-limits.ts`, change `NUMERIC_FEATURE_ORDER` from:

```ts
const NUMERIC_FEATURE_ORDER: ReadonlyArray<NumericLimitKey> = [
  "channels",
  "knowledgeDocuments",
  "ignoredContacts",
  "businesses",
];
```

to:

```ts
const NUMERIC_FEATURE_ORDER: ReadonlyArray<NumericLimitKey> = [
  "channels",
  "knowledgeDocuments",
  "ignoredContacts",
];
```

- [ ] **Step 5: Verify types compile**

Run: `pnpm lint`
Expected: no TypeScript errors about a missing/extra `businesses` property in
`PLAN_LIMITS` or `NUMERIC_FEATURE_LABELS`.

- [ ] **Step 6: Commit**

```bash
git add src/types/plan-limits.md.ts src/lib/utils/payment-gateway/plan-limits.ts
git commit -m "refactor: remove businesses dimension from plan limits"
```

---

## Task 4: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Lint the whole project**

Run: `pnpm lint`
Expected: passes with no errors.

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: `prisma generate` then `next build` complete successfully (no type errors).

- [ ] **Step 3: Manual functional checks**

- Create several businesses on an account with no subscription → all succeed (no 403).
- Send a WhatsApp message to a business with no active paid plan → no reply, and no new
  `ChatLog` row for that message.
- Activate a paid plan for that business → send a message → chatbot replies and a
  `ChatLog` row is written.
- Open the pricing/plan cards → no "bisnis" line is shown.

- [ ] **Step 4: Final commit (if any verification fixups were needed)**

```bash
git add -A
git commit -m "chore: verify per-business subscription gating"
```
