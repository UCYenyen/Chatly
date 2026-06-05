# Contact Ignore List — Design Spec

**Date:** 2026-06-05
**Status:** Approved (design), pending implementation plan

## Problem

A connected business currently auto-replies (via the AI engine) to every non-group,
non-self inbound WhatsApp message. Some contacts should never trigger the bot — e.g. a
specific repeat customer, a known spammer, or the owner's own suppliers. There is no way
to mute individual contacts today.

## Goal

Let a business owner maintain a per-business **ignore list** of phone numbers from the
WhatsApp connector UI. When an inbound message arrives from an ignored number, the bot
does nothing: no AI call, no reply, and **no trace is saved** (no ChatLog, no
AnalyticsEvent). The list is stored in the database per business and persists across
WhatsApp disconnects/reconnects — an entry stays ignored until the owner removes it.

## Decisions (locked)

1. **Contact source for selection** = **recent chatters + manual entry.** The selectable
   list is built from `ChatLog` (phones that have actually messaged this business), plus a
   free-text field to add any number. No dependence on Gowa contact sync.
2. **Ignore behavior** = **fully dropped, no trace.** The gate runs *before* the ChatLog
   save in the webhook. An ignored message is discarded entirely.
3. **Storage** = **dedicated related table** `IgnoredContact` (mirrors `BusinessIntent`),
   not a `String[]` column — for a uniqueness constraint, indexed lookups, optional label,
   and race-free add/remove.
4. **UI placement** = inside `WhatsappAuthContainer` on the **Ringkasan** page, rendered
   only when `auth.status === "AUTHENTICATED"`.

## Out of scope (YAGNI)

- Gowa address-book sync (`/user/my/contacts`).
- Bulk import/export.
- Wildcard / pattern / prefix muting.
- Temporary or scheduled (timed) mutes.
- Group-level muting (groups are already filtered out by the webhook).

## Architecture

### 1. Data model

New Prisma model + relation on `Business`, plus a migration.

```prisma
model IgnoredContact {
  id          String   @id @default(cuid())
  businessId  String
  phoneNumber String              // canonical form, e.g. "6281234567"
  label       String?             // chatter display name if known, else null
  createdAt   DateTime @default(now())
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@unique([businessId, phoneNumber])
  @@index([businessId])
  @@map("ignored_contact")
}
```

Add to `Business`:

```prisma
ignoredContacts IgnoredContact[]
```

`onDelete: Cascade` keeps parity with other business-scoped tables (deleting a business
removes its ignore list).

### 2. Phone canonicalization (correctness-critical)

