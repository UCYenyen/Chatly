import { Plus, Monitor, Smartphone, Copy, XSquare } from "lucide-react"

export function SecretKeysTable() {
  return (
    <div className="flex flex-col mt-12 gap-6 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-headline font-bold text-on-surface">Kunci Rahasia</h2>
          <p className="text-[13px] text-outline">Kunci API rahasia Anda tercantum di bawah ini. Jangan bagikan ini secara publik.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[13px] h-[38px] px-6 rounded-sm shadow-md transition-transform active:scale-95 border border-[#a4d730]">
          <Plus className="w-4 h-4" />
          <span>Buat Kunci Baru</span>
        </button>
      </div>

      <div className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-xl overflow-hidden mt-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest bg-surface-container/30">
              <th className="px-8 py-5 font-bold whitespace-nowrap">Label</th>
              <th className="px-4 py-5 font-bold">Kunci (Disamarkan)</th>
              <th className="px-4 py-5 font-bold">Dibuat</th>
              <th className="px-8 py-5 font-bold text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            <tr className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
              <td className="px-8 py-7">
                <div className="flex items-center gap-4">
                  <div className="w-[34px] h-[34px] rounded-md bg-[#1e274a] flex items-center justify-center flex-shrink-0 border border-[#3545d6]/20">
                    <Monitor className="w-[18px] h-[18px] text-[#8b9dff]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-on-surface tracking-wide">Aplikasi Desktop Produksi</span>
                    <span className="text-[11.5px] text-outline">Digunakan untuk dasbor pelanggan utama</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-7 font-mono text-outline tracking-wider">ch_live_<span className="opacity-50">••••••••</span>3x9r</td>
              <td className="px-4 py-7 text-outline font-medium tracking-wide">12 Okt, 2023</td>
              <td className="px-8 py-7">
                <div className="flex items-center justify-end gap-3.5">
                  <button className="text-outline hover:text-on-surface transition-colors active:scale-95"><Copy className="w-[18px] h-[18px]" /></button>
                  <button className="text-[#c17f7f] hover:text-error transition-colors active:scale-95"><XSquare className="w-[18px] h-[18px]" /></button>
                </div>
              </td>
            </tr>
            
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="px-8 py-7">
                <div className="flex items-center gap-4">
                  <div className="w-[34px] h-[34px] rounded-md bg-[#1e274a] flex items-center justify-center flex-shrink-0 border border-[#3545d6]/20">
                    <Smartphone className="w-[18px] h-[18px] text-[#8b9dff]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-on-surface tracking-wide">SDK Mobile iOS</span>
                    <span className="text-[11.5px] text-outline">Pengembangan tim mobile internal</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-7 font-mono text-outline tracking-wider">ch_test_<span className="opacity-50">••••••••</span>m0k8</td>
              <td className="px-4 py-7 text-outline font-medium tracking-wide">04 Jan, 2024</td>
              <td className="px-8 py-7">
                <div className="flex items-center justify-end gap-3.5">
                  <button className="text-outline hover:text-on-surface transition-colors active:scale-95"><Copy className="w-[18px] h-[18px]" /></button>
                  <button className="text-[#c17f7f] hover:text-error transition-colors active:scale-95"><XSquare className="w-[18px] h-[18px]" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
