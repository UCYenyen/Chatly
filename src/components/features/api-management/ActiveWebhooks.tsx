import { Settings, Play, Zap } from "lucide-react"

export function ActiveWebhooks() {
  return (
    <div className="flex flex-col mt-14 gap-6 w-full relative mb-12">
      <div className="flex flex-col gap-1.5 w-full">
        <h2 className="text-xl font-headline font-bold text-on-surface">Webhook Aktif</h2>
        <p className="text-[13px] text-outline">Terima pemberitahuan waktu nyata saat peristiwa terjadi di akun Anda.</p>
      </div>

      <div className="flex flex-col gap-5 mt-2 relative">
        <div className="bg-surface-container-low border border-outline-variant/15 border-l-[3px] border-l-[#bff44c] rounded-r-xl rounded-l-md shadow-xl flex items-center justify-between py-6 px-8 transition-colors hover:bg-surface-container/50 overflow-hidden">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[14px] text-on-surface tracking-wide">
                https://api.acme.co/v1/webhooks/chatly
              </span>
              <div className="bg-[#143600] border border-[#304400] text-[#bff44c] rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono">
                Aktif
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-outline">Peristiwa:</span>
              <span className="text-outline-variant font-medium tracking-wide">pesan.terkirim, pengguna.onboarding_selesai, pembayaran.berhasil</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono text-outline uppercase tracking-widest font-bold">Pengiriman Terakhir</span>
              <span className="text-[12.5px] font-medium text-outline-variant">2 menit yang lalu (200 OK)</span>
            </div>
            <button className="bg-surface-container-high border border-outline-variant/15 hover:bg-surface-variant transition-colors p-2.5 rounded shadow-sm text-outline hover:text-on-surface active:scale-95">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl shadow-xl flex items-center justify-between py-6 px-8 opacity-60 transition-opacity hover:opacity-100 overflow-hidden">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[14px] text-outline tracking-wide">
                https://dev-hook.acme.corp/test
              </span>
              <div className="bg-surface-container border border-outline-variant/15 text-outline rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono">
                Dinonaktifkan
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-outline">Peristiwa:</span>
              <span className="text-outline-variant font-medium tracking-wide">sistem.peringatan</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono text-outline uppercase tracking-widest font-bold">Pengiriman Terakhir</span>
              <span className="text-[12.5px] italic text-[#5c687e]">Tidak ada pengiriman tercatat</span>
            </div>
            <button className="bg-surface-container-high border border-outline-variant/15 hover:bg-surface-variant transition-colors p-2.5 rounded shadow-sm text-outline hover:text-on-surface active:scale-95 pl-3">
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Global Action absolute positioning constraint mapped outside flex gap */}
        <button className="absolute -right-4 -bottom-4 translate-y-10 bg-[#bff44c] p-4 rounded-md shadow-[0_0_20px_rgba(191,244,76,0.3)] hover:scale-105 active:scale-95 transition-transform z-20 border border-[#a4d730]">
          <Zap className="w-6 h-6 fill-[#141f00] text-[#141f00]" />
        </button>
      </div>

      <div className="w-full flex items-center justify-center mt-8 relative z-10">
        <button className="text-[11px] font-mono text-outline hover:text-on-surface uppercase tracking-widest font-bold border-b border-outline-variant/30 pb-0.5 transition-colors">
          Konfigurasi Endpoint Baru
        </button>
      </div>
    </div>
  )
}