The webhook normalizes an inbound JID with a local `normalizePhone(jid)`
([webhook route.ts:77-79](../../../src/app/api/whatsapp/webhook/route.ts#L77-L79)) that
strips `@domain` and `:device`. Stored and manually-entered numbers MUST canonicalize to
the **same** form, or the lookup will silently miss.

Create a shared helper `canonicalizePhone(input: string): string | null` in
`src/lib/utils/phone.ts`:

- Strip everything after `@` and `:` (so a JID also canonicalizes correctly).
- Remove spaces, dashes, parentheses, and a leading `+`.
- Indonesian normalization: a leading `0` → `62` (e.g. `0812…` → `62812…`).
- Keep only digits after that; return `null` if the result is empty or implausibly short
  (< 8 digits) so the API can reject bad manual input.

Both the webhook and the ignore-list POST route use this helper. The webhook's existing
`normalizePhone` is refactored to delegate to it (or replaced), so inbound `from` and
stored `phoneNumber` are guaranteed to match.

### 3. Webhook enforcement gate

In [webhook/route.ts](../../../src/app/api/whatsapp/webhook/route.ts), insert immediately
after the empty `from`/`text` guard (currently line 286) and **before** the `messageId` /
ChatLog creation (currently line 288+):

```typescript
const ignored = await prisma.ignoredContact.findUnique({
  where: {
    businessId_phoneNumber: { businessId: whatsappAuth.businessId, phoneNumber: from },
  },
  select: { id: true },
});
if (ignored) {
  console.log(`[webhook] Ignored contact ${from} — dropping message (no trace).`);
  return NextResponse.json({ ok: true, ignored: true });
}
```

`from` is already canonical at this point (`const from = normalizePhone(fromJid)`).
Cost: one extra indexed `findUnique` per inbound message — acceptable.

### 4. API routes (all session-owner-gated)

Follow the ownership pattern in
[whatsapp/status/route.ts](../../../src/app/api/businesses/[id]/whatsapp/status/route.ts):
`getSession` → 401 if no user → load business → 403 if `business.userId !== session.user.id`.
Route context uses Next.js 16 `params: Promise<{ id: string }>`.

**`src/app/api/businesses/[id]/whatsapp/ignore-list/route.ts`**

- `GET` → returns `{ ignoreList: IgnoredContactDTO[] }`, ordered by `createdAt desc`.
- `POST` → body `{ phoneNumber: string; label?: string }`. Canonicalize `phoneNumber`;
  400 if it canonicalizes to `null`. `upsert` on `@@unique([businessId, phoneNumber])`
  (idempotent re-add). Returns the created/updated `IgnoredContactDTO`.
- `DELETE` → body `{ phoneNumber: string }` (canonicalized) or `{ id: string }`.
  `deleteMany` scoped by `businessId` so one business can never delete another's row.
  Returns `{ success: true }`.

**`src/app/api/businesses/[id]/whatsapp/recent-chatters/route.ts`**

- `GET` → distinct `USER` phones from `ChatLog` for this business. Returns
  `RecentChatterDTO[]`: `{ phoneNumber, lastMessageAt, isIgnored }`, newest first, capped
  (e.g. 50). `isIgnored` is computed by joining against the current ignore list so the UI
  can show/hide an "Ignore" action per row.

### 5. Types — `src/types/ignore-list.md.ts`

```typescript
export interface IgnoredContactDTO {
  id: string;
  phoneNumber: string;
  label: string | null;
  createdAt: string;       // ISO
}

export interface RecentChatterDTO {
  phoneNumber: string;
  lastMessageAt: string;   // ISO
  isIgnored: boolean;
}

export interface IgnoreListResponse {
  ignoreList: IgnoredContactDTO[];
}

export interface RecentChattersResponse {
  recentChatters: RecentChatterDTO[];
}

export interface AddIgnoredContactRequest {
  phoneNumber: string;
  label?: string;
}
```

No `any`. All API responses typed here per project convention.

### 6. Hook — `src/hooks/use-contact-ignore-list.ts`

Mirrors `use-whatsapp-auth` (fetch + `useState` loading/error + `useCallback` actions).
Exported from `src/hooks/index.ts`.

```typescript
interface UseContactIgnoreListResult {
  ignoreList: IgnoredContactDTO[];
  recentChatters: RecentChatterDTO[];
  isLoading: boolean;
  error: string | null;
  addContact: (phoneNumber: string, label?: string) => Promise<void>;
  removeContact: (phoneNumber: string) => Promise<void>;
  refetch: () => Promise<void>;
}
export function useContactIgnoreList(businessId: string): UseContactIgnoreListResult;
```

`addContact`/`removeContact` call the API then `refetch` both lists so the recent-chatters
`isIgnored` flags stay in sync. `fetch` uses `credentials: "include"`.

### 7. UI — `src/components/features/dashboard/WhatsappIgnoreList.tsx`

shadcn-only primitives (`Card`, `Input`, `Button`, `Label`, lucide icons), `sonner` for
toasts. Semantic design tokens (`text-on-surface`, `bg-surface-container`, etc.) matching
`WhatsappAuthContainer`. Manual-add field validated with `react-hook-form` + `zod`
(non-empty, canonicalizable phone).

Sections inside one `Card`:

1. **Ignored contacts** — list of `IgnoredContactDTO`; each row shows `label ?? phoneNumber`
   and the number, with a ghost `X` button → `removeContact` → success toast. Empty state
   when none.
2. **Add a number** — `Input` + `Add` button → `addContact` → success/error toast, clears
   field.
3. **Recent chatters** — list of `RecentChatterDTO` not already ignored, each with an
   "Ignore" button → `addContact(phoneNumber, label?)`. Rows already ignored are hidden
   (or shown disabled).

Mounting: in `WhatsappAuthContainer`, render `{isAuthenticated && <WhatsappIgnoreList
businessId={businessId} />}` after `WhatsappAuthStatus`. (`isAuthenticated` already exists
at line 46.)

## Data flow

```
Add/remove (UI)            Inbound message (webhook)
  WhatsappIgnoreList         normalizePhone(from)  ── canonical
    → useContactIgnoreList     → IgnoredContact.findUnique(businessId, from)
      → POST/DELETE route          ├─ hit  → return {ok, ignored:true}  (STOP)
        → IgnoredContact (DB) ─────┘        (no ChatLog, no AI, no analytics)
                                   └─ miss → save ChatLog → AI engine → reply
```

## Error handling

- API: 401 (no session), 403 (not owner), 400 (uncanonicalizable phone), 500 (DB error)
  with `{ error }` JSON. Hook surfaces `error` string; UI shows a toast.
- Webhook: the ignore lookup is wrapped so a DB error does not crash the pipeline — on
  lookup failure, log and fall through to normal processing (fail-open: better to reply
  than to silently drop a real customer).
- Manual add of a duplicate is idempotent (`upsert`), no error shown.

## Testing (manual — repo has no test runner)

1. Connect WhatsApp → ignore card appears only when `AUTHENTICATED`.
2. Add a manual number `0812…`; message from `62812…@s.whatsapp.net` → no reply, nothing
   in ChatLog.
3. Remove it → next message from that number gets a normal AI reply.
4. A recent chatter shows in the list; "Ignore" mutes them; they disappear from the
   chatters action list.
5. Disconnect + reconnect WhatsApp → ignore list still present (persisted per business).
6. Ownership: calling the routes for another user's business → 403.

## Files touched

**New**
- `prisma/migrations/<ts>_add_ignored_contact/migration.sql`
- `src/lib/utils/phone.ts`
- `src/app/api/businesses/[id]/whatsapp/ignore-list/route.ts`
- `src/app/api/businesses/[id]/whatsapp/recent-chatters/route.ts`
- `src/types/ignore-list.md.ts`
- `src/hooks/use-contact-ignore-list.ts`
- `src/components/features/dashboard/WhatsappIgnoreList.tsx`

**Modified**
- `prisma/schema.prisma` (new model + `Business.ignoredContacts`)
- `src/app/api/whatsapp/webhook/route.ts` (ignore gate; refactor `normalizePhone` to shared helper)
- `src/hooks/index.ts` (export new hook)
- `src/components/features/dashboard/WhatsappAuthContainer.tsx` (mount when authenticated)
