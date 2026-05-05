"use client";

import { Rocket, Send, Sparkles } from "lucide-react"

export function TrainingPreview() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl mt-8 h-fit relative">
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">Pratinjau Pelatihan</h2>
      </div>
      
      <p className="text-[13px] text-outline leading-relaxed mb-6">
        Uji konfigurasi saat ini secara real-time. Perubahan tercermin secara instan di sandbox di bawah ini.
      </p>

      <div className="bg-[#08111d] border border-outline-variant/10 rounded-lg p-5 flex flex-col gap-5 relative shadow-inner">
        <div className="bg-surface-container-high text-outline text-[12px] p-4 px-5 rounded-md rounded-tl-none w-[85%] self-start leading-[1.6] border border-outline-variant/5 shadow-sm">
          Halo! Bagaimana saya bisa membantu Anda dengan solusi Acme Corp hari ini?
        </div>
        
        <div className="bg-[#3545d6] text-white text-[12px] p-4 px-5 rounded-md rounded-br-none w-[80%] self-end leading-[1.6] shadow-md border border-[#3c4cdc]/50">
          Apa garansi untuk ZX-1?
        </div>
        
        <div className="bg-surface-container-high text-outline-variant text-[12px] p-3 px-5 rounded-md rounded-tl-none w-fit self-start italic border border-outline-variant/5 mb-2 shadow-sm">
          Berpikir...
        </div>

        <div className="absolute -right-3 bottom-20 bg-[#bff44c] p-3 rounded-lg shadow-[0_0_20px_rgba(191,244,76,0.3)] cursor-pointer hover:scale-105 transition-transform z-10 border border-[#a4d730]">
          <Sparkles className="w-6 h-6 fill-[#141f00] text-[#141f00]" />
        </div>

        <div className="mt-2 relative w-full pt-1">
          <input 
            type="text" 
            placeholder="Ketik pesan tes..." 
            className="w-full bg-surface-container-high text-[12px] text-on-surface placeholder:text-outline/70 border border-outline-variant/15 rounded-md py-3.5 pl-4 pr-12 focus:outline-none focus:border-secondary-fixed/50 shadow-sm"
          />
          <Send className="w-4 h-4 text-[#bff44c] absolute right-4 top-1/2 -translate-y-[20%] cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  )
}
