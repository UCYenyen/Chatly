# LLM Council Transcript — Chatly Plan Feature-Gating

**Date:** 2026-06-05
**Subject:** Which features can be locked on lower plans / unlocked on higher plans WITHOUT triggering churn
**Process:** 5 advisors (parallel) → anonymized peer review (parallel) → chairman synthesis

---

## Original Question
> Our lecturer recommended that we lock some features for lower plans and unlock them later on higher plans. What features can we lock without triggering customer leaves?

## Feature inventory (grounded in the codebase)
Per business: **ringkasan** (dashboard), **training** (AI personality/tone · Knowledge Base RAG upload · test-chat preview), **analytics** (Conversion-Rate · Verified Conversion · Intent Dashboard · Message Volume · Token Usage · Top Intents · AI Insight), **transaksi**, **langganan**, **api-management** (secret API keys + webhooks) · **api-docs**. Plus: multi-business, AI/HUMAN handoff, ignored-contacts, channels, history retention. Core value loop = bot auto-replies from uploaded KB (RAG) → detects purchase intent → sends payment invoices. Messages = main COGS driver. Current Growth/Pro = "unlimited" (known margin flaw).

Current plans: FREE 100 msgs/1ch · STARTER Rp149K 10K/5ch · GROWTH Rp349K unlimited/15ch · PRO Rp749K unlimited+SLA · ENTERPRISE custom.

---

## Advisor Responses

### The Contrarian (what backfires)
Gating the core loop is where this dies. The retained value is bot replies + Knowledge Base + conversion proof. Touch any of those and you teach SMBs the product doesn't work at their price. Worst gate: the message cap itself. 100 msgs/mo on FREE isn't a teaser, it's a broken bot — a single chatty customer burns it, the bot goes silent mid-conversation, and the SMB concludes "it ignores my customers" and leaves before ever seeing value. You churn people during the trial, not after. Even STARTER's 10K can clip a real seller in a week; a bot that stops replying on day 20 reads as an outage, not an upsell. Gating Knowledge Base (RAG document count, re-uploads, or personality/tone) is self-sabotage: a thin KB means wrong/hallucinated answers to real customers in public WhatsApp threads. You're not locking a feature, you're degrading answer quality in front of the buyer. Gating Conversion-Rate / Verified Conversion is the dumbest move: that's the ROI proof that justifies the bill. Hide it and renewal becomes "Rp349K for... what?" What the lecturer gets wrong: "lock features to push upgrades" assumes all features are equally lockable. They're not. The core loop is load-bearing — gate it and the bot visibly fails to a paying customer's customers, which is irreversible. Safe gates only: developer surface (API keys/webhooks/Docs), data export, AI Insight recommendations, multi-business count, channel count, advanced/real-time analytics granularity, 24/7 support + SLA. These are "more/faster," never "the bot stopped working." And kill "unlimited" — it's the margin bomb that funds the churn you're trying to prevent.

### The First Principles Thinker (reframe the axis)
Feature-gating exists to do one thing: convert growth in realized value into growth in revenue without ever charging the customer before they feel the value. A gate works when it sits on an axis that rises naturally as the customer succeeds — so hitting the wall feels like graduation, not punishment. A gate triggers cancellation when it sits on the core value loop, because then the gate isn't asking "pay more to do more," it's asking "pay more to keep what already worked." So the right axis is almost never binary feature on/off. It's usage/value metrics that scale with the customer's own success: channels, message volume, multi-business, and historical analytics depth (retention window). These are value-expanding — a bigger SMB legitimately needs more channels and more messages, and crucially these are also your COGS axis, so gating message volume aligns price with cost and kills the "unlimited" margin flaw simultaneously. Gate the meter, not the feature. Value-core, never gate (gating = sabotage + churn): the bot reply loop, Knowledge Base/RAG upload, intent detection + payment invoices, and AI/HUMAN handoff. These ARE the product. Conversion-Rate proof is also core — it's the evidence that justifies the subscription; hiding it removes the reason to stay. Value-expanding, safe to gate: API keys + webhooks (only scaling/technical businesses want them, and they signal high willingness-to-pay), AI Insight/recommendations, deeper analytics (Verified Conversion, Token Usage, longer history retention), multi-business, and SLA. Concretely: kill "unlimited." Make message volume and channels the primary paid axis across all tiers. Keep the entire core loop fully functional on every paid plan — including basic conversion proof. Reserve API access, advanced/longitudinal analytics, AI Insight, and multi-business as the upgrade pull.

