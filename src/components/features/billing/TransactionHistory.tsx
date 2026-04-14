import { Download, ListFilter } from "lucide-react"

export function TransactionHistory() {
  const transactions = [
    {
      date: "Nov 12, 2024",
      description: "Langganan Paket Growth",
      invoice: "INV-2024-11-0024",
      amount: "Rp 349.000",
      status: "Berhasil"
    },
    {
      date: "Okt 12, 2024",
      description: "Langganan Paket Growth",
      invoice: "INV-2024-10-0012",
      amount: "Rp 349.000",
      status: "Berhasil"
    },
    {
      date: "Sep 12, 2024",
      description: "Langganan Paket Growth",
      invoice: "INV-2024-09-0008",
      amount: "Rp 349.000",
      status: "Berhasil"
    }
  ]

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full">
      <div className="p-8 pb-8 flex items-center justify-between border-b border-outline-variant/10">
        <h2 className="text-[16px] font-headline font-bold text-on-surface">Riwayat Transaksi</h2>
        <button className="bg-surface-container border border-outline-variant/15 hover:bg-surface-container-high transition-colors p-2 rounded shadow-sm text-outline hover:text-on-surface active:scale-95">
          <ListFilter className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest bg-surface-container/30">
              <th className="px-8 py-5 font-bold whitespace-nowrap">Tanggal</th>
              <th className="px-4 py-5 font-bold">Deskripsi</th>
              <th className="px-4 py-5 font-bold">Jumlah</th>
              <th className="px-4 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {transactions.map((tx, i) => (
              <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
                <td className="px-8 py-7 text-outline font-medium whitespace-nowrap">{tx.date}</td>
                <td className="px-4 py-7">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-on-surface font-bold">{tx.description}</span>
                    <span className="text-[11px] font-mono text-outline">{tx.invoice}</span>
                  </div>
                </td>
                <td className="px-4 py-7 text-on-surface font-mono font-bold tracking-wide">{tx.amount}</td>
                <td className="px-4 py-7">
                  <div className="inline-flex items-center gap-1.5 bg-[#143600]/80 border border-[#304400] text-secondary-fixed px-2.5 py-1 rounded shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{tx.status}</span>
                  </div>
                </td>
                <td className="px-8 py-7 text-right">
                  <div className="flex justify-end">
                    <button className="text-outline hover:text-on-surface transition-colors active:scale-95 p-2 rounded-full hover:bg-surface-container">
                      <Download className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-outline-variant/10 bg-surface-container-high hover:bg-surface-variant transition-colors cursor-pointer flex justify-center shadow-inner">
        <button className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Lihat Semua Transaksi
        </button>
      </div>
    </div>
  )
}
