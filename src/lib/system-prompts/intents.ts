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
Evaluasi HANYA pesan TERAKHIR dari pelanggan terhadap setiap niat berikut. Untuk setiap niat, tentukan apakah pesan terakhir pelanggan mengindikasikan niat tersebut (true) atau tidak (false).

Daftar niat yang dilacak (gunakan key yang tertera di field "intent_analytics"):
${intentList}

Di field "intent_analytics" pada respons JSON, kembalikan object dengan KEY di atas dan value berupa boolean (true/false).
Contoh jika ada 2 niat: { "intent_0": true, "intent_1": false }`;
}
