# LLM Council Transcript — Chatly Financial Projection & Pricing

**Date:** 2026-06-05
**Subject:** Chatly — 2-Year Financial Projection (Q3 2026 – Q2 2028) + current website pricing
**Process:** 5 advisors (parallel) → anonymized peer review (parallel) → chairman synthesis

---

## Original Question
> Okay debate this — what do you think about the 2-Year Financial Projection CSV and the current pricing of the website?

## Inputs

**Live pricing** (`src/lib/utils/payment-gateway/plans.ts`):
- FREE: 100 msgs/mo, 1 channel
- STARTER Rp149K/mo: 10,000 msgs/mo, 5 channels (yearly Rp1,520,000)
- GROWTH Rp349K/mo: **UNLIMITED messages**, 15 channels, highlighted (yearly Rp3,560,000)
- PRO Rp749K/mo: **UNLIMITED messages**, unlimited channels, 99.9% SLA (yearly Rp7,640,000)
- ENTERPRISE: custom
- Yearly = 15% discount.

**Projection (CSV) key facts** (IDR; jt=million, M/B=billion):
- Variable cost FIXED per tier: Starter Rp16.7K, Growth Rp55.7K, Pro Rp167K/mo — from Rp5.57/msg × a capped message count, despite Growth/Pro being sold "unlimited."
- Fixed cost Rp16.1jt/mo baseline. Personnel = 8 founders × Rp2jt/mo, ramping with hires to ~Rp108jt/mo (Rp324jt/quarter) by Y2.
- Hosting = Contabo VPS Rp400K/mo, flat, for up to 1,200 tenants.
- Growth: 30 clients (Q3 2026) → 1,200 (Q2 2028). NO churn modeled.
- Break-even Q4 2027. Pre-seed Rp500jt. NPV (2yr, WACC 15%, post-tax) Rp101jt. IRR 25.8%. 2-yr ROI 159%. Avg EBITDA margin 28.5%. ARR end Q2 2028 ~Rp5.38B.
- Unit-econ BEP table uses Rp16.1jt FC: Starter BEP 122, Growth 55, Pro 28 — contradicting the personnel ramp.
- Tax 22%. Implementation fee Rp500K one-time on 40% of new Growth+.

---

## Advisor Responses

### The Contrarian
The model assumes 1,200 tenants on one Contabo VPS at flat Rp400K/month — each running a persistent unofficial WhatsApp session. That single line breaks the whole model. Gowa is an unofficial bridge; WhatsApp bans these at scale. One ban cascade and you lose dozens of tenants overnight. 1,200 concurrent WA sessions on a single ~$8 VPS is fantasy — RAM/CPU alone forces horizontal scaling you haven't costed. Hosting is the silent killer, not a rounding error. NO CHURN is disqualifying. Indonesian SMB SaaS churns 5–8%/month. Modeling pure accumulation to 1,200 clients inflates ARR (Rp5.38B), break-even, NPV, and IRR simultaneously. At 5% monthly churn you never reach 1,200; break-even slips past Q4 2027 or never arrives. The unit economics are internally contradictory and you admit it: GROWTH and PRO are sold "unlimited" but variable cost assumes a 30k-message cap at Rp5.57/msg. One power user blowing through 200k Gemini-billed messages on the Rp349K plan inverts the margin — you pay more than you collect. BEP table uses Rp16.1jt fixed cost while the P&L ramps personnel to ~Rp108jt/month. Your "Growth BEP 55 clients" is off by ~6x against your own opex. Real Growth break-even is ~340+ clients, not 55. Pricing: Rp349K unlimited is the trap tier — it cannibalizes Starter and uncaps your COGS. NPV Rp101jt on Rp500jt invested over 2 years is a 20% total return — below risk-free Indonesian govt bonds (~6–7%/yr) for a platform-risk startup. Walk, or cap messages and model churn first.

