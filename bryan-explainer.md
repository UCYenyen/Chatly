# Bryan Explainer - Dokumentasi Teknis Chatly

Dokumen ini menjelaskan seluruh sisi teknis proyek Chatly: arsitektur, alur kerja, alasan keputusan desain, serta potensi bug dan kekurangan yang perlu diwaspadai. Ditulis untuk pembaca yang ingin memahami sistem secara menyeluruh tanpa harus membaca seluruh kode.

---

## 1. Apa Itu Chatly

Chatly adalah platform SaaS multi-tenant yang menyediakan chatbot WhatsApp bertenaga AI untuk bisnis. Setiap akun pengguna (pemilik bisnis) dapat memiliki banyak bisnis. Setiap bisnis bisa menghubungkan nomor WhatsApp, mengunggah dokumen pengetahuan (knowledge base), lalu chatbot akan otomatis membalas pesan pelanggan, mendeteksi niat beli, membuat invoice pembayaran, dan menyerahkan percakapan ke admin manusia bila diperlukan.

Model bisnisnya: **langganan per-bisnis** (bukan per-akun). Pengguna boleh membuat bisnis sebanyak yang diinginkan, tetapi chatbot tiap bisnis hanya aktif jika bisnis tersebut punya langganan berbayar yang aktif.

---

## 2. Tech Stack

- **Framework**: Next.js 16.2.3 (App Router) dengan React 19.2.4
- **React Compiler aktif** (`reactCompiler: true` di `next.config.ts`) sehingga optimasi manual seperti `useMemo`/`useCallback` tidak diperlukan
- **Bahasa**: TypeScript mode `strict`
- **Database**: PostgreSQL dengan ekstensi `pgvector` untuk pencarian semantik
- **ORM**: Prisma 7 (`@prisma/adapter-pg` + `@prisma/extension-accelerate`)
- **Autentikasi**: better-auth
- **AI**: Google Gemini (utama) dengan fallback Groq; Gemini Embedding 001 untuk vektor (768 dimensi)
- **WhatsApp**: Gowa API (multi-device, verifikasi webhook via HMAC)
- **Pembayaran**: Xendit (utama, dipakai aktif) dan Midtrans (tersedia sebagai klien)
- **UI**: shadcn/ui + Radix UI + Tailwind v4, ikon dari lucide-react
- **Form**: react-hook-form + zod v4
- **Package manager**: pnpm (wajib, bukan npm/yarn)

Tidak ada test runner yang dikonfigurasi. Verifikasi dilakukan lewat `pnpm lint` dan `pnpm build` (yang menjalankan `prisma generate && next build`, termasuk pengecekan tipe).

---

## 3. Struktur Aplikasi

### Routing (App Router di `src/app/`)

- **Route group `(auth)`**: `sign-in`, `sign-up`, `forgot-password`, `unauthorized`
- **Route group `(dashboard)`**: dashboard utama, billing, serta halaman per-bisnis di `business/[businessId]/` (ringkasan, analytics, training, transaksi, langganan, api-docs, api-management)
- **API routes** di `src/app/api/`:
  - `auth/[...all]` - better-auth handler
  - `businesses/` dan `businesses/[id]/...` - data bisnis multi-tenant (subscription, intents, knowledge-files, whatsapp, transactions, analytics)
  - `whatsapp/webhook` - penerima pesan dari Gowa
  - `webhooks/xendit` - callback pembayaran
  - `billing/` - topup, verify, wallet
  - `health` - liveness check

### Middleware non-standar (`src/proxy.ts`)

Proyek ini TIDAK memakai `middleware.ts` bawaan Next.js. Sebagai gantinya, file `src/proxy.ts` mengekspor fungsi `proxy` dan `config`. Tugasnya:

- Membaca cookie sesi `better-auth.session_token` atau `__Secure-better-auth.session_token`
- Redirect pengguna belum login dari rute terlindungi (`/dashboard`, `/admin`, `/profile`, dll) ke `/sign-in`
- Redirect pengguna yang sudah login menjauh dari halaman auth
- Untuk `/admin/*`, melakukan `fetch` ke `/api/auth/get-session` lalu gating berdasarkan `user.role` (`ADMIN`, dengan `ADMIN_QR` diizinkan khusus `/admin/presension`)