### The Expansionist (the upside)
The conversion-proof analytics IS the upgrade engine. Build the gate around it. Your strongest pull is Verified Conversion + Conversion-Rate analytics, because they prove ROI in the merchant's own currency: rupiah closed. Gate the depth, not the number. FREE/STARTER see the headline conversion rate; GROWTH+ unlocks the buyer lists, transaction drill-downs, attribution, and CSV/export. Once a merchant sees "the bot closed Rp40M this month," Rp349K is a rounding error — the product literally quantifies the upgrade's value. AI Insight = the PRO carrot. Raw analytics on GROWTH, AI recommendations ("80% of lost buyers ask about shipping — add it to your KB") on PRO. It converts data into action, which is what time-poor SMB owners actually pay for. API + webhooks = a hard GROWTH/PRO wall with zero churn risk. Devs/agencies integrating into checkout/CRM are your highest-LTV, lowest-price-sensitivity segment. FREE/STARTER never miss it; those who need it will always pay up. Natural expansion lives in three meters: channels (5→15→unlimited), multi-business (gate to GROWTH+ — agencies managing many merchants are pure expansion), and message volume. Tie seats/team handoff (AI/HUMAN) to PRO: the moment a merchant adds a human CS agent, they've outgrown solo and will pay per scale. Don't gate the core loop or KB upload. Land everyone on the addictive WhatsApp→bot→invoice loop, let usage (messages, channels, businesses) and proof (analytics) pull them up. Gate ambition, never the habit.

### The Outsider (warung owner on Rp149K)
Rp149K is what I can afford. I run my warung, I answer customers myself when the bot can't. Here's how the locks land for me. FAIR, I get it: API keys, webhooks, API docs locked away. I don't even know what those words mean. That's for people with programmers. Of course it costs more. No anger. Managing many shops in one account. I have one shop. If I had five, sure, charge me. 15 channels vs 5. I have one WhatsApp number. Five is already generous. Exportable reports, 24/7 support, uptime guarantee for the top plan. Nice-to-have for big sellers. I won't cry. INSULTING, I'd quit: If "human takeover" is locked. The whole reason I trust the bot is that I can grab the chat when a customer is angry or wants something special. Lock that and you've handcuffed me with a robot I can't override. That's not a feature, that's a hostage situation. I cancel. If the bot can't send payment links on my plan. That's literally why I'm paying. Selling is the point. Lock that and the whole thing is useless. Bait-and-switch. If I can't see "verified sales the bot caused" even as a simple number. How do I know this thing earns its Rp149K? Hide that and I'll assume it does nothing and stop paying. If "ignore these contacts" is locked. My supplier and my mother chat me. The bot shouldn't reply to them. That's basic safety, not a luxury. Lock the developer toys and the multi-shop scale. Never lock the things that let me sell, take over, and prove it made money.

### The Executor (tier-by-tier matrix)
Tier-by-tier gating matrix. Messages stay the meter; core loop (bot replies + RAG + invoices) stays ungated on every paid tier.

