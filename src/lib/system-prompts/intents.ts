/**
 * Intent Analytics Prompt
 *
 * Instructs the AI to evaluate each business-defined intent question
 * against the customer's LATEST message only, returning true/false.
 * Uses sanitized keys (intent_0, intent_1, ...) that are safe for JSON schema.
 */

export function buildIntentPrompt(
  intentNames: string[],
  intentKeyMap: Record<string, string>
): string {
  if (intentNames.length === 0) {
    return `ANALITIK NIAT:
Tidak ada niat yang dilacak untuk bisnis ini. Set "intent_analytics" ke object kosong {}.`;
  }

  const intentList = intentNames
    .map((name) => `  - key "${intentKeyMap[name]}": "${name}"`)
    .join("\n");

  return `ANALITIK NIAT:
Evaluasi pesan TERAKHIR dari pelanggan terhadap setiap niat berikut. PENTING: Deteksi NIAT IMPLISIT, bukan hanya pernyataan eksplisit.

Daftar niat yang dilacak:
${intentList}

PANDUAN DETEKSI NIAT (termasuk implicit intent):
1. EXPLICIT INTENT: Pelanggan secara langsung menyebutkan niat
   Contoh: "Saya mau beli produk X", "Saya tertarik dengan paket premium"

2. IMPLICIT INTENT: Perilaku menunjukkan minat tanpa pernyataan langsung
   - Bertanya tentang produk/layanan ("Apa itu produk X?", "Bagaimana cara kerja layanan ini?")
   - Tanya harga/biaya ("Berapa harganya?", "Apa paket yang paling murah?")
   - Tanya fitur/spesifikasi ("Apa saja yang termasuk dalam paket ini?")
   - Tanya ketersediaan ("Apakah tersedia untuk wilayah saya?")
   - Membandingkan opsi ("Mana yang lebih baik, paket A atau B?")
   - Tanya syarat/ketentuan ("Apa persyaratan untuk berlangganan?")
   - Tanya durasi/waktu ("Berapa lama pengiriman?", "Berapa lama garansinya?")
   - Tanya proses ("Bagaimana cara order?", "Apa yang perlu saya lakukan?")
   - Tanya informasi lanjutan setelah penjelasan ("Bisa cicilan?", "Apa ada diskon?")

CONTOH DETEKSI:
- "Apa itu produk X?" → TRUE untuk intent "minat produk X"
- "Berapa biaya paket premium?" → TRUE untuk intent "minat paket premium"
- "Bisa gak dikirim ke Surabaya?" → TRUE untuk intent "minat pengiriman/availability"
- "Saya hanya browsing" → FALSE untuk semua intent (kecuali user tetap bertanya detail)

Di field "intent_analytics", kembalikan object dengan KEY di atas dan value boolean.
Set ke TRUE jika ada bukti minat/ketertarikan (implicit atau explicit).
Set ke FALSE jika tidak ada indikasi minat sama sekali.

Contoh: { "intent_0": true, "intent_1": false, "intent_2": true }`;
}