### The First Principles Thinker
The model is selling "unlimited" while costing it like it's metered. That single contradiction collapses the whole exercise, so start there. The variable cost is a fiction. Growth and Pro are sold unlimited, but the projection plugs in a fixed Rp55.7K/Rp167K derived from a capped message count times Rp5.57. Real unit economics on an unlimited tier are unbounded by design — your heaviest users (the ones who'll actually pick Growth) blow past the cap, and Gemini + Gowa charges scale with their volume, not your spreadsheet's. You haven't modeled a cost; you've modeled a wish. The honest move is either: meter every tier, or model variable cost as a distribution with a fat tail and price the p95 user. NPV Rp101jt on Rp500jt pre-seed with IRR 25.8% is a rounding error pretending to be a business. After two years of eight people, the entire enterprise generates ~$6,500 of net present value. That's not a venture outcome; it's a signal the model is measuring the wrong thing. The deeper error: no churn on an unofficial WhatsApp bridge. Gowa is unofficial — Meta bans these numbers routinely. Your single largest risk (account bans → involuntary churn → tenant loss) appears nowhere. A SaaS projection with zero churn isn't optimistic, it's invalid; every credible number downstream (ARR Rp5.38B, break-even Q4'27) inherits that error. Reframe the question. Don't ask "is the model credible." Ask: "what's our cost per heavy user, and what's our survival probability against Meta?" Until those two are answered, pricing and projections are decoration on an untested foundation.

### The Expansionist
Pricing leaves enormous money on the table, and that's the bull case. Chatly sits on the payment rail — it auto-generates invoices and captures conversion analytics. You are not selling messages; you are selling GMV. Flat tiers at Rp149K–749K price like a messaging tool when the product is a revenue engine. Reprice to value: a take-rate on transactions (0.5–1% of invoices generated) or a "Commerce" tier where Chatly earns on conversions it provably caused. The conversion-rate analytics is the proof — you can show a merchant "we closed Rp40jt you'd have lost," then charge a fraction of it. That uncaps revenue per client far beyond Rp293K/mo. The projection undersells three multipliers. First, expansion: 1,200 clients at flat ARPU ignores net revenue retention — payment volume compounds, so existing accounts should grow 20–40%/yr without new logos. Model NRR >120% and ARR isn't Rp5.38M, it's double. Second, the payments float and interchange: routing Indonesian SMB checkout through your rail is a fintech business with margins that dwarf SaaS. Third, the data: aggregated intent + conversion data across thousands of merchants is a category-defining dataset for SMB credit scoring and lending — a second company hiding inside the first. IRR 25.8% on a payment-rail land-grab in an almost-entirely-manual tens-of-billions market is a spreadsheet being polite. Raise the implementation-fee attach rate, add usage-based commerce pricing, and the same client base produces 2–3x this ARR. Price the upside in.

### The Outsider
Founder pays himself Rp2 juta a month? In Jakarta that's below a barista's wage. No engineer survives on that — so either the team quits the moment something better appears, or these "salaries" are fake and the real burn is hidden. Either way I don't believe the cost base. 1,200 paying customers and not one ever cancels? In two years? I run a shop — I cancel subscriptions all the time when they stop being useful. Zero churn isn't optimism, it's a spreadsheet that doesn't know how businesses behave. Strip it out and your ARR, NPV and break-even all move. All 1,200 clients on one Rp400k Contabo box? You're selling "99.9% uptime guarantee" on the Pro plan while running everything on a single cheap VPS with no backup. One reboot and every shop's WhatsApp bot goes dark at once. As an owner I'd never trust my customer chat to that. As an investor, that single server IS the company's risk and it's costing you Rp400k. The pricing also fights itself. GROWTH gives UNLIMITED messages for Rp349k, but it's hosted on the same tiny server. Unlimited usage + flat price + shared cheap infra = your best customers lose you money. Where's the per-message cost of the AI? It's invisible, which means it's wrong. And NPV Rp101jt on a Rp500jt raise with 25.8% IRR — for a startup? Investors want 10x, not a 25% return that a bond nearly matches. That number quietly says "low growth," which contradicts the 40x customer story. I'm not convinced, and I haven't even seen your competitors.

