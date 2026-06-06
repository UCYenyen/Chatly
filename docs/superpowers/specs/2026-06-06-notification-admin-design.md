# Notification Admin — Web-Push Handover Alerts

**Date:** 2026-06-06
**Status:** Approved direction (owner forks chosen), implementing

## Problem

When a customer conversation is handed off from the AI to a human, the business
needs a person to jump into that exact WhatsApp Web chat fast. Today the
escalation point sends a single WhatsApp message to one `business.notificationPhone`.
This feature replaces that with multi-admin **web-push** routing: fair
distribution across several admins, a fallback that reassigns if the first admin
doesn't act, and a deep link that lands the admin in the right customer's
WhatsApp Web conversation.

## Critical constraint (already debugged)

Admins reply to customers **as the business**, through the business number's
**WhatsApp Web** session open in their browser. Chatly web is NOT a chat UI — it
only grants notification permission and receives push. Therefore:

- The push click must deep-link to `https://web.whatsapp.com/send?phone=<CUSTOMER_phone>`
  — the surface logged into the BUSINESS WhatsApp. Never a `wa.me` link (would
  open the admin's personal WhatsApp, wrong sender).
- Web-push subscriptions are per-browser-per-device. An admin must subscribe in
  the SAME browser/machine they use for WhatsApp Web. Onboarding must say this.

## Owner decisions (locked)

1. **Web-push only** — remove the admin-facing WhatsApp escalation/reminder/timeout
   messages to `notificationPhone`; web-push routing replaces them. (Customer ack
   and the AI/HUMAN mode flips stay.)
2. **Docker/self-hosted** — the ~2-min reassignment timer runs as an in-process
   `node-cron` job (same mechanism as the monthly-report scheduler), not Vercel cron.
3. **Durable revocable per-admin link** — no login; admin taps "Enable alerts" on
   each device via one revocable link the owner generates.

## Capability boundary (hard)

A notification admin can do EXACTLY ONE thing: receive handover alerts for the one
business they were added to. No dashboard, no customer data, no chat, no settings.
The owner adds and revokes them. This is why availability is **not** a self-managed
on-duty toggle (a toggle would be a setting/UI the admin isn't allowed) — it is
derived from whether they have a live push subscription.

## Data model

New models (Prisma, Postgres, cascade from Business):

- **NotificationAdmin** — `{ id, businessId(cascade), label, status: ACTIVE|REVOKED,
  inviteToken @unique (durable, revocable), lastAssignedAt DateTime?, createdAt }`.
  Identity = its push subscriptions. Scoped to one business.
- **NotificationDevice** — one push subscription per browser/device:
  `{ id, notificationAdminId(cascade), endpoint @unique, p256dh, authKey,
  userAgent?, createdAt, lastSeenAt }`. Pruned on 410/404.
- **HandoverAssignment** — per-attempt record driving fairness + claim control:
  `{ id, handoverId(cascade), notificationAdminId, claimToken @unique, assignedAt,
  status: ASSIGNED|CLAIMED|SUPERSEDED|EXPIRED }`. Excludes already-tried admins,
  and each attempt has its own claim nonce so a stale push can't claim.

`Handover` gains: `claimedAt DateTime?`, `claimedByAdminId String?`,
`webPushExhausted Boolean @default(false)` (fast cron filters).

## Routing — fairness + availability

- **Fairness: least-recently-assigned (LRA).** Pick the eligible admin with the
  oldest `lastAssignedAt` (nulls first), then stamp `lastAssignedAt = now`. One
  timestamp — naturally fair over time; no stored round-robin pointer (which
  breaks when admins are added/revoked) and no live load counting.
- **Availability = ACTIVE admin with ≥1 push subscription.** No heartbeat is
  possible (admins live in WhatsApp Web, not a Chatly dashboard) and a toggle is
  forbidden by the capability boundary. The subscription's existence is the best
  proxy; the **2-min fallback is itself the liveness probe** — if they don't claim,
  they weren't really there, and we move on.
- **Claimable.** The push click hits `GET /api/notify/claim?token=<claimToken>`,
  which atomically claims iff the token is the *current* assignment and the
  handover is still PENDING + unclaimed; then 302-redirects to
  `web.whatsapp.com/send?phone=<customerPhone>`. A stale token → "reassigned" page,
  no claim. Claim stops further reassignment.

## Fallback / escalation

In-process cron (`*/30 * * * * *`): for each PENDING, unclaimed, not-exhausted
handover whose current ASSIGNED assignment is older than the per-business timeout
(default **120s**, `handoverReassignSeconds` on Business, configurable):

1. **Invalidate the stale alert** — mark the assignment SUPERSEDED (late claims
   from it are rejected) and send a **`revoke` push** to that admin's devices; the
   service worker closes the stale notification by its `tag`.
2. **Reassign** — pick the next LRA-eligible admin *not already tried for this
   handover*; create a new ASSIGNED assignment + fresh claimToken; push the alert.
3. **Pool exhausted** — set `webPushExhausted = true` and stop. The existing
   AI-fallback (30-min HUMAN→AI revert) still applies; that timer is out of scope,
   just connected.

## Identity / invite flow

Owner adds an admin (label) → server creates NotificationAdmin + `inviteToken` →
owner copies the link `/<app>/notify/register/<inviteToken>` and shares it
privately. Admin opens it in the browser they use for WhatsApp Web → page shows
the business name + the "same browser as WhatsApp Web" instruction → taps **"Enable
alerts"** (gated — not auto-prompted) → browser permission → `POST /api/notify/register`
stores the subscription under the admin. Multi-device = open the same link on each
browser and enable. Revoke = owner deletes the admin → token dead, devices cascade-deleted.

Security note: anyone with the link can register a device and receive that
business's customer phone + last-message snippet in pushes. Tokens are long random
and shared privately; the only capability is receiving alerts; owner can revoke.
Acceptable for scope.

## Delivery

- `web-push` library; VAPID keys via env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT`). Public key exposed to the register page via a small endpoint.
- Service worker in `public/notify-sw.js`: handles `push` (two payload types:
  `alert` shows a notification with the claim URL + `tag = handover:<id>`; `revoke`
  closes notifications with that tag) and `notificationclick` (opens the claim URL).
- Send util fans out to all of an admin's devices; on 410/404 deletes that device.

## Plan gating

Reuse the existing `adminNotification` feature flag (PRO/ENTERPRISE). Owner UI to
add admins and the assignment logic both check `hasFeature(activePlan, "adminNotification")`.

## Hook-in

At the existing AI→HUMAN block in `src/app/api/whatsapp/webhook/route.ts` (after the
`Handover` is created): if the business has ≥1 eligible notification admin, call
`assignAndPushHandover(handoverId)` instead of the WhatsApp `notifyHandoverEscalation`.
Remove the WhatsApp reminder/timeout admin notifications. Keep `sendCustomerHandoverAck`
and all mode-flip logic untouched.

## Owner UI

`src/components/features/notifications/NotificationAdminsCard.tsx` — list admins
(label, status, device count), "Add admin" dialog, copy-invite-link, revoke
(AlertDialog). shadcn only. Placed on the settings/training surface near where
`notificationPhone` lives today.

## Out of scope

Chat UI, any admin dashboard/data access, the AI-fallback-to-bot 30-min timer
itself, the customer-facing wait experience.

## Migration / ops notes

- Dev `.env` points at the prod DB — do NOT `prisma migrate dev/reset`. Hand-write
  the migration SQL under `prisma/migrations/<ts>_add_notification_admins/` and run
  `prisma generate` only.
- Cron registered in `instrumentation.ts` alongside the report scheduler
  (production + nodejs runtime only).
