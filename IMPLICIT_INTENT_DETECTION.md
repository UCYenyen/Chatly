# Implicit Intent Detection

## Overview

Chatly's CS AI now understands **implicit customer intent** — meaning it can recognize when a customer is interested in a product, service, or action even without explicitly saying "I want to buy this" or "I'm interested in X".

## Why Implicit Intent Matters

**Explicit Intent Example:**
- Customer: "Saya ingin beli produk X"
- AI recognizes: ✅ Purchase intent

**Implicit Intent Example:**
- Customer: "Apa itu produk X?"
- AI recognizes: ✅ Interest in product X (without explicit statement)

Real customers rarely say "I'm interested in buying." They ask questions, compare options, and inquire about details. Chatly now captures those signals.

---

## Implicit Intent Patterns

### 1. **Curiosity Intent** — Asking About Products/Services
Customer behavior that signals interest:
- "Apa itu produk X?"
- "Gimana cara kerja service ini?"
- "Apa perbedaan antara paket A dan B?"
- "Apa saja fitur yang ada di produk ini?"

**AI Action**: Label as interested in that product/service intent.

---

### 2. **Pricing Intent** — Asking About Cost/Payment
Customer behavior:
- "Berapa harganya?"
- "Apa paket yang paling murah?"
- "Ada diskon gak?"
- "Bisa cicilan?"
- "Apa saja biaya yang termasuk?"

**AI Action**: Label as high-intent to purchase. Often triggers `generate_transaction` if price inquiry + product mention.

---

### 3. **Availability Intent** — Checking If Product Is Available
Customer behavior:
- "Apakah tersedia di wilayah saya?"
- "Apakah masih ada stok?"
- "Apakah bisa dikirim ke Surabaya?"
- "Kapan bisa ready?"

**AI Action**: Label as intent to purchase (currently checking prerequisites).

---

### 4. **Feature/Specification Intent** — Wanting to Know Details
Customer behavior:
- "Apa saja yang termasuk dalam paket ini?"
- "Berapa durasi garansinya?"
- "Apakah ada free trial?"
- "Apa requirement untuk menggunakan ini?"

**AI Action**: High-confidence intent signal. Customer in evaluation phase.

---

### 5. **Comparative Intent** — Comparing Multiple Options
Customer behavior:
- "Mana yang lebih baik, paket A atau B?"
- "Apa kelebihan produk ini dibanding kompetitor?"
- "Paket mana yang paling cocok untuk bisnis kecil?"

**AI Action**: Very high intent. Customer actively comparing to decide. Provide detailed comparison.

---

### 6. **Process/Procedure Intent** — Asking How to Buy/Use
Customer behavior:
- "Bagaimana cara order?"
- "Apa yang perlu saya lakukan untuk memulai?"
- "Bagaimana cara pembayaran?"
- "Berapa lama proses approval?"

**AI Action**: Critical intent signal. Customer ready to take action, just needs clarity on process.

---

### 7. **Terms/Conditions Intent** — Understanding Commitment
Customer behavior:
- "Apakah ada lock-in period?"
- "Bisa cancel kapan saja?"
- "Apa konsekuensi jika saya membatalkan?"
- "Bagaimana kebijakan return-nya?"

**AI Action**: Customer evaluating commitment. High purchase intent but needs assurance.

---

### 8. **Follow-up Deepening Intent** — Asking More Details After Explanation
Customer behavior:
- AI explains paket → Customer: "Bisa gak saya upgrade nanti?"
- AI explains features → Customer: "Apakah bisa customize?"
- AI gives price → Customer: "Ada payment plan yang lebih flexible?"

**AI Action**: Customer engaged, seeking solutions. High confidence intent.

---

## How Chatly Detects Implicit Intent

### In `src/lib/system-prompts/intents.ts`:
- Provides explicit rules for what counts as intent (questions, comparisons, etc.)
- AI evaluates LATEST customer message against these patterns
- Returns `true` if any implicit intent pattern matches

### In `src/lib/ai-engine.ts`:
- Schema descriptions clarify intent includes both explicit + implicit signals
- AI trained to recognize "asking about X = interested in X"

### In `src/lib/system-prompts/admin.ts`:
- Base system prompt explains that niat pelanggan = dari perilaku + pertanyaan, bukan hanya pernyataan

---

## Examples in Action

### Example 1: Implicit → Recorded as Intent
```
Customer: "Apa itu paket premium?"
↓
AI Detection: 
  - intent_premium_package: true (customer asking = interested)
  - intent_pricing: true (asking implies cost consideration)
↓
Analytics Event: Recorded both intents
↓
Business Sees: Customer interested in premium package
```

### Example 2: No Intent Signal
```
Customer: "Saya cuma browsing"
↓
AI Detection:
  - All intents: false (explicit non-interest)
↓
Analytics Event: No intent recorded
↓
Business Sees: Window shopper, not a qualified lead
```

### Example 3: Explicit → Recorded as Intent
```
Customer: "Saya ingin beli paket premium"
↓
AI Detection:
  - intent_premium_package: true (explicit)
  - generate_transaction: true (ready to purchase)
↓
Analytics Event: Recorded intent + flagged for transaction
↓
Business Sees: Hot lead ready to convert
```

### Example 4: Comparative Intent (Highest Signal)
```
Customer: "Mana yang lebih baik, paket basic atau premium?"
↓
AI Detection:
  - intent_basic_package: true
  - intent_premium_package: true
  - Comparative behavior = very high purchase intent
↓
Analytics Event: Both intents recorded
↓
Business Sees: Customer seriously evaluating, ready for detailed comparison
```

---

## Lead Temperature Mapping

With implicit intent detection, you can infer lead temperature:

| Pattern | Temperature | Confidence |
|---------|-------------|------------|
| "Apa itu produk X?" | Warm | Medium |
| "Berapa harga paket X?" | Hot | High |
| "Bisa dikirim ke [lokasi]?" + harga | Hot | Very High |
| "Mana paket yang terbaik untuk [use case]?" | Hot | Very High |
| "Bagaimana cara order?" | Hot | Critical |
| "Saya browsing saja" | Cold | High |
| "Terima kasih, cukup" | Cold | High |

---

## Implementation Notes

1. **Evaluation is per-message**: Each customer message is evaluated independently for intents
2. **All intents are tracked**: Multiple intents can be true for one message
3. **Implicit + Explicit coexist**: AI can detect both types in the same message
4. **Context matters**: History is available for AI to understand conversation flow
5. **Fallback to explicit**: If no implicit signals, only explicit intent is recorded

---

## Future Enhancements

- [ ] Lead scoring based on intent patterns + engagement frequency
- [ ] Intent confidence scoring (high/medium/low)
- [ ] Multi-intent correlation (e.g., feature Q + price Q = very high intent)
- [ ] Temporal patterns (repeat questions = more serious intent)
- [ ] Competitor mention handling (customer comparing = evaluating alternatives)
