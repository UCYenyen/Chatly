import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TrainingHeader() {
  return (
    <div className="flex flex-col gap-6 w-full border-b border-outline-variant/10 pb-10">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <span className="text-xl font-headline font-bold text-on-surface tracking-wide">Pusat Pengetahuan</span>
          <Badge className="bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] rounded-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono border-0">
            Model V2.4 Aktif
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[13px] text-outline hover:text-on-surface font-medium transition-colors">
            Batalkan
          </button>
          <Button className="bg-[#a4d730] text-[#253600] hover:bg-[#87b800] hover:text-[#141f00] font-bold text-[13px] h-9 px-6 rounded-sm shadow-md">
            Simpan Perubahan
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <h1 className="text-4xl font-headline font-bold text-on-surface">Latih Kecerdasan Anda</h1>
        <p className="text-[15px] text-outline leading-relaxed max-w-3xl">
          Sempurnakan cara AI Anda berinteraksi dengan pelanggan di Acme Corp. Unggah dokumen, atur batasan perilaku, dan tentukan basis pengetahuan inti.
        </p>
      </div>
    </div>
  )
}