**Alasan pendekatan ini**: middleware Next.js berjalan sebelum cache dan cocok untuk gating berbasis cookie yang murah. Pengecekan role yang butuh sesi penuh didelegasikan via fetch ke API route agar logika auth tetap terpusat di better-auth.

**Catatan**: string role di `proxy.ts` harus selalu sinkron dengan enum `UserRole` di `schema.prisma`. Saat ini ada ketidaksesuaian kecil: `proxy.ts` mengecek role `ADMIN_QR`, tetapi enum Prisma hanya punya `GUEST | BUSINESS_OWNER | ADMIN`. Lihat bagian Potensi Bug.

---

## 4. Model Data (Prisma)

Tabel dipetakan ke nama lowercase via `@@map`. Model mengikuti bentuk better-auth (`User`, `Session`, `Account`, `Verification`).

### Model inti

- **User**: pemilik akun. Punya `role`, `balance` (saldo dompet dalam Integer Rupiah), `onboardingCompleted`, relasi ke banyak `Business` dan `Payment`.
- **Business**: tenant. Milik satu `User`. Menyimpan konfigurasi AI (`aiTone`, `knowledgeBase`, `knowledgeFiles`), jam operasional (`businessHours`, `timezone`, `handoverHoursEnabled`), nomor notifikasi, dan flag `ignoreAllContacts`. Relasi ke `Subscription?` (opsional, satu-satu), `WhatsAppAuth[]`, `ChatLog[]`, dll.
- **Subscription**: langganan **per-bisnis** (`businessId` unik, relasi satu-satu). Menyimpan `plan` (enum `SubscriptionPlan`), `status` (enum `SubscriptionStatus`), `currentPeriodStart/End`, `cancelAtPeriodEnd`, `canceledAt`.
- **Payment**: catatan pembayaran (topup atau subscription) milik `User`, opsional terkait `Business` dan `Subscription`. Punya `type` (`TOPUP`/`SUBSCRIPTION`), `status`, dan ID Xendit.
- **CustomerTransaction**: transaksi pembelian dari pelanggan akhir suatu bisnis (hasil deteksi niat beli oleh AI). Punya `customerPhone`, `amount`, `status`, ID Xendit.
- **ChatLog**: semua pesan (role `USER` atau `AI`). `messageId` unik dipakai untuk deduplikasi. Index gabungan `[businessId, phone, createdAt]`.
- **ConversationState**: mode percakapan per (bisnis, telepon): `AI` atau `HUMAN`. Unik `[businessId, phone]`.
- **AnalyticsEvent**: catatan deteksi niat (intent) pelanggan untuk pelacakan konversi.
- **DocumentChunk**: potongan dokumen pengetahuan dengan kolom `embedding` bertipe `Unsupported("vector")` (pgvector).
- **WhatsAppAuth**: kredensial koneksi WhatsApp per bisnis (`instanceKey`, `phoneNumber`, `status`, `qrCode`). Unik `[businessId, authType]`.
- **BusinessIntent**, **IgnoredContact**, **Handover** (mendukung fitur masing-masing).

### Enum

- `SubscriptionPlan`: `FREE | STARTER | GROWTH | PRO | ENTERPRISE`
- `SubscriptionStatus`: `PENDING | ACTIVE | PAST_DUE | CANCELED | EXPIRED`
- `PaymentStatus`: `PENDING | PAID | FAILED | EXPIRED`
- `PaymentType`: `TOPUP | SUBSCRIPTION`
- `UserRole`: `GUEST | BUSINESS_OWNER | ADMIN`
- `WhatsAppAuthType`: `OFFICIAL | GOWA`
- `ConversationMode`: `AI | HUMAN`

### Cascade delete

Menghapus `Business` akan menghapus seluruh `ChatLog`, `ConversationState`, `AnalyticsEvent`, `DocumentChunk`, `WhatsAppAuth`, `Subscription`, dll miliknya (mencegah data yatim). **Alasan**: integritas data tenant; saat bisnis dihapus, tidak boleh ada sisa data yang menggantung.

---

## 5. Model Langganan Per-Bisnis (Fitur Utama Terbaru)

### Konsep

Langganan melekat pada **bisnis**, bukan akun. Paket Starter, Growth, dan Pro TIDAK menambah jumlah bisnis yang boleh dibuat. Pengguna boleh membuat bisnis tanpa batas. Chatbot tiap bisnis baru aktif jika bisnis itu memiliki langganan berbayar (`STARTER`/`GROWTH`/`PRO`/`ENTERPRISE`) dengan status `ACTIVE`.

