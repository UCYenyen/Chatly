import type { FeatureGuideStep, Tutorial } from "@/types/feature-tutorial.md";

export const TUTORIALS: Tutorial[] = [
  {
    id: "whatsappSetup",
    name: "Integrasi WhatsApp",
    description: "Hubungkan nomor WhatsApp bisnismu ke Chatly lewat scan QR.",
    route: "/business/:businessId/ringkasan",
    selector: '[data-tour="whatsapp-setup"]',
    guideTitle: "Integrasi WhatsApp",
    guideBody:
      "Sambungkan nomor WhatsApp bisnis di sini: scan QR untuk mengaktifkan, dan tambah channel bila paketmu mendukung lebih dari satu nomor.",
  },
  {
    id: "ignoredContacts",
    name: "Kontak yang Diabaikan",
    description: "Kecualikan kontak tertentu agar tidak dibalas otomatis oleh AI.",
    route: "/business/:businessId/ringkasan",
    selector: '[data-tour="ignored-contacts"]',
    guideTitle: "Kontak yang Diabaikan",
    guideBody:
      "Pilih kontak yang ingin dikecualikan dari balasan AI di sini — berguna untuk supplier atau kontak pribadi.",
  },
  {
    id: "knowledgeBase",
    name: "Dokumen Pelatihan",
    description: "Unggah dokumen & isi basis pengetahuan agar AI paham bisnismu.",
    route: "/business/:businessId/training",
    selector: '[data-tour="knowledge-base"]',
    guideTitle: "Dokumen Pelatihan",
    guideBody:
      "Unggah dokumen (PDF/gambar) dan tulis basis pengetahuan di sini. AI memakai ini sebagai sumber jawaban ke pelanggan.",
  },
  {
    id: "customPersonality",
    feature: "customPersonality",
    name: "Kepribadian AI Kustom",
    description:
      "Atur nada bicara dan gaya balasan AI agar sesuai dengan brand bisnismu.",
    route: "/business/:businessId/training",
    selector: '[data-tour="ai-personality"]',
    guideTitle: "Kepribadian AI Kustom",
    guideBody:
      "Pilih nada bicara di sini untuk mengubah gaya balasan AI ke pelanggan. Simpan untuk menerapkannya.",
  },
  {
    id: "businessHours",
    name: "Jam Operasional & Notifikasi Handover",
    description:
      "Batasi handover ke jam buka dan atur nomor WhatsApp penerima notifikasi.",
    route: "/business/:businessId/training",
    selector: '[data-tour="business-hours"]',
    guideTitle: "Jam Operasional & Handover",
    guideBody:
      "Atur jam buka per hari dan nomor notifikasi handover di sini. Handover ke manusia bisa dibatasi hanya saat jam buka.",
  },
  {
    id: "adminNotification",
    feature: "adminNotification",
    name: "Admin Notifikasi",
    description:
      "Tambahkan admin yang menerima notifikasi web saat percakapan dialihkan ke manusia.",
    route: "/business/:businessId/training",
    selector: '[data-tour="notification-admins"]',
    guideTitle: "Admin Notifikasi",
    guideBody:
      "Tambah admin di sini, bagikan link undangannya, dan mereka akan menerima notifikasi saat ada handover.",
  },
  {
    id: "advancedAnalytics",
    feature: "advancedAnalytics",
    name: "Analitik Lanjutan",
    description:
      "Buka Funnel performa, Conversion Rate, dan Intent Dashboard untuk mengukur efektivitas chatbot.",
    route: "/business/:businessId/analytics",
    selector: '[data-tour="advanced-analytics"]',
    guideTitle: "Analitik Lanjutan",
    guideBody:
      "Pantau funnel, tingkat konversi, dan intent pelanggan di sini untuk memahami performa AI-mu.",
  },
  {
    id: "conversionRate",
    name: "Conversion Rate",
    description:
      "Lihat persentase pelanggan yang chat lalu benar-benar membeli, beserta rincian transaksinya.",
    route: "/business/:businessId/analytics",
    selector: '[data-tour="conversion-rate"]',
    guideTitle: "Conversion Rate",
    guideBody:
      "Klik angka-angka di sini untuk melihat siapa yang chat, siapa yang membeli, dan total pendapatan.",
  },
  {
    id: "intentDashboard",
    name: "Pelacakan Niat Pelanggan",
    description:
      "Buat intent kustom dan lacak percakapan yang cocok dengan tiap niat pelanggan.",
    route: "/business/:businessId/analytics",
    selector: '[data-tour="intent-dashboard"]',
    guideTitle: "Pelacakan Niat Pelanggan",
    guideBody:
      "Buat intent (mis. tanya harga, komplain) di sini, lalu lihat berapa banyak percakapan yang menyentuh tiap intent.",
  },
  {
    id: "customerTransactions",
    name: "Transaksi Pelanggan",
    description:
      "Pantau semua pembayaran dari pelanggan: status, jumlah, dan link tagihan.",
    route: "/business/:businessId/transaksi",
    selector: '[data-tour="customer-transactions"]',
    guideTitle: "Transaksi Pelanggan",
    guideBody:
      "Cari, filter berdasarkan status, dan pantau pembayaran pelanggan di tabel ini secara real-time.",
  },
  {
    id: "dataExport",
    feature: "dataExport",
    name: "Ekspor Data Transaksi",
    description:
      "Kirim laporan transaksi bulanan otomatis dalam format CSV atau Excel.",
    route: "/business/:businessId/transaksi",
    selector: '[data-tour="monthly-report"]',
    guideTitle: "Ekspor Data Transaksi",
    guideBody:
      "Aktifkan laporan bulanan, isi email tujuan, dan pilih format CSV/Excel. Email wajib diisi untuk menerima file.",
  },
  {
    id: "currentPlan",
    name: "Paket Saat Ini",
    description: "Lihat paket aktif, tanggal tagihan, dan opsi upgrade/batalkan.",
    route: "/business/:businessId/langganan",
    selector: '[data-tour="current-plan"]',
    guideTitle: "Paket Saat Ini",
    guideBody:
      "Cek paket aktif, masa berlaku, dan kelola langganan (upgrade atau batalkan) di sini.",
  },
];

const TUTORIAL_BY_ID = new Map(TUTORIALS.map((tutorial) => [tutorial.id, tutorial]));

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIAL_BY_ID.get(id);
}

export function resolveRoute(route: string, businessId: string): string {
  return route.replace(":businessId", businessId);
}

export function guideStepsFor(
  tutorials: ReadonlyArray<Tutorial>,
  businessId: string,
): FeatureGuideStep[] {
  return tutorials.map((tutorial) => ({
    id: tutorial.id,
    route: resolveRoute(tutorial.route, businessId),
    selector: tutorial.selector,
    title: tutorial.guideTitle,
    body: tutorial.guideBody,
  }));
}