### The Executor
Variable cost is your time bomb. Fix it Monday, before anything else. **1. Kill "unlimited" on Growth/Pro (highest priority).** Your projection caps message cost per tier, but you sell uncapped. One heavy Growth tenant on Gemini wipes the Rp349K margin and goes negative — silently, since you don't meter it. Monday: add a fair-use cap (e.g. Growth 50K msgs/mo, Pro 200K) with overage at ~Rp10/msg. Keep the word "unlimited" only with an asterisk. ~1–2 days, the difference between the unit economics being real or fiction. **2. Re-model personnel honestly.** The BEP table uses Rp16.1jt FC while real fixed cost ramps to Rp16.1jt + Rp108jt personnel = ~Rp124jt/mo by Y2. Your true Growth BEP isn't 55 clients, it's ~400+. Redo the break-even with loaded FC before showing any investor. Half a day. **3. Model churn.** Zero churn to 1,200 clients is a tell that kills credibility. Plug in 3–5%/mo. It will push break-even right and probably blow the Rp500jt pre-seed runway — better you find that now than in diligence. **4. Stress the Contabo claim.** "1,200 Gowa sessions on one Rp400K VPS" — unofficial WhatsApp bridges get banned and are RAM-hungry. Don't promise it; budget real infra scaling. **5. Trivial:** push implementation fee to 100% of Growth+, not 40% — free margin. Do 1 and 2 this week. 3 before any investor deck. 4–5 are cleanup.

---

## Peer Review (anonymization map: A=Contrarian, B=First Principles, C=Expansionist, D=Outsider, E=Executor)

All five reviewers independently:
- **Chose the Executor (E) as strongest** — the only response converting critique into a sequenced, costed, prioritized fix-list, quantifying the corrected fixed cost (~Rp124jt/mo) and corrected Growth BEP (~400 vs 55), with effort estimates and ordering ("do 1–2 this week, 3 before any deck"). The Contrarian (A) and Outsider (D) landed the same diagnoses but stopped at indictment.
- **Named the Expansionist (C) as the biggest blind spot** — it layers a fintech/GMV-take-rate/credit-scoring upside on a foundation the others prove may not survive (Meta ban, no churn, one VPS, fake salaries): "a solvency problem mistaken for a monetization opportunity," "monetizing a vehicle that may not run," and the take-rate/payments pivot ironically *adds* BI/OJK regulatory liability.

**What ALL FIVE advisors missed (raised only in review):**
- **(a) Legal/regulatory as an existential binary gate** — unofficial WhatsApp bridge violates Meta ToS; auto-invoicing payments for Indonesian SMBs implicates Bank Indonesia/OJK payment-licensing (PJP/e-money); stored chat + customer-PII vectors implicate UU PDP. "One cease-and-desist or BI ruling from zero" — unquantified.
- **(b) FX exposure** — Rp500jt is denominated against USD-priced Gemini API + USD VPS; uncosted.
- **(c) The demand/CAC side was never challenged** — every advisor attacked cost, churn, and platform risk, but all silently accepted that 1,200 paying tenants will arrive, with thin marketing spend, 8 founders, and no funnel/CAC math. The single most unsupported number in the model.
- **(d) No sensitivity/downside scenario;** revenue-recognition and Xendit settlement-timing behind the NPV are unaddressed.

---

## Chairman's Verdict

