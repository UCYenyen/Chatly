/**
 * Training Prompt
 *
 * Wraps the business owner's custom training / knowledge base text
 * into a prompt section.
 */

export function buildTrainingPrompt(
  knowledgeBase: string | null,
  retrievedChunks: string[] = [],
): string {
  const manual = knowledgeBase?.trim() ?? "";
  const chunks = retrievedChunks.map((c) => c.trim()).filter((c) => c.length > 0);

  if (!manual && chunks.length === 0) {
    return `PELATIHAN / KNOWLEDGE BASE:
(Tidak ada data pelatihan yang diberikan oleh pemilik bisnis. Jawab sesuai kemampuanmu dan tawarkan eskalasi ke admin jika diperlukan.)`;
  }

  const parts: string[] = ["PELATIHAN / KNOWLEDGE BASE:"];
  parts.push(
    "Gunakan informasi berikut sebagai sumber UTAMA untuk menjawab pertanyaan pelanggan. Jika jawaban tidak ada di sini, katakan dengan jujur bahwa kamu tidak tahu — jangan mengarang.",
  );

  if (manual) {
    parts.push(`\n[Konteks dari pemilik bisnis]\n${manual}`);
  }

  if (chunks.length > 0) {
    const numbered = chunks.map((c, i) => `(${i + 1}) ${c}`).join("\n\n");
    parts.push(`\n[Kutipan relevan dari dokumen yang diunggah]\n${numbered}`);
  }

  return parts.join("\n");
}
