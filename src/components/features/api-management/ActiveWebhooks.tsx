import { Settings, Play, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ActiveWebhooks() {
  return (
    <div className="flex flex-col mt-14 gap-6 w-full relative mb-12">
      <div className="flex flex-col gap-1.5 w-full">
        <h2 className="text-xl font-headline font-bold text-on-surface">Webhook Aktif</h2>
        <p className="text-[13px] text-outline">Terima pemberitahuan waktu nyata saat peristiwa terjadi di akun Anda.</p>
      </div>

      <div className="flex flex-col gap-5 mt-2 relative">
        <div className="bg-surface-container-low border border-outline-variant/15 border-l-[3px] border-l-secondary-fixed rounded-r-xl rounded-l-md shadow-xl flex items-center justify-between py-6 px-8 transition-colors hover:bg-surface-container/50 overflow-hidden">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[14px] text-on-surface tracking-wide">
                https://api.acme.co/v1/webhooks/chatly
              </span>
              <div className="bg-success/20 border border-success text-success rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono">
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
            <Button variant="ghost" size="icon" className="bg-surface-container-high border border-outline-variant/15 hover:bg-surface-variant transition-colors text-outline hover:text-on-surface">
              <Settings className="w-5 h-5" />
            </Button>
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
            <Button variant="ghost" size="icon" className="bg-surface-container-high border border-outline-variant/15 hover:bg-surface-variant transition-colors text-outline hover:text-on-surface">
              <Play className="w-5 h-5 fill-current" />
            </Button>
          </div>
        </div>

        {/* Global Action absolute positioning constraint mapped outside flex gap */}
        <Button className="absolute -right-4 -bottom-4 translate-y-10 bg-secondary-fixed p-4 rounded-md shadow-[0_0_20px_rgba(191,244,76,0.3)] hover:scale-105 active:scale-95 transition-transform z-20 border border-secondary-fixed/80">
          <Zap className="w-6 h-6 fill-on-secondary-fixed text-on-secondary-fixed" />
        </Button>
      </div>

      <div className="w-full flex items-center justify-center mt-8 relative z-10">
        <Button variant="ghost" className="text-[11px] font-mono text-outline hover:text-on-surface uppercase tracking-widest font-bold border-b border-outline-variant/30 pb-0.5 transition-colors h-auto p-0">
          Konfigurasi Endpoint Baru
        </Button>
      </div>
    </div>
  )
}