| Feature | FREE | Starter (149K) | Growth (349K) | Pro (749K) | Enterprise |
|---|---|---|---|---|---|
| Msgs / Channels | 100 / 1 | 10K / 5 | Unlimited / 15 | Unlimited / 15+ | Custom |
| # Businesses | 1 | 1 | 3 | 10 | Custom |
| Team seats (AI/HUMAN handoff) | 1 | 2 | 5 | 15 | Custom |
| KB documents | 3 | 25 | 200 | Unlimited | Unlimited |
| Custom personality/tone | Preset only | Full | Full | Full | Full |
| Core analytics (Conversion, Volume, Top Intents) | yes | yes | yes | yes | yes |
| Verified Conversion + Intent Dashboard | — | yes | yes | yes | yes |
| AI Insight (recommendations) | — | — | yes | yes | yes |
| Data export (CSV) | — | yes | yes | yes | yes |
| Token Usage analytics | — | yes | yes | yes | yes |
| API keys + webhooks | — | — | yes | yes | yes |
| History retention | 7d | 30d | 12mo | Unlimited | Unlimited |
| Ignored contacts | 5 | 50 | Unlimited | Unlimited | Unlimited |
| SLA / priority support | — | — | — | yes | yes |

CHEAP (integer/boolean checks against plan limits, enforced server-side at create/query time): channels, # businesses, seats, KB doc count, ignored contacts, personality toggle, API on/off, hiding AI Insight/export buttons. All config flags — one `planLimits` map plus guard checks in route handlers. HARD: history retention (needs a scheduled prune job + retention column on ChatLog, and time-window filters on every analytics query — don't lock data you already store, just stop surfacing/pruning it). Verified Conversion gating is moderate (query filter). MUST STAY UNGATED on all paid tiers: bot auto-replies, RAG retrieval, payment invoices, Conversion-Rate proof, Test-chat preview. Gating any of these kills the value SMBs pay for. Never gate Conversion-Rate — it's your upgrade-justifying ROI proof. FREE preset-only personality and 3-doc KB are the cheapest, lowest-churn pushes.

---

## Peer Review (anonymization map: A=Outsider, B=Executor, C=Contrarian, D=Expansionist, E=First Principles)

