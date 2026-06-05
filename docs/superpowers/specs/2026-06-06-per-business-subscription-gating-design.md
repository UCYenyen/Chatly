# Per-Business Subscription Gating — Design

## Problem

The subscription model should be **per business**, not per account. A user can own
unlimited businesses; each business independently requires its own paid subscription
to run its WhatsApp chatbot.

The current implementation contradicts this in two places:

1. **Business creation is gated by plan.** `POST /api/businesses` calls `getUserPlan`
   (the highest active plan across all the user's businesses) and then
   `enforceNumericLimit(plan, "businesses", ...)`. This caps business count
   (FREE=1, GROWTH=3, PRO=10) and creates a paradox: creating a second business
   requires a multi-business plan, yet plans are purchased per business.

2. **The chatbot never checks subscription.** `POST /api/whatsapp/webhook` runs the AI
   engine for any business regardless of subscription state, so unpaid businesses get
   a working chatbot for free.

## Goals

- Any user can create unlimited businesses, including users with zero subscriptions.
- A business's chatbot runs **only** when that business has an active **paid** plan
  (Starter, Growth, Pro, or Enterprise). FREE does not run the chatbot.
- When a message arrives for a business without an active paid plan, the webhook stays
  completely silent and persists nothing (no ChatLog, no AI call).

## Non-Goals

- No dashboard UI indicator for "chatbot inactive / choose a plan" in this iteration
  (tracked as optional follow-up).
- No changes to other per-business limits (channels, knowledge documents, ignored
  contacts) — they continue to resolve via `getBusinessPlan`.
- No changes to the payment/wallet/subscription purchase flow.

## Design

### 1. Unlimited businesses

In `src/app/api/businesses/route.ts` `POST` handler, remove the business-count gate:

- Remove the `getUserPlan` import and call.
- Remove the `businessCount` query.
- Remove the `enforceNumericLimit(plan, "businesses", "bisnis")` call.

Business creation no longer depends on any plan. Other imports/usages of
`PlanLimitError` / `planLimitResponse` in this file are removed only if they become
unused after this change.

### 2. Chatbot gate in the webhook

Gate the **message-handling path only** (connection/disconnection events stay
unaffected so WhatsApp connection status keeps updating).

After `whatsappAuth` is resolved and the inbound payload is confirmed to be a real text
message, and **before** the customer `chatLog.create` (currently around
`src/app/api/whatsapp/webhook/route.ts:339`), add:

```ts
const businessPlan = await getBusinessPlan(whatsappAuth.businessId);
if (!isPaidPlan(businessPlan)) {
  return <200 OK acknowledgement>;
}
```

- `getBusinessPlan` (in `src/lib/utils/payment-gateway/plan-guard.ts`) already returns
  `FREE` when there is no subscription or status is not `ACTIVE`, so expired/cancelled
  subscriptions automatically silence the chatbot.
- `isPaidPlan` (in `src/lib/utils/payment-gateway/plans.ts`) treats every plan except
  `FREE` as paid, so Starter/Growth/Pro/Enterprise all enable the chatbot.
- Returning `200` acknowledges the webhook so GoWA does not retry. Nothing is written
  to the database on this path.

### 3. Remove the "businesses" plan dimension

Business count is no longer a plan differentiator, so remove it from the plan-limit
system to avoid plan cards advertising contradictory "1 bisnis / 3 bisnis" limits:

- `src/types/plan-limits.md.ts` — remove `"businesses"` from the `NumericLimitKey` union.
- `src/lib/utils/payment-gateway/plan-limits.ts`:
  - remove the `businesses` field from every entry in `PLAN_LIMITS`.
  - remove the `businesses` entry from `NUMERIC_FEATURE_LABELS`.
  - remove `"businesses"` from `NUMERIC_FEATURE_ORDER`.

`PlanLimits` type (in `plan-limits.md.ts`) is updated accordingly so it no longer
requires a `businesses` key.

## Data flow after change

```
WhatsApp message
  -> webhook resolves whatsappAuth.businessId
  -> connection event? handle + return (unchanged)
  -> text message:
       getBusinessPlan(businessId)
         -> isPaidPlan? NO  -> return 200, persist nothing   (silent)
         -> isPaidPlan? YES -> chatLog.create -> runChatlyAIEngine -> reply
```

## Edge cases

- **Subscription expires mid-life:** status flips off `ACTIVE`, `getBusinessPlan`
  returns `FREE`, chatbot goes silent on the next inbound message.
- **Enterprise plan (amount 0):** still `!== FREE`, so `isPaidPlan` is true and the
  chatbot runs.
- **Connection/disconnection events for unpaid businesses:** still processed; only
  message handling is gated.
- **Existing FREE businesses currently auto-replying:** intentionally stop replying
  after this change until a paid plan is chosen.

## Testing

No test runner is configured in this repo. Verify manually:

- Create multiple businesses on an account with no subscription — all succeed.
- Send a WhatsApp message to a business without an active paid plan — no reply, no new
  ChatLog row.
- Activate a paid plan, send a message — chatbot replies and ChatLog is written.
- Confirm plan cards no longer show a "bisnis" line.
- `pnpm lint` and `pnpm build` pass.