### Bagaimana gating bekerja

Inti gating ada di dua helper di `src/lib/utils/payment-gateway/`:

- `getBusinessPlan(businessId)` di `plan-guard.ts`: membaca subscription bisnis, lalu memanggil `resolveActivePlan(plan, status)`. Fungsi `resolveActivePlan` mengembalikan `FREE` bila tidak ada langganan ATAU status bukan `ACTIVE`; selain itu mengembalikan plan sebenarnya.
- `isPaidPlan(plan)` di `plans.ts`: bernilai `true` untuk semua plan kecuali `FREE`.

Webhook WhatsApp (`src/app/api/whatsapp/webhook/route.ts`) menempatkan gerbang ini tepat setelah pesan teks terkonfirmasi dan SEBELUM penyimpanan apa pun ke database:

```ts
const activePlan = await getBusinessPlan(whatsappAuth.businessId);
if (!isPaidPlan(activePlan)) {
  return NextResponse.json({ ok: true });
}
```

Bila bisnis tidak punya plan berbayar aktif, webhook langsung mengembalikan `200 OK` (agar Gowa tidak mengulang kirim), **tanpa menyimpan ChatLog dan tanpa memanggil AI engine**. Bisnis diam total.

### Penempatan gerbang (penting)

Gerbang berada:
- SETELAH penanganan event koneksi/diskoneksi (event itu return lebih awal, jadi status koneksi WhatsApp tetap terupdate walau bisnis belum berlangganan)
- SETELAH validasi `from` dan `text` kosong
- SEBELUM lookup ignore-list dan SEBELUM `prisma.chatLog.create`
- SEBELUM `runChatlyAIEngine`

Hanya ada satu pemanggil `runChatlyAIEngine` di seluruh kode (yaitu webhook ini), sehingga tidak ada jalur lain yang bisa menjalankan AI untuk pesan masuk tanpa melewati gerbang.

### Membuat bisnis tanpa batas

`POST /api/businesses` tidak lagi membatasi jumlah bisnis. Sebelumnya rute ini memanggil `getUserPlan` (plan tertinggi di seluruh akun) lalu `enforceNumericLimit(plan, "businesses", ...)`. Itu menimbulkan paradoks: untuk membuat bisnis kedua dibutuhkan paket multi-bisnis, padahal paket dibeli per-bisnis. Pembatasan tersebut dihapus seluruhnya.

### Dimensi "businesses" dihapus dari sistem plan-limit

Karena jumlah bisnis bukan lagi pembeda paket, key `businesses` dihapus dari `NumericLimitKey`, interface `PlanLimits`, seluruh entri `PLAN_LIMITS`, `NUMERIC_FEATURE_LABELS`, dan `NUMERIC_FEATURE_ORDER`. Kartu paket berhenti menampilkan "1 bisnis / 3 bisnis" yang kontradiktif.

### Alasan keputusan desain

- **Mengapa gating di webhook, bukan di AI engine?** Karena requirement-nya "diam total dan tidak mencatat apa pun". Jika gating ditaruh di dalam AI engine, ChatLog pesan pelanggan sudah terlanjur tersimpan sebelum cek. Webhook adalah satu-satunya choke point sebelum penyimpanan.
- **Mengapa pakai `getBusinessPlan` + `isPaidPlan` yang sudah ada?** Menghindari duplikasi logika. `resolveActivePlan` sudah menangani kasus tanpa langganan dan status non-aktif, jadi langganan kedaluwarsa/dibatalkan otomatis membungkam chatbot tanpa cabang tambahan.
- **Mengapa hanya hapus pembatasan, bukan set ke unlimited?** Lebih bersih. Menghapus dimensi `businesses` sekaligus menghilangkan tampilan yang menyesatkan di kartu paket.

---

## 6. Alur Pembayaran dan Dompet

Semua logika di `src/lib/utils/payment-gateway/billing-service.ts`. Mata uang IDR, nominal disimpan sebagai Integer (tanpa desimal).

### Tiga jenis arus uang

