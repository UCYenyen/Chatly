# How Chatly Works

Chatly is an AI-powered WhatsApp chatbot system that combines Retrieval-Augmented Generation (RAG), intent analytics, and automatic transaction generation. This document explains the complete end-to-end architecture and how each major component functions.

## System Overview

Chatly is a multi-tenant platform where each business:
1. Uploads knowledge documents (FAQ, product info, policies)
2. Configures business intents (predefined product/service categories)
3. Receives WhatsApp messages from customers
4. Gets AI-powered responses augmented with relevant knowledge
5. Can automatically generate payment transactions based on intent
6. Tracks conversation analytics and intent mentions

The system uses **Gemini 2.5 Pro/Flash Lite** for AI inference, **pgvector** for semantic search, and **PostgreSQL** as the persistent data store.

---

## End-to-End Message Flow

When a customer sends a WhatsApp message, here's what happens:

```
Customer Message
    ↓
[WhatsApp Webhook] → signature verification → device lookup
    ↓
[Message Deduplication] → check messageId uniqueness
    ↓
[Atomic ChatLog Save] → USER message persisted immediately
    ↓
[AI Engine] → 10-step pipeline (see below)
    ↓
[Intent Analytics] → record intent mention + metadata
    ↓
[Transaction Generation] → create payment transaction if flagged
    ↓
[Conditional Send] → send AI response if should_respond=true
    ↓
[ConversationState Update] → persist AI/HUMAN mode
    ↓
Customer Receives Response
```

### Why This Matters

- **Atomic saves**: ChatLog is persisted *before* AI processing, preventing message loss if inference fails
- **Deduplication**: WhatsApp webhook may retry; messageId prevents duplicate responses
- **Conditional sending**: AI can decide not to respond (e.g., if confidence is low or escalation is needed)
- **Mode tracking**: System knows whether next message expects human or AI response

---

## RAG System: Knowledge Ingestion & Retrieval

### Phase 1: Document Upload & Extraction

**File**: `src/lib/rag-ingestion.ts`

When a business uploads a document (PDF, TXT, etc.):

```
Document Upload
    ↓
[Gemini 2.5 Pro] → extract full text content
    ↓
[Chunk on \n\n] → split into semantic chunks (paragraphs)
    ↓
[Gemini Embedding 001] → create 768-dimensional vector for each chunk
    ↓
[Atomic DB Insert] → DELETE old chunks for this doc, INSERT new ones
    ↓
DocumentChunk table populated with:
  - businessId
  - content (full text)
  - embedding (vector)
  - createdAt
```

**Why atomic DELETE-then-INSERT?**
- Ensures no orphaned chunks from old versions
- Maintains business_id + document scoping
- Single transaction = no race conditions if user re-uploads

**Storage**: All chunks indexed by `businessId`, enabling per-business search isolation.

---

### Phase 2: Retrieval During Conversation

**When**: Every AI response generation

```
User Message
    ↓
[Cosine Distance Query] → pgvector <=> operator
    ↓
SELECT id, content FROM document_chunk
WHERE businessId = ?
ORDER BY (embedding <=> user_embedding)
LIMIT 5
    ↓
[Top 5 Chunks] → passed to AI as context
    ↓
[Prompt Injection]: Chunks embedded in system prompt
```

**How It Works**:
- User message → Gemini Embedding 001 → 768d vector
- pgvector computes cosine distance to all business's chunks
- Top 5 most similar chunks retrieved
- Chunks injected into system prompt as `<knowledge>` block
- AI generates response using both intent and knowledge context

**Efficiency**:
- pgvector index on businessId makes per-business search O(n log n)
- Only top 5 retrieved (not full scan)
- Embedding generation happens once per message

---

## AI Conversation Engine: 10-Step Pipeline

**File**: `src/lib/ai-engine.ts`

The core inference pipeline that generates responses. Each step builds on the previous one.

### Step-by-Step Breakdown

