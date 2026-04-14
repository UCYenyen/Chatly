import { Badge } from "@/components/ui/badge"

export function EndpointsList() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-px w-8 bg-secondary-fixed"></div>
        <h2 className="text-2xl font-headline font-bold text-on-surface">Endpoint</h2>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
            <div className="flex items-center gap-4">
              <Badge className="bg-primary-container text-on-primary-container hover:bg-primary-container rounded-sm px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider font-mono border-0">POST</Badge>
              <span className="font-mono text-on-surface font-medium">/v1/messages/send</span>
            </div>
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider">Batas Kecepatan: 500/Mnt</span>
          </div>
          
          <p className="text-outline-variant text-sm leading-relaxed max-w-lg mt-2">
            Mengirim pesan pengguna baru ke unit pemrosesan neural. Mengembalikan pengakuan segera dan referensi streaming.
          </p>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded pb-4 pt-4 px-6 mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-outline">Param:</span>
              <span className="text-on-surface font-mono font-medium">session_id</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-outline">Tipe:</span>
              <span className="text-secondary-fixed font-mono font-bold uppercase">UUID</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
            <div className="flex items-center gap-4">
              <Badge className="bg-surface-container-highest text-on-surface hover:bg-surface-container-highest rounded-sm px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider font-mono border border-outline-variant/20">GET</Badge>
              <span className="font-mono text-on-surface font-medium">/v1/archives/{'{user_id}'}</span>
            </div>
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider">Batas Kecepatan: 100/Mnt</span>
          </div>
          
          <p className="text-outline-variant text-sm leading-relaxed max-w-lg mt-2">
            Mengambil riwayat kinetik lengkap dari sebuah percakapan termasuk token analisis sentimen dan bendera resolusi.
          </p>
        </div>
      </div>
    </section>
  )
}