1. **Top-up saldo** (`createTopUpInvoice`): pengguna mengisi saldo dompet. Membuat invoice Xendit, mencatat `Payment` bertipe `TOPUP` status `PENDING`. Minimal Rp 10.000.
2. **Langganan** (`createSubscriptionInvoice` atau `paySubscriptionWithWallet`): mengaktifkan paket untuk sebuah bisnis. Bisa via invoice Xendit ATAU langsung memotong saldo dompet.
3. **Transaksi pelanggan** (`createCustomerTransactionInvoice`): invoice untuk pembeli akhir, dipicu oleh AI saat mendeteksi niat beli. Minimal Rp 1.000.

### Bayar langganan via dompet (`paySubscriptionWithWallet`)

Memakai transaksi interaktif Prisma agar pengecekan saldo dan pemotongan bersifat atomik. Bila saldo cukup: saldo dikurangi, `Payment` status `PAID` dibuat, lalu `Subscription` di-upsert menjadi `ACTIVE` dengan `currentPeriodStart = now` dan `currentPeriodEnd = now + intervalDays`. **Alasan transaksi atomik**: mencegah race condition di mana dua pembayaran konkuren sama-sama lolos cek saldo sebelum salah satunya memotong.

### Callback Xendit (`handleXenditCallback`)

Dipanggil oleh webhook Xendit saat status invoice berubah. Idempoten: setiap cabang mengecek ulang status di dalam `$transaction` dan berhenti jika sudah `PAID`. Untuk:
- **TOPUP** yang lunas: menambah `balance` pengguna.
- **SUBSCRIPTION** yang lunas: mengaktifkan subscription bisnis dengan periode baru.
- **CustomerTransaction** yang lunas: menambah saldo pemilik bisnis, lalu mengirim konfirmasi WhatsApp ke pelanggan dan mencatatnya sebagai ChatLog `AI`.

Ada juga `verifyPaymentByExternalId` (verifikasi manual saat user kembali dari halaman bayar) dan `syncPendingCustomerTransactions` (sinkronisasi saat dashboard transaksi dibuka) yang keduanya memanggil ulang `handleXenditCallback` agar status konsisten meski webhook Xendit terlewat.

**Alasan ada verify/sync manual**: webhook eksternal bisa gagal atau tertunda. Mekanisme pull manual ini membuat status tetap akurat tanpa bergantung 100% pada push dari Xendit.

---

## 7. Pipeline Webhook WhatsApp

File: `src/app/api/whatsapp/webhook/route.ts`. Urutan pemrosesan pesan masuk:

1. **Verifikasi HMAC-SHA256**: signature dari Gowa diverifikasi dengan `timingSafeEqual` (anti timing attack). Signature salah ditolak `401`.
2. **Resolusi `whatsappAuth`**: menentukan `businessId` dari `device_id`/nomor. Ada mekanisme auto-link bila device_id belum dikenal namun ada auth tanpa nomor.
3. **Event koneksi/diskoneksi**: memperbarui status `WhatsAppAuth`, lalu return. (Tidak terkena gating langganan.)
4. **Validasi pesan**: drop jika `from` atau `text` kosong.
5. **Gerbang langganan** (fitur baru): drop diam-diam bila bisnis tak punya plan berbayar aktif.
6. **Ignore-list**: bila `ignoreAllContacts` aktif atau kontak ada di daftar abaikan, pesan di-drop tanpa jejak.
7. **Deduplikasi atomik**: `ChatLog` disimpan dengan `messageId` unik. Bila terjadi pelanggaran unique constraint (`P2002`), itu duplikat dari retry Gowa dan diabaikan secara idempoten. **Alasan**: mengandalkan unique constraint, bukan cek-lalu-tulis, sehingga aman dari race condition webhook konkuren.
8. **Deteksi mode** (`AI` vs `HUMAN`) dari `ConversationState`, dan status jam operasional bisnis.
9. **Handover timeout/reminder**: bila ada handover aktif yang melewati ambang waktu, dikembalikan ke mode AI atau dikirim pengingat ke admin.
10. **Jalankan AI engine** (lihat bagian 8), lalu proses hasilnya: simpan analitik intent, buat invoice transaksi bila ada, perbarui mode percakapan, kirim balasan via Gowa bila `should_respond` true.

---

## 8. AI Engine (Pipeline 10 Langkah)

File: `src/lib/ai-engine.ts`, fungsi `runChatlyAIEngine`. Mengembalikan objek `ChatlyAIResult` terstruktur.