#### Step 1-2: Fetch Business Context
```typescript
const business = await prisma.business.findUnique({
  where: { id: businessId },
  include: { subscription: true, intents: true }
});
```
Retrieves business configuration, subscription tier, and predefined intents.

#### Step 2.5: Intent Key Mapping
```typescript
const intentMap = intents.reduce((acc, intent) => {
  acc[sanitizedKey(intent.name)] = intent.id;
  return acc;
}, {});
```
Creates a bidirectional map:
- `intent_name` → sanitized key (e.g., "Product Purchase" → "product_purchase")
- Used later to map AI predictions back to intent IDs

**Why sanitize?**
- JSON schema requires alphanumeric keys
- AI learns to output `product_purchase` instead of "Product Purchase"
- Prevents hallucinated intent keys

#### Step 3: RAG Retrieval
```typescript
const chunks = await prisma.$queryRaw`
  SELECT id, content
  FROM document_chunk
  WHERE businessId = ${businessId}
  ORDER BY (embedding <=> ${embedding}::vector)
  LIMIT 5
`;
```
Retrieves top 5 knowledge chunks using pgvector cosine distance.

#### Step 4: System Prompt Composition
```typescript
const systemPrompt = `You are ${business.aiTone} assistant...
<knowledge>${chunks.map(c => c.content).join('\n')}</knowledge>
<intents>${Object.keys(intentMap).join(', ')}</intents>`;
```
Builds the prompt that guides AI behavior:
- Business's configured tone (e.g., "friendly", "professional")
- All knowledge chunks injected as context
- Available intent keys listed

#### Step 5: Chat History Fetch
```typescript
const history = await prisma.chatLog.findMany({
  where: { businessId, phone },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: offset
});
```
Fetches last 10 messages for conversation context. Helps AI understand ongoing discussion.

#### Step 6: Intent Analytics Schema Generation
```typescript
const analyticsSchema = {
  type: 'object',
  properties: {
    intent_category: {
      enum: Object.keys(intentMap),
      description: 'Which intent was mentioned?'
    },
    mentioned_product: { type: 'string' },
    generate_transaction: { type: 'boolean' }
  }
};
```
Dynamic JSON schema that enforces:
- Intent keys match business's configured intents
- Transaction flag presence
- Product mentions optional

#### Step 7: Gemini Configuration
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    responseSchema: analyticsSchema,
    responseMimeType: 'application/json'
  }
});
```
Configures Gemini to:
- Use Flash Lite (faster inference)
- Return structured JSON matching schema
- Fail if schema is violated

#### Step 8: User Prompt Construction
```typescript
const userPrompt = `Customer: ${userMessage}\n\nRespond in ${business.language}...`;
```
Formats user message with language preference.

#### Step 9: API Call & Response Parsing
```typescript
const result = await model.generateContent([
  { role: 'user', parts: [{ text: systemPrompt }] },
  { role: 'user', parts: [{ text: userPrompt }] }
]);

const response = JSON.parse(result.response.text());
```
Calls Gemini with full context, gets JSON response.

#### Step 10: Intent Key Remapping
```typescript
const intentId = intentMap[response.intent_category];
const finalResponse = {
  response: response.message,
  intent_analytics: {
    intentId,
    intentName: response.intent_category,
    mentioned_product: response.mentioned_product
  },
  generate_transaction: response.generate_transaction,
  escalate_to_human: response.escalate_to_human,
  end_conversation: response.end_conversation,
  should_respond: response.should_respond,
  next_mode: response.next_mode
};
```
Maps sanitized intent key back to original intent ID for database storage.

---

## WhatsApp Webhook: Message Processing

**File**: `src/app/api/whatsapp/webhook/route.ts`

This is the entry point for all incoming WhatsApp messages from Gowa API.

### Step 1: Signature Verification
```typescript
const hmac = crypto
  .createHmac('sha256', GOWA_WEBHOOK_SECRET)
  .update(requestBody)
  .digest('hex');

