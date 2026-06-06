import type { BooleanFeatureKey } from "@/types/plan-limits.md";
import type { FeatureGuideStep, FeatureTutorial } from "@/types/feature-tutorial.md";

export const FEATURE_TUTORIALS: FeatureTutorial[] = [
  {
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
    feature: "dataExport",
    name: "Ekspor Data Transaksi",
    description:
      "Kirim laporan transaksi bulanan otomatis dalam format CSV atau Excel.",
    route: "/business/:businessId/transaksi",
    selector: '[data-tour="monthly-report"]',
    guideTitle: "Ekspor Data Transaksi",
    guideBody:
      "Aktifkan laporan bulanan, isi email tujuan, dan pilih format CSV/Excel. Kamu juga bisa kirim sekarang kapan saja.",
  },
  {
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
];

export function resolveRoute(route: string, businessId: string): string {
  return route.replace(":businessId", businessId);
}

export function tutorialsForFeatures(
  features: ReadonlyArray<string>,
): FeatureTutorial[] {
  return FEATURE_TUTORIALS.filter((tutorial) =>
    features.includes(tutorial.feature),
  );
}

export function guideStepsFor(
  tutorials: ReadonlyArray<FeatureTutorial>,
  businessId: string,
): FeatureGuideStep[] {
  return tutorials.map((tutorial) => ({
    feature: tutorial.feature,
    route: resolveRoute(tutorial.route, businessId),
    selector: tutorial.selector,
    title: tutorial.guideTitle,
    body: tutorial.guideBody,
  }));
}

export const TUTORIALIZABLE_FEATURES: ReadonlyArray<BooleanFeatureKey> =
  FEATURE_TUTORIALS.map((tutorial) => tutorial.feature);