1. **Ambil data bisnis + intents** (paralel via `Promise.all`). Bila gagal, kembalikan pesan maaf yang aman.
2. **Pemetaan kunci intent**: nama intent asli dipetakan ke kunci aman `intent_0`, `intent_1`, dst. **Alasan**: mencegah AI menghasilkan kunci JSON yang tidak valid atau halusinasi nama intent.
3. **RAG retrieval**: ambil top-5 potongan dokumen paling relevan via pencarian kosinus pgvector. Bila gagal, lanjut tanpa augmentasi pengetahuan (fail-open).
4. **Susun system prompt** dari modul di `src/lib/system-prompts/` (`composer.ts`, `intents.ts`, `personalities.ts`, dll). Bila bisnis sedang tutup, sisipkan instruksi handover off-hours.
5. **Ambil riwayat percakapan** (6 pesan terakhir), mengecualikan pesan USER yang baru saja disimpan agar tidak dobel di prompt.
6. **Bangun JSON schema dinamis** untuk output AI: `response`, `intent_analytics` (per intent boolean), `generate_transaction` (nullable), `escalate_to_human`, `end_conversation`, `should_respond`, `next_mode`. Schema memaksa output terstruktur.
7. **Inferensi** via `generateChatCompletion` (Gemini 2.5 Flash Lite utama, fallback Groq).
8. **Parse JSON** hasil model.
9. **Petakan kembali** kunci intent aman ke nama intent asli; kunci `_empty` diabaikan.
10. **Susun hasil akhir** dengan default aman (mis. `should_respond` default true, `next_mode` default `AI`).

Detail penting:
- **Deteksi intent implisit**: prompt memandu AI mengenali niat dari perilaku (bertanya harga = minat beli), bukan hanya pernyataan eksplisit.
- **`generate_transaction`**: bila pelanggan ingin membeli, AI mengisi nama/deskripsi/jumlah; webhook lalu membuat invoice Xendit dan menempelkan link ke balasan.
- **`escalate_to_human`** vs **`generate_transaction`**: prompt secara eksplisit mencegah AI meng-escalate untuk pembelian (harus pakai transaksi) atau pertanyaan biasa.
- **`stripUrls`**: URL di riwayat diganti `[link pembayaran]` agar model tidak mengulang link lama.

**Alasan output ber-schema**: menjamin keandalan parsing dan menggabungkan banyak keputusan (balasan, analitik, transaksi, escalation, mode) dalam satu panggilan model yang hemat.

---

## 9. Sistem RAG

- **Ingestion** (`src/lib/rag-ingestion.ts`): unggah dokumen -> ekstraksi teks (Gemini 2.5 Pro) -> chunking pada `\n\n` -> embedding 768 dimensi (Gemini Embedding 001). Pembaruan chunk bersifat atomik DELETE-then-INSERT.
- **Retrieval** (`src/lib/rag-retrieval.ts`): meng-embed query, lalu `$queryRaw` menghitung jarak kosinus (`embedding <=> vector`) terhadap `document_chunk` yang difilter `businessId`, ambil top-K. Query menggunakan tagged template Prisma sehingga nilai diparameterkan (aman dari SQL injection).

**Alasan pgvector**: pencarian semantik langsung di PostgreSQL menghindari kebutuhan vector database terpisah, menyederhanakan infrastruktur.

---

## 10. Penyedia AI dan Fallback

File: `src/lib/ai-providers/index.ts`. Penyedia utama ditentukan `AI_PROVIDER` (default Gemini), dengan fallback otomatis ke penyedia lain (Groq) bila yang utama gagal. Hanya penyedia yang terkonfigurasi yang dicoba. Bila semua gagal, error dilempar dan AI engine mengembalikan pesan maaf.

**Alasan fallback**: ketahanan terhadap downtime/rate-limit satu provider tanpa menghentikan layanan.

---

## 11. Handover AI ke Manusia

Saat AI menyetel `escalate_to_human` dan `next_mode = "HUMAN"`, sistem membuat record `Handover`, memberi tahu admin (via `notifyHandoverEscalation` ke nomor notifikasi), dan mengirim ack ke pelanggan. Mode percakapan disimpan di `ConversationState`. Dalam mode HUMAN, bot umumnya diam (`should_respond = false`) hingga pelanggan jelas memulai topik baru. Ada timeout dan reminder agar percakapan tidak menggantung di mode HUMAN selamanya, dan bila bisnis tutup, escalation diblokir (dipaksa kembali ke AI).