if (hmac !== request.headers.get('x-gowa-signature')) {
  return new Response('Invalid signature', { status: 403 });
}
```
HMAC-SHA256 verification ensures the webhook is from Gowa, not an attacker.

### Step 2: Extract Message Data
```typescript
const phone = webhook.data.message.from.replace(/[^\d]/g, '');
const messageId = webhook.data.message.id;
const userMessage = webhook.data.message.text;
```
Parses WhatsApp message payload.

### Step 3: Deduplication Check
```typescript
const existing = await prisma.chatLog.findUnique({
  where: { messageId }
});

if (existing) return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
```
Prevents duplicate responses if Gowa retries webhook.

### Step 4: Atomic ChatLog Save
```typescript
await prisma.chatLog.create({
  data: {
    businessId,
    phone,
    role: 'USER',
    content: userMessage,
    messageId
  }
});
```
Persists user message *immediately*, before AI processing. If anything fails after this, the message is never lost.

### Step 5: Conversation State Lookup
```typescript
const state = await prisma.conversationState.findUnique({
  where: { businessId_phone: { businessId, phone } }
});
```
Checks if conversation is in AI mode or awaiting human response.

### Step 6: AI Engine Invocation
```typescript
if (state?.mode === 'AI') {
  const result = await generateChatlyAIResponse(businessId, phone, userMessage);
  // Process result
} else {
  // Conversation in HUMAN mode, skip AI
}
```
Only generate AI response if in AI mode.

### Step 7: Intent Analytics Recording
```typescript
if (result.intent_analytics?.intentId) {
  await prisma.analyticsEvent.create({
    data: {
      businessId,
      phone,
      intentCategory: result.intent_analytics.intentName,
      mentionedProduct: result.intent_analytics.mentioned_product,
      createdAt: new Date()
    }
  });
}
```
Records intent mentions for later analytics (which products/intents are popular).

### Step 8: Transaction Generation
```typescript
if (result.generate_transaction) {
  const transaction = await createCustomerTransaction(
    businessId,
    phone,
    result.transaction_amount
  );
  // Send invoice via Xendit
}
```
If AI determined a payment is needed, create and send invoice.

### Step 9: Conditional Response Send
```typescript
if (result.should_respond) {
  await sendWhatsAppMessage({
    to: phone,
    text: result.response
  });
}
```
Send AI response only if confidence is high enough. Prevents low-quality outputs.

### Step 10: Update Conversation State
```typescript
const nextMode = result.next_mode || 'AI';
await prisma.conversationState.upsert({
  where: { businessId_phone: { businessId, phone } },
  create: { businessId, phone, mode: nextMode },
  update: { mode: nextMode }
});
```
Persists whether next message should trigger AI or go to human agent.

---

## Error Handling Patterns

Chatly uses **graceful degradation** throughout to ensure the customer experience isn't broken by internal errors.

### Pattern 1: Non-Blocking Webhook Errors
```typescript
try {
  // AI processing
} catch (error) {
  console.error(`[chatly:ai] Error generating response for ${businessId}:`, error);
  // Still return 200 to Gowa (webhook acknowledged)
  // Send fallback message: "Maaf, saya mengalami kesalahan. Silakan coba lagi nanti."
}
```
**Why?** If AI fails, we acknowledge the webhook (200) but inform the customer instead of crashing. Prevents Gowa from retrying infinitely.

### Pattern 2: Prefixed Logging
```typescript
console.error(`[chatly:webhook] Signature verification failed`);
console.warn(`[chatly:rag] No chunks found for business ${businessId}`);
console.info(`[chatly:transaction] Invoice created ${invoiceId}`);
```
Logs prefixed with component name for easy debugging across different services.

### Pattern 3: RAG Fallback
```typescript
try {
  const chunks = await retrieveKnowledgeChunks(businessId, embedding);
} catch {
  // Continue without knowledge chunks
  // AI responds using only intent schema, no context
}
```
If vector search fails, AI still generates a response (just without knowledge augmentation).

### Pattern 4: Intent Mapping Validation
```typescript
if (!intentMap[response.intent_category]) {
  console.warn(`[chatly:ai] Unexpected intent key: ${response.intent_category}`);
  result.intent_category = 'unknown';
}
```
If AI outputs an intent that doesn't exist, log and mark as unknown instead of crashing.

### Pattern 5: Atomic Transactions
```typescript
await prisma.$transaction([
  prisma.chatLog.create({ /* AI message */ }),
  prisma.conversationState.update({ /* new mode */ }),
  prisma.analyticsEvent.create({ /* intent */ })
]);
```
All three operations succeed together or all fail together. Prevents partial state.

---

## Intent System & FAQ Analytics

### What Are Intents?

Intents are predefined product/service categories a business wants to track. Examples:
- "Product Purchase"
- "Support Request"
- "Billing Inquiry"
- "Return Request"

### How They Work

1. **Business Configures Intents**
   ```typescript
   // During business onboarding
   const intent = await prisma.businessIntent.create({
     data: {
       businessId,
       name: 'Product Purchase'
     }
   });
   ```

2. **AI Predicts Intent Per Message**
   - Sanitized keys included in Gemini prompt
   - AI outputs JSON with `intent_category` field
   - Keys mapped back to intent IDs

3. **Analytics Recorded**
   ```typescript
   await prisma.analyticsEvent.create({
     data: {
       businessId,
       phone,
       intentCategory: 'Product Purchase',
       mentionedProduct: 'Widget Pro',
       createdAt: new Date()
     }
   });
   ```

4. **Business Views Dashboard**
   - See which intents are mentioned most
   - See which products/services are trending
   - Identify support bottlenecks

### FAQ Handling

FAQs are part of the knowledge base (uploaded documents). When a customer asks a question:

1. **Similar FAQ retrieved via RAG**
   - User question → embedding
   - pgvector finds similar FAQ chunks
   - Top 5 FAQs injected into prompt

2. **AI Synthesizes Answer**
   - Combines FAQ content with business tone
   - Adds intent prediction
   - Decides if transaction is needed

3. **Analytics Track FAQ Usage**
   - If FAQ mention detected, recorded in intent analytics
   - Helps identify which FAQs are actually being accessed
   - Informs knowledge base updates

**Example Flow**:
```
Customer: "How long does shipping take?"
    ↓
