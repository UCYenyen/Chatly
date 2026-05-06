/**
 * Training Prompt
 *
 * Wraps the business owner's custom training / knowledge base text
 * into a prompt section.
 */

export function buildTrainingPrompt(knowledgeBase: string | null): string {
  if (!knowledgeBase || knowledgeBase.trim().length === 0) {
    return `PELATIHAN / KNOWLEDGE BASE:
(Tidak ada data pelatihan yang diberikan oleh pemilik bisnis. Jawab sesuai kemampuanmu dan tawarkan eskalasi ke admin jika diperlukan.)`;
  }

  return `PELATIHAN / KNOWLEDGE BASE:
Berikut adalah informasi yang diberikan pemilik bisnis. Gunakan ini sebagai sumber utama untuk menjawab pertanyaan pelanggan:

${knowledgeBase.trim()}`;
}
