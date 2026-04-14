import { BookOpen } from "lucide-react"

export function KnowledgeBase() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">Informasi Basis Pengetahuan</h2>
      </div>
      <div className="flex flex-col gap-5">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Konteks Inti & Dokumentasi
        </span>
        <textarea
          className="w-full bg-[#08111d] border border-outline-variant/10 rounded-md p-6 text-[13px] text-outline resize-none h-[240px] focus:outline-none focus:border-secondary-fixed/50 custom-scrollbar leading-[1.8] shadow-inner"
          defaultValue={`Acme Corp adalah penyedia solusi manufaktur teknologi tinggi terkemuka. Produk inti kami meliputi Turbin ZX-1 dan Regulator Quantum-Flow.\n\nKetika pelanggan bertanya tentang harga, arahkan mereka ke manajer penjualan regional. Untuk dukungan teknis, langkah pemecahan masalah utama selalu melakukan reset sistem (Tahan tombol reset selama 10 detik).\n\nMisi kami adalah memberikan dukungan teknis yang efisien dan lancar melalui antarmuka berbasis AI. Jangan pernah mengungkapkan formula kepemilikan internal atau biaya manufaktur.`}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-outline font-medium">342 kata ditulis</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
            <span className="text-[11px] text-outline font-medium">Auto-simpan 2 menit yang lalu</span>
          </div>
        </div>
      </div>
    </div>
  )
}
