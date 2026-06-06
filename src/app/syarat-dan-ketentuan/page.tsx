import type { Metadata } from "next";
import { LandingNavbar } from "@/components/features/landing/LandingNavbar";
import { LandingFooter } from "@/components/features/landing/LandingFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan — Chatly",
  description:
    "Syarat dan Ketentuan penggunaan layanan Chatly AI, termasuk privasi, keamanan, dan status layanan.",
};

interface TermsSection {
  title: string;
  paragraphs: string[];
}

const sections: TermsSection[] = [
  {
    title: "1. Penerimaan Ketentuan",
    paragraphs: [
      "Dengan mengakses dan menggunakan layanan Chatly AI, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat pada seluruh Syarat dan Ketentuan ini.",
      "Apabila Anda tidak menyetujui salah satu bagian dari ketentuan ini, mohon untuk tidak menggunakan layanan kami.",
    ],
  },
  {
    title: "2. Penggunaan Layanan",
    paragraphs: [
      "Chatly AI menyediakan layanan chatbot berbasis kecerdasan buatan untuk membantu bisnis Anda mengelola percakapan pelanggan melalui WhatsApp.",
      "Anda bertanggung jawab penuh atas seluruh konten, data pelanggan, dan aktivitas yang terjadi melalui akun Anda. Anda dilarang menggunakan layanan untuk tujuan yang melanggar hukum atau merugikan pihak lain.",
    ],
  },
  {
    title: "3. Privasi dan Perlindungan Data",
    paragraphs: [
      "Kami menghargai privasi Anda dan pelanggan Anda. Data percakapan, dokumen pelatihan, dan informasi bisnis hanya digunakan untuk menjalankan dan meningkatkan layanan.",
      "Kami tidak menjual data pribadi Anda kepada pihak ketiga. Data diproses sesuai dengan peraturan perlindungan data yang berlaku.",
    ],
  },
  {
    title: "4. Keamanan",
    paragraphs: [
      "Kami menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk verifikasi tanda tangan webhook, enkripsi saat transit, dan kontrol akses berbasis peran.",
      "Anda bertanggung jawab menjaga kerahasiaan kredensial akun, kunci API, dan token sesi Anda. Segera laporkan kepada kami apabila terdapat dugaan akses tidak sah.",
    ],
  },
  {
    title: "5. Pembayaran dan Langganan",
    paragraphs: [
      "Layanan tersedia dalam beberapa paket berlangganan. Biaya akan ditagih sesuai paket yang Anda pilih melalui penyedia pembayaran resmi kami.",
      "Pembatalan langganan dapat dilakukan kapan saja dan akan berlaku pada akhir periode penagihan berjalan, kecuali ditentukan lain.",
    ],
  },
  {
    title: "6. Ketersediaan dan Status Layanan",
    paragraphs: [
      "Kami berupaya menjaga layanan tetap tersedia secara berkelanjutan, namun tidak menjamin layanan bebas dari gangguan, pemeliharaan terjadwal, atau keadaan di luar kendali kami.",
      "Kami berhak melakukan pembaruan, perbaikan, atau penghentian sementara layanan untuk menjaga kualitas dan keamanan sistem.",
    ],
  },
  {
    title: "7. Perubahan Ketentuan",
    paragraphs: [
      "Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan berlaku sejak dipublikasikan pada halaman ini.",
      "Penggunaan layanan secara berkelanjutan setelah perubahan dianggap sebagai persetujuan Anda terhadap ketentuan yang diperbarui.",
    ],
  },
  {
    title: "8. Kontak",
    paragraphs: [
      "Apabila Anda memiliki pertanyaan terkait Syarat dan Ketentuan ini, silakan hubungi tim Chatly AI melalui kanal dukungan resmi kami.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="relative w-full flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <LandingNavbar />
      <main className="flex-1 w-full flex flex-col container mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-16">
        <header className="mb-10">
          <p className="text-[11px] text-outline font-mono uppercase tracking-widest font-bold mb-3">
            Chatly AI
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Syarat dan Ketentuan
          </h1>
          <p className="text-sm text-outline mt-3">
            Terakhir diperbarui: 6 Juni 2026
          </p>
        </header>

        <div className="flex flex-col gap-6 max-w-3xl">
          {sections.map((section) => (
            <Card key={section.title} className="bg-surface-container-low border-outline-variant/20">
              <CardHeader>
                <CardTitle className="text-lg text-on-surface">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