- **Strongest:** 4 of 5 reviewers chose the **Executor (B)** — the only response converting principle into a buildable tier matrix WITH engineering-cost flags. 1 chose **First Principles (E)** for the cleanest underlying rule ("gate the meter, not the feature") that subsumes the others.
- **Biggest blind spot:** 3 of 5 chose the **Outsider (A)** — invaluable churn signal but zero pricing structure, ignores that messages are the COGS driver (would leave everything ungated, financially unviable), and overgeneralizes one persona (ignored-contacts as universal). 1 chose the **Executor (B)** — its tidy matrix re-introduces the very failure modes the Contrarian warns about (100-msg FREE cap + 7-day retention = "broken bot"; gating personality/KB doc count risks reputation-damaging thin-KB answers).
- **UNANIMOUS blind spot ALL FIVE missed:** the **message-cap failure mode / overage mechanism.** Everyone said "gate the meter / kill unlimited," but the meter is ALSO the core-loop throttle — a hard silent cutoff mid-conversation kills the bot in a live customer thread (worse churn + reputation damage than any locked feature). The fix and the forbidden gate are the SAME DIAL. Nobody designed graceful degradation: soft caps + overage/top-up billing (pay-as-you-go past quota, never hard-stop) + owner alerts at 80/100% + auto-throttle-not-kill. Also missed: grandfathering/migration of EXISTING "unlimited" Growth/Pro users when killing unlimited (risks churning the current paying base); downgrade/expansion mechanics (what happens to KB doc #26 or business #4 when a plan lapses — read-only freeze, not deletion); WhatsApp/Gowa per-conversation pass-through costs; gaming/spam inflating the meter.

---

## Chairman's Verdict

### Where the Council Agrees
The council reached strong consensus on the gate-ability axis: gate value-expanding features, never the value-core loop. Safe to gate (near-zero churn risk): API keys + webhooks (devs/agencies are highest-LTV, lowest price-sensitivity — a clean Growth/Pro wall), AI Insight (the Pro carrot), multi-business (agency expansion), team seats (AI/HUMAN handoff capacity), channels (5→15→unlimited), analytics depth/export (CSV, buyer drill-downs), history retention window, SLA/24-7, KB document count, and custom personality on FREE (preset-only). The Outsider's own words ratify these: "developer toys and multi-shop scale" are fair locks. Equally strong consensus on what must stay UNGATED on every paid tier: bot auto-replies, RAG knowledge base, payment invoices, AI/HUMAN handoff, Conversion-Rate ROI proof, and ignored-contacts as basic safety. And the unifying lever all five circle: kill "unlimited," gate the message meter. Messages are the COGS driver; metering messages is simultaneously the primary monetization axis and the margin fix — one dial solves both.

### Where the Council Clashes
The real fight is customer-perceived fairness vs. tidy tiering. The Executor delivers the only buildable artifact — a clean tier-by-tier matrix with engineering-cost flags — but to make it tidy it gates KB doc count, personality, and 7-day FREE retention, and caps FREE at 100 messages. The Outsider (a Rp149K warung owner) and the Contrarian both attack exactly these moves: gating KB docs and personality starves the bot into thin-KB hallucinations in public WhatsApp threads, damaging the merchant's reputation — a self-inflicted wound, not an upsell. The sharper clash is the Outsider's claim that human-takeover and ignored-contacts are "basic rights," not premium features. Locking handoff is "a hostage situation"; locking ignored-contacts reads as broken safety. The blind-spot review correctly notes the Outsider overgeneralizes one persona and offers zero pricing structure — left alone, it leaves everything ungated and financially unviable. So the synthesis is neither pure: take the Executor's structure, but bend it toward the Outsider/Contrarian on the loop-adjacent features.

### Blind Spots the Council Caught
The unanimous miss: the message-cap failure mode. Everyone said "gate the meter," but the meter is also the core-loop throttle — the fix and the forbidden gate are the same dial. A hard, silent cutoff mid-conversation kills the bot in a live customer thread: worse churn and worse reputation damage than any locked feature, because the SMB concludes "it ignores my customers." Nobody designed graceful degradation. Required: soft caps + overage/top-up billing (pay-as-you-go past quota, never hard-stop), owner alerts at 80% and 100%, and auto-throttle-not-kill. The meter monetizes AND protects the loop only if it bends instead of breaking. Three more gaps: (1) Grandfathering — killing "unlimited" risks churning the current paying Growth/Pro base; migrate them on legacy terms or with generous transition quotas. (2) Downgrade/expansion mechanics — what happens to KB doc #26 or business #4 when a plan lapses (read-only freeze, not silent deletion). (3) WhatsApp/Gowa per-conversation pass-through costs plus spam/gaming inflating the meter — model true per-message COGS before pricing the overage.

### The Recommendation
Make usage metering the PRIMARY monetization and margin fix; feature-gating is SECONDARY. Adopt the Executor matrix, corrected per Contrarian/Outsider:
- **Meter (primary):** messages + channels. Kill unlimited; replace with soft caps + overage top-up. Channels 1→5→15→unlimited.
- **Gate (secondary, cheap boolean/integer guards):** API+webhooks (Growth+), AI Insight (Pro raw→AI recommendations), multi-business (Growth+), team seats, KB doc count (generous, not starving), analytics depth/export only, retention window, SLA (Pro).
- **Keep on ALL paid tiers:** bot replies, RAG, payment invoices, AI/HUMAN handoff, Conversion-Rate headline (gate only drill-down/CSV), and a basic ignored-contacts allowance.
- **FREE:** preset-only personality and a doc cap high enough to answer competently (not 3 docs that hallucinate); the cheapest, lowest-churn push to Starter.

### The One Thing to Do First
Ship a `planLimits` config map + server-side guards in the route handlers for the high-consensus, cheap gates (API access, AI Insight, multi-business, team seats, channels, KB doc count, analytics export) — AND in the same change, pair the message meter with a soft-cap + overage top-up path (80%/100% alerts, throttle-not-kill), never a silent cutoff. No hard gate ships until the graceful-degradation meter ships alongside it. The guard map makes every other gate a one-line entry; the overage path makes the margin fix safe to turn on.
