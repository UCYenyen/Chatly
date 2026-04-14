"use client"

import { useState } from "react"
import { Plus, BarChart2, MessageSquare, Users, Download, CheckCircle2, XCircle } from "lucide-react"

export function IntentDashboard() {
  const [trackedIntents, setTrackedIntents] = useState<string[]>([
    "Pelanggan tertarik pada perpanjangan Produk X",
    "Pertanyaan tentang diskon lisensi massal"
  ])
  const [activeIntent, setActiveIntent] = useState<string | null>(trackedIntents[0])
  const [inputValue, setInputValue] = useState("")

  const handleAddIntent = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !trackedIntents.includes(inputValue.trim())) {
      const newIntent = inputValue.trim()
      setTrackedIntents([...trackedIntents, newIntent])
      setActiveIntent(newIntent)
      setInputValue("")
    }
  }

  // Dummy data generator based on intent name
  const getDummyData = (intent: string) => {
    // Generate pseudo-random deterministic numbers based on string length
    const baseNum = intent.length * 42
    
    return {
      messages: baseNum * 12 + 1500,
      sessions: baseNum * 2 + 120,
      rows: [
        {
          time: "24 Okt, 2023 · 14:22:10",
          phone: "+62 812-3942-5591",
          verification: true
        },
        {
          time: "24 Okt, 2023 · 14:18:05",
          phone: "+62 857-1102-1204",
          verification: true
        },
        {
          time: "24 Okt, 2023 · 13:55:42",
          phone: "+62 821-4491-8832",
          verification: false
        },
        {
          time: "24 Okt, 2023 · 12:30:11",
          phone: "+62 819-0012-0045",
          verification: true
        }
      ]
    }
  }

  const currentData = activeIntent ? getDummyData(activeIntent) : null

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Top Section: Intent Input and Selection */}
      <div className="bg-surface-container-low border border-outline-variant/15 p-8 xl:p-10 rounded-xl shadow-2xl flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Pelacakan Niat Pelanggan</h2>
          <p className="text-[14px] text-outline max-w-2xl leading-relaxed">
            Masukkan niat spesifik (intent) yang ingin Anda pantau. Chatly AI akan menyortir dan menganalisis percakapan mana saja yang mengandung niat tersebut.
          </p>
        </div>

        <form onSubmit={handleAddIntent} className="flex items-center gap-4">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik niat yang ingin dilacak (misal: 'Ingin mengajukan refund')..." 
            className="flex-1 max-w-xl bg-[#08111d] text-[13px] text-on-surface placeholder:text-outline/70 border border-outline-variant/15 rounded-md py-3.5 px-5 focus:outline-none focus:border-secondary-fixed/50 shadow-inner"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="flex items-center gap-2 bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-[13px] h-[46px] px-6 rounded-md shadow-md transition-transform active:scale-95 border border-[#a4d730]"
          >
            <Plus className="w-4 h-4" />
            <span>Lacak Niat</span>
          </button>
        </form>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Niat Terlacak Saya</span>
          <div className="flex items-center gap-3 flex-wrap">
            {trackedIntents.length === 0 ? (
              <span className="text-[13px] text-outline italic">Belum ada niat yang dilacak.</span>
            ) : (
              trackedIntents.map((intent) => (
                <button
                  key={intent}
                  onClick={() => setActiveIntent(intent)}
                  className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all shadow-sm border ${
                    activeIntent === intent 
                      ? "bg-secondary-fixed text-on-secondary border-secondary shadow-[0_0_15px_rgba(164,215,48,0.3)]" 
                      : "bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border-outline-variant/20"
                  }`}
                >
                  {intent}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Section (Conditional) */}
      {activeIntent && currentData && (
        <div className="flex flex-col gap-6 xl:gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-secondary-fixed" />
            <h3 className="text-xl font-headline font-bold text-on-surface">
              Ringkasan Kinerja: <span className="text-secondary-fixed">"{activeIntent}"</span>
            </h3>
          </div>

          {/* Dummy Visualizations Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
            {/* Messages Count */}
            <div className="bg-[#3545d6] rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[180px]">
              <div className="relative z-10 flex flex-col h-full justify-center">
                <span className="text-[11px] font-mono text-[#c8ccff] uppercase tracking-widest font-bold mb-2">Volume Pesan Terkait</span>
                <div className="flex items-end gap-3 mb-2">
                  <h1 className="text-5xl font-bold font-headline text-white tracking-tight">{currentData.messages.toLocaleString('id-ID')}</h1>
                  <span className="text-[#a4d730] font-bold text-[13px] mb-1.5">+12.4%</span>
                </div>
                <p className="text-[12px] text-[#c8ccff] leading-relaxed">
                  Total pesan yang terklasifikasi sebagai niat ini.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 text-[#000865] translate-x-8 translate-y-8">
                <MessageSquare className="w-48 h-48" />
              </div>
            </div>

            {/* Session Count */}
            <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[180px] border-l-4 border-l-secondary-fixed">
              <div className="relative z-10 flex flex-col h-full justify-center">
                <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold mb-2">Sesi Percakapan</span>
                <div className="flex items-end gap-3 mb-2">
                  <h1 className="text-5xl font-bold font-headline text-on-surface tracking-tight">{currentData.sessions.toLocaleString('id-ID')}</h1>
                  <span className="text-[#a4d730] font-bold text-[13px] mb-1.5">+5.8%</span>
                </div>
                <p className="text-[12px] text-outline leading-relaxed max-w-[240px]">
                  Sesi pengguna unik di mana mereka memiliki niat ini.
                </p>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 text-on-surface">
                <Users className="w-32 h-32" />
              </div>
            </div>
          </div>

          {/* Adapted IntentAnalyticsTable */}
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden h-full mt-2">
            <div className="p-8 pb-8 flex items-center justify-between border-b border-outline-variant/10">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface mb-2">Log Percakapan Terkait</h2>
                <p className="text-[13px] text-outline">Percakapan pengguna dengan niat yang saat ini dipantau</p>
              </div>
              <div className="flex items-center gap-6">
                <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest bg-surface-container/30">
                    <th className="px-8 py-5 font-bold whitespace-nowrap">Stempel Waktu Percakapan</th>
                    <th className="px-4 py-5 font-bold">Nomor Telepon User</th>
                    <th className="px-8 py-5 font-bold text-right">Konfidensi LLM</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {currentData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
                      <td className="px-8 py-7 text-outline font-medium whitespace-nowrap">{row.time}</td>
                      <td className="px-4 py-7 text-on-surface font-mono font-medium">{row.phone}</td>
                      <td className="px-8 py-7 text-right">
                        {row.verification ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#143600]/80 border border-[#304400] text-secondary-fixed px-2.5 py-1 rounded shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-secondary-fixed text-[#143600]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Tinggi</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-[#4a0005]/80 border border-error-container text-error px-2.5 py-1 rounded shadow-sm">
                            <XCircle className="w-3.5 h-3.5 fill-error text-[#4a0005]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Rendah</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-outline-variant/10 bg-surface-container-high hover:bg-surface-variant transition-colors cursor-pointer flex justify-center mt-auto shadow-inner">
              <button className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
                Muat Lebih Banyak
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
