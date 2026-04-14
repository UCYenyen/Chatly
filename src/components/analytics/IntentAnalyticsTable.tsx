import { Download, CheckCircle2, XCircle } from "lucide-react"

export function IntentAnalyticsTable() {
  const rows = [
    {
      time: "24 Okt, 2023 · 14:22:10",
      intent: "Pelanggan tertarik pada perpanjangan Produk X",
      verification: true,
      model: "GPT-4o-Turbo"
    },
    {
      time: "24 Okt, 2023 · 14:18:05",
      intent: "Pertanyaan dukungan umum tentang penundaan login",
      verification: false,
      model: "Claude-3.5-S"
    },
    {
      time: "24 Okt, 2023 · 13:55:42",
      intent: "Tertarik pada peningkatan untuk Paket Tim",
      verification: true,
      model: "GPT-4o-Turbo"
    },
    {
      time: "24 Okt, 2023 · 13:40:11",
      intent: "Pertanyaan tentang diskon lisensi massal",
      verification: true,
      model: "GPT-4o-Turbo"
    }
  ]

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden h-full">
      <div className="p-8 pb-8 flex items-center justify-between border-b border-outline-variant/10">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Laporan Analitik Niat</h2>
          <p className="text-[14px] text-outline">Verifikasi LLM waktu nyata dari string niat pelanggan</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold mb-1">Jumlah Niat Benar</span>
            <span className="text-2xl font-bold text-secondary-fixed">2.481</span>
          </div>
          <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container ml-2">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest">
              <th className="px-8 py-5 font-bold whitespace-nowrap">Stempel Waktu Percakapan</th>
              <th className="px-4 py-5 font-bold">Niat Diklasifikasikan LLM</th>
              <th className="px-4 py-5 font-bold">Verifikasi</th>
              <th className="px-8 py-5 font-bold text-right">Model</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
                <td className="px-8 py-7 text-outline font-medium whitespace-nowrap">{row.time}</td>
                <td className="px-4 py-7 text-on-surface font-medium pr-10">{row.intent}</td>
                <td className="px-4 py-7">
                  {row.verification ? (
                    <div className="inline-flex items-center gap-1.5 bg-[#143600]/80 border border-[#304400] text-secondary-fixed px-2.5 py-1 rounded shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-secondary-fixed text-[#143600]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Benar</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-[#4a0005]/80 border border-error-container text-error px-2.5 py-1 rounded shadow-sm">
                      <XCircle className="w-3.5 h-3.5 fill-error text-[#4a0005]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Salah</span>
                    </div>
                  )}
                </td>
                <td className="px-8 py-7 text-outline text-right font-medium">{row.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-outline-variant/10 bg-surface-container-high hover:bg-surface-variant transition-colors cursor-pointer flex justify-center mt-auto shadow-inner">
        <button className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Lihat Semua Log Percakapan
        </button>
      </div>
    </div>
  )
}
