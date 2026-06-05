import type { TourStep } from "@/types/tour.md";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "landing-dashboard",
    route: "/",
    targetSelector: '[data-tour="landing-go-dashboard"]',
    title: "Masuk ke Dashboard",
    body: "Selamat datang! Mari mulai. Klik tombol \"Ke Dashboard\" yang disorot untuk masuk ke ruang kerja Anda.",
    placement: "bottom",
    advance: "target-click",
    allowSkip: true,
  },
  {
    id: "dashboard-welcome",
    route: "/dashboard",
    targetSelector: null,
    title: "Ini Dashboard Anda",
    body: "Dari sini Anda mengelola semua bisnis. Kami akan memandu Anda masuk ke salah satu bisnis untuk melihat fitur lengkapnya.",
    placement: "center",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "select-business",
    route: "/dashboard",
    targetSelector: '[data-tour="business-create"]',
    title: "Pilih atau Buat Bisnis",
    body: "Setiap percakapan AI berjalan di bawah sebuah bisnis. Buat bisnis pertama Anda dengan tombol ini — kami akan otomatis melanjutkan setelah bisnis siap.",
    placement: "right",
    advance: "route-arrival",
    requiresBusiness: true,
    allowSkip: true,
  },
  {
    id: "sidebar-ringkasan",
    route: "/business/:id/ringkasan",
    targetSelector: '[data-tour="sidebar-item-ringkasan"]',
    title: "Ringkasan",
    body: "Halaman Ringkasan menampilkan status koneksi WhatsApp dan performa singkat asisten AI Anda. Ini adalah halaman utama tiap bisnis.",
    placement: "right",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "whatsapp-setup",
    route: "/business/:id/ringkasan",
    targetSelector: '[data-tour="whatsapp-setup"]',
    title: "Hubungkan WhatsApp",
    body: "Di sini Anda menghubungkan nomor WhatsApp bisnis. Setelah terhubung, AI akan otomatis membalas pelanggan Anda.",
    placement: "top",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "sidebar-transaksi",
    route: "/business/:id/ringkasan",
    targetSelector: '[data-tour="sidebar-item-transaksi"]',
    title: "Transaksi",
    body: "Semua transaksi dan handover yang dibuat AI tercatat di sini — lengkap dengan status pembayaran pelanggan.",
    placement: "right",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "sidebar-analitik",
    route: "/business/:id/ringkasan",
    targetSelector: '[data-tour="sidebar-item-analitik"]',
    title: "Analitik",
    body: "Pantau tingkat konversi, intent pelanggan, dan funnel performa AI Anda untuk mengukur efektivitas chatbot.",
    placement: "right",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "analytics-monthly-report",
    route: null,
    targetSelector: null,
    title: "Laporan Bulanan Otomatis",
    body: "Di halaman Analitik, Anda bisa mengaktifkan Laporan Bulanan Otomatis: laporan transaksi bulan sebelumnya dikirim otomatis ke email tujuan tiap bulan (CSV atau XLSX), lalu data transaksi bulan itu dihapus dari sistem (file email menjadi arsipnya).",
    placement: "center",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "sidebar-pelatihan",
    route: "/business/:id/ringkasan",
    targetSelector: '[data-tour="sidebar-item-pelatihan"]',
    title: "Pelatihan",
    body: "Di Pelatihan Anda melatih AI: kepribadian, basis pengetahuan, dan pengaturan penting. Klik menu ini untuk lanjut.",
    placement: "right",
    advance: "target-click",
    allowSkip: true,
  },
  {
    id: "training-notification-phone",
    route: "/business/:id/training",
    targetSelector: '[data-tour="notification-phone"]',
    title: "Tujuan Notifikasi Transaksi",
    body: "Penting: di sinilah Anda mengatur nomor WhatsApp admin yang menerima notifikasi handover dan transaksi. Pastikan nomor ini benar agar Anda tidak melewatkan pesan penting.",
    placement: "bottom",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "sidebar-langganan",
    route: "/business/:id/training",
    targetSelector: '[data-tour="sidebar-item-langganan"]',
    title: "Langganan",
    body: "Kelola paket langganan dan lihat batas fitur Anda di menu Langganan kapan saja.",
    placement: "right",
    advance: "next-button",
    allowSkip: true,
  },
  {
    id: "reaccess-footer",
    route: null,
    targetSelector: '[data-tour="tour-reopen"]',
    title: "Tutorial Selesai!",
    body: "Anda siap menggunakan Chatly. Ingin mengulang tutorial ini? Klik tombol \"Tutorial / Bantuan\" yang disorot di bagian bawah sidebar kapan pun Anda butuh.",
    placement: "right",
    advance: "next-button",
    allowSkip: false,
  },
];

export function matchTourRoute(
  pattern: string | null,
  pathname: string,
): boolean {
  if (pattern === null) return true;
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  if (patternSegments.length !== pathSegments.length) return false;
  return patternSegments.every(
    (segment, index) =>
      segment.startsWith(":") || segment === pathSegments[index],
  );
}