### Where the Council Agrees
Four of five advisors converge hard, and the peer reviews ratify it: the projection rests on load-bearing fictions, and the "unlimited" Growth/Pro tiers are the structural defect. (1) "Unlimited" priced as metered is incoherent — VC modeled at a capped ~30K-msg count while Growth (Rp349K) and Pro (Rp749K) promise unlimited; one power user inverts the margin. (2) Zero churn is disqualifying — at 5%/mo the 30→1,200 ramp never completes and Q4 2027 break-even never arrives. (3) The BEP is understated — the table uses Rp16.1jt FC (Growth BEP 55) but the P&L ramps personnel to ~Rp108jt/mo; loaded FC ~Rp124jt/mo → real Growth BEP ~340–400. (4) One Rp400K VPS for 1,200 persistent Gowa sessions is fantasy, and a 99.9% Pro SLA on one box is self-refuting. (5) Rp2jt/mo founder pay is fake burn or a team that leaves. All five reviewers rated the Executor strongest and the Expansionist the biggest blind spot.

### Where the Council Clashes
The genuine tension is Expansionist vs. the other four. The Expansionist argues Chatly is underpriced: it sits on the payment rail, should charge a 0.5–1% GMV take-rate, model NRR >120%, and 2–3x the Rp5.38B ARR via commerce pricing, payments float, and an SMB credit-scoring dataset. The other four argue the model is built on fictions and solvency must be fixed before any upside is dreamed. The chairman sides with sequencing, not against the Expansionist's insight. The Expansionist is correct in the long run — Chatly sells GMV, not messages, and value-aligned pricing is exactly where the margin lives. But you cannot monetize a vehicle that may not run. Layering fintech upside onto a foundation with no churn, one VPS, fake salaries, and an unofficial bridge Meta bans is "a solvency problem mistaken for a monetization opportunity." Worse, the take-rate pivot adds BI/OJK payment-licensing liability to a model that hasn't survived its existing platform risk. Value-pricing is the Series A story; it is not the pre-seed fix.

### Blind Spots the Council Caught
(a) Legal/regulatory is an existential binary gate — Meta ToS, Bank Indonesia/OJK payment-licensing (PJP/e-money), UU PDP over stored chat/PII vectors. "One cease-and-desist or BI ruling from zero," unquantified by anyone. (b) FX exposure — Rp500jt denominated against USD-priced Gemini API and USD VPS. (c) The demand/CAC side was never challenged — all five accepted 1,200 paying tenants arrive with thin marketing, 8 founders, and no funnel/CAC math; the most unsupported number in the model. (d) No sensitivity/downside scenario; revenue-recognition and Xendit settlement timing behind the NPV are unaddressed.

### The Recommendation
Is the projection credible? **No.** It is directionally a real business — a genuine market, a real product, real conversion analytics — but it rests on four-to-five load-bearing fictions: unlimited-but-metered pricing, zero churn, free founders, one VPS, and an understated BEP. The headline returns are marginal as stated: NPV Rp101jt (~$6,500 after two years of eight people), IRR 25.8% — below Indonesian government bonds for a platform-risk startup. Once you add realistic churn (3–5%/mo), loaded personnel (~Rp124jt/mo), real infra, and FX, those returns likely go negative. Investors want 10x; 25.8% IRR signals low growth and contradicts the 40x customer-count story. Is the pricing right? **Partly.** The metered Starter (Rp149K/10K msgs) is fine — honest, value-aligned, defensible. The "unlimited" Growth and Pro tiers are the core defect: they make your best customers your least profitable and render unit economics unknowable. The business can work — but only with value-aligned, capped pricing, modeled churn, and loaded costs. Fix the foundation; the Expansionist's GMV upside is the next chapter, not this one.

### The One Thing to Do First
Replace "unlimited" on Growth and Pro with a fair-use cap plus overage (Growth 50K, Pro 200K msgs/mo at ~Rp10/msg over) — and rebuild the model with realistic churn (3–5%/mo) and fully loaded personnel (~Rp124jt/mo) — before showing it to any investor or onboarding at scale. This single change converts the unit economics from fiction to fact and surfaces the true Growth BEP (~400, not 55) on your own terms instead of in diligence.