---

## 12. Analitik dan Conversion Rate

Endpoint `businesses/[id]/analytics/conversion-rate/` melacak: jumlah unik pelanggan yang chat vs yang membeli, jumlah transaksi, dan pendapatan. Komponen `ConversionRateCard.tsx` menampilkan metrik yang bisa diklik menuju dialog detail. Data berasal dari `ChatLog`, `AnalyticsEvent`, dan `CustomerTransaction`. Tujuannya mengukur efektivitas chatbot (ROI).

---

## 13. Konvensi Kode (Wajib)

Diatur ketat di `CLAUDE.md`:

- **Semua tipe/interface di `src/types/`** dengan sufiks `.md.ts`. Dilarang mendefinisikan tipe inline di komponen.
- **Dilarang tipe `any`** - gunakan `unknown` lalu persempit via type guard. Mode `strict: true`.
- **Semua custom hook di `src/hooks/`**, diekspor lewat `index.ts`.
- **Semua UI memakai shadcn/ui** - dilarang styling div/button mentah. Warna semantik dari design system (`text-on-surface`, `bg-surface-container-low`, dll), bukan nilai Tailwind mentah seperti `bg-blue-500`.
- **Komponen berbasis fitur**: `src/components/ui/` (primitif shadcn), `src/components/features/<fitur>/`, `src/components/personal/`, `src/components/providers/`.
- **Tanpa komentar** - kode harus self-documenting lewat penamaan yang jelas. (`console.log` adalah logging, bukan komentar, sehingga diizinkan.)

**Alasan**: konsistensi, kemudahan pemeliharaan, dan keamanan tipe pada tim yang berkembang.

---

## 14. Potensi Bug dan Kekurangan

Bagian ini sengaja jujur dan kritis. Hal-hal berikut perlu diwaspadai atau diperbaiki.

### 14.1 Subscription tidak pernah otomatis kedaluwarsa (paling penting)

`resolveActivePlan` hanya mengecek `status === "ACTIVE"`, TIDAK mengecek `currentPeriodEnd`. Tidak ada cron job atau scheduler di kode aplikasi yang mengubah status dari `ACTIVE` menjadi `EXPIRED` ketika periode habis. Akibatnya, sekali subscription menjadi `ACTIVE`, ia tetap `ACTIVE` selamanya sampai ada proses lain yang mengubahnya. **Dampak langsung ke fitur gating**: chatbot sebuah bisnis akan tetap jalan walau periode langganan sudah lewat. Dependency `node-cron` ada di `package.json`, tetapi tidak ditemukan penjadwalan untuk expiry langganan.

Perbaikan yang disarankan: tambahkan cron yang menyetel `status = EXPIRED` saat `currentPeriodEnd < now`, ATAU ubah `resolveActivePlan` agar juga memeriksa `currentPeriodEnd`.

### 14.2 Pembatalan langganan tidak menurunkan akses

`cancelSubscription` hanya menyetel `cancelAtPeriodEnd = true` dan `canceledAt`, tetapi tidak ada mekanisme yang benar-benar menurunkan status di akhir periode (terkait erat dengan 14.1). Subscription yang "dibatalkan" tetap berstatus `ACTIVE`, sehingga chatbot tetap aktif tanpa batas.

### 14.3 `isPaidPlan` hanya mengecek tier, bukan status aktif

`isPaidPlan(plan)` hanya membandingkan `plan !== "FREE"`. Pengecekan status `ACTIVE` terjadi terpisah di dalam `getBusinessPlan` -> `resolveActivePlan`. Selama gerbang webhook selalu lewat `getBusinessPlan`, ini aman. Namun bila di masa depan ada pemanggil yang mengoper nilai plan mentah dari database langsung ke `isPaidPlan`, gerbang bisa terlewati. Pertimbangkan menamai ulang menjadi `isPaidTier` atau menyatukan cek status ke dalam satu fungsi.

### 14.4 Penggunaan `any` di billing-service melanggar konvensi

Di `handleXenditCallback`, ada `status: payload.status as any` (dua tempat). Ini melanggar aturan "dilarang `any`" dan melewati keamanan tipe. Sebaiknya dipetakan eksplisit ke nilai enum `PaymentStatus` yang valid.

### 14.5 Dead code: `getUserPlan`