[Embedding] → 768d vector of this question
    ↓
[RAG] → Retrieves FAQ: "Shipping takes 2-3 business days nationwide"
    ↓
[AI] → "Pengiriman kami ke seluruh Indonesia membutuhkan 2-3 hari kerja..."
    ↓
[Intent] → intent_category: "Shipping Question", no transaction
    ↓
[Analytics] → recorded that "Shipping Question" was mentioned
```

---

## Database Schema Overview

Key models for the conversation flow:

| Model | Purpose |
|-------|---------|
| `User` | Business owner account |
| `Business` | Business configuration (aiTone, intents) |
| `ChatLog` | All messages (USER and AI) |
| `ConversationState` | Current mode (AI or HUMAN) per phone |
| `DocumentChunk` | RAG knowledge base (pgvector embeddings) |
| `BusinessIntent` | Intent definitions |
| `AnalyticsEvent` | Intent mention analytics |
| `CustomerTransaction` | Payment transactions |
| `WhatsAppAuth` | WhatsApp device authentication |

---

## Summary

Chatly's architecture combines:
- **RAG** for knowledge-aware responses
- **Multi-step AI pipeline** for structured, predictable outputs
- **Atomic transactions** for data consistency
- **Graceful degradation** to keep services running even on errors
- **Intent analytics** to measure customer needs
- **Automatic transactions** to monetize conversations

Every message follows the same path: WhatsApp → webhook → deduplication → AI engine → intent analytics → transaction generation → response send. This ensures consistent, observable behavior at scale.