Setelah pembatasan jumlah bisnis dihapus, `getUserPlan` di `plan-guard.ts` tidak lagi dipanggil di mana pun. Sebaiknya dihapus agar tidak membingungkan, kecuali ada rencana memakainya kembali.

### 14.6 Query tambahan pada gerbang webhook

Gerbang langganan memanggil `getBusinessPlan` (satu SELECT ke tabel `subscription`), lalu beberapa baris kemudian ada `Promise.all` yang menjalankan dua query lain (`business.findUnique` + `ignoredContact.findUnique`). Query subscription bisa digabung ke dalam `Promise.all` itu untuk menghemat satu round-trip. Ini soal performa, bukan kebenaran, dan mungkin tidak signifikan pada skala saat ini.

### 14.7 Ketidaksesuaian role `ADMIN_QR`

`src/proxy.ts` mengecek `session.user.role === "ADMIN_QR"`, tetapi enum `UserRole` di `schema.prisma` hanya berisi `GUEST | BUSINESS_OWNER | ADMIN`. Tidak ada pengguna yang bisa memiliki role `ADMIN_QR`, sehingga cabang gating `/admin/presension` untuk role tersebut praktis tidak pernah aktif. Perlu disinkronkan: tambahkan `ADMIN_QR` ke enum, atau hapus pengecekannya.

### 14.8 Plan ENTERPRISE dianggap berbayar meski amount 0

`PLANS.ENTERPRISE.amount = 0` (harga custom), tetapi `isPaidPlan("ENTERPRISE")` bernilai true. Ini sesuai desain (Enterprise adalah paket berbayar dengan kontrak custom), namun perlu disadari bahwa bisnis berstatus ENTERPRISE ACTIVE menjalankan chatbot tanpa pernah benar-benar membayar lewat sistem. Aktivasi Enterprise harus dikontrol manual/administratif.

### 14.9 Bisnis FREE lama akan berhenti membalas

Konsekuensi sengaja dari fitur gating: bisnis yang sebelumnya berstatus FREE dan chatbotnya berjalan akan langsung berhenti membalas setelah perubahan ini, hingga memilih paket berbayar. Ini diinginkan secara produk, tetapi berpotensi mengejutkan pengguna existing bila tidak ada komunikasi/migrasi. Belum ada indikator di dashboard yang memberi tahu "chatbot nonaktif, pilih paket" (sengaja ditunda sebagai follow-up).

### 14.10 Tidak ada test otomatis

Tidak ada test runner. Seluruh verifikasi bergantung pada `pnpm lint`, `pnpm build`, dan pengujian manual. Logika kritis seperti gating langganan, idempotensi pembayaran, dan deduplikasi webhook tidak terlindungi regresi otomatis.

### 14.11 Pembuatan bisnis tanpa batas berpotensi disalahgunakan

Karena pembatasan jumlah bisnis dihapus total, satu akun bisa membuat bisnis tak terbatas. Tanpa rate limiting, ini bisa dipakai untuk membanjiri database. Mengingat chatbot tetap memerlukan langganan berbayar untuk berfungsi, insentif penyalahgunaan rendah, tetapi pembuatan record itu sendiri tidak dibatasi.

---

## 15. Ringkasan Alur End-to-End

1. Pengguna mendaftar (better-auth), membuat satu atau lebih bisnis (tanpa batas).
2. Untuk tiap bisnis, pengguna memilih paket berbayar dan membayar via dompet atau invoice Xendit. Subscription menjadi `ACTIVE`.
3. Pengguna menghubungkan WhatsApp (Gowa) dan mengunggah dokumen pengetahuan (di-embed ke pgvector).
4. Pelanggan mengirim pesan WhatsApp -> Gowa meneruskan ke webhook Chatly.
5. Webhook memverifikasi HMAC, mengecek gerbang langganan (drop diam bila tak berbayar), deduplikasi, lalu menjalankan AI engine.
6. AI engine melakukan RAG, menyusun prompt, memanggil Gemini, dan mengembalikan balasan terstruktur + analitik intent + flag transaksi/escalation.
7. Webhook menyimpan analitik, membuat invoice bila ada niat beli, memperbarui mode percakapan, dan mengirim balasan ke pelanggan.
8. Bila pelanggan membayar invoice, callback Xendit menambah saldo pemilik bisnis dan mengirim konfirmasi WhatsApp.
9. Pemilik bisnis memantau konversi dan analitik di dashboard.
