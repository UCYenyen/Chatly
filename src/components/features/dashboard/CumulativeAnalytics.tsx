import { Activity, Clock9, LineChart, Server } from "lucide-react"

export function CumulativeAnalytics() {
    return (
        <div className="flex flex-col gap-6 w-full mb-12">
            <div className="flex flex-col gap-2 mb-2">
                <h2 className="text-[28px] md:text-[32px] font-headline font-bold text-on-surface tracking-tight">Kinerja Kumulatif Global</h2>
                <p className="text-[14px] text-outline max-w-3xl leading-relaxed">
                    Metrik di bawah ini adalah agregat dari seluruh organisasi dan bisnis aktif yang terhubung ke akun Chatly Anda. Pantau dampak bisnis skala besar hanya dari satu layar.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 xl:gap-8 auto-rows-fr">
                {/* Metric 1 */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Total Interaksi Global</span>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">2.4jt</span>
                            <span className="text-[12px] font-bold text-secondary-fixed mb-1.5">+14%</span>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 text-on-surface group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 translate-x-4 translate-y-4">
                        <LineChart className="w-24 h-24" strokeWidth={1} />
                    </div>
                </div>

                {/* Metric 2 */}
                {/* <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-2xl flex flex-col justify-between group overflow-hidden relative">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Kapasitas Operasional</span>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">99.9%</span>
            </div>
            <p className="text-[12px] text-outline mt-3">Tidak ada waktu henti dalam 30 hari.</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-on-surface group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 translate-x-4 translate-y-4">
            <Server className="w-24 h-24" strokeWidth={1} />
          </div>
        </div> */}

                {/* Metric 3 */}
                {/* <div className="bg-[#3545d6] border border-[#4856d8] p-8 rounded-xl shadow-[0_10px_40px_rgba(53,69,214,0.3)] flex flex-col justify-between group overflow-hidden relative">
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[11px] font-mono text-[#c8ccff] uppercase tracking-widest font-bold">Total Waktu Dihemat</span>
            <div className="flex items-end gap-1 mt-2">
              <span className="text-4xl font-headline font-bold text-white tracking-tight">1.240</span>
              <span className="text-[18px] font-bold text-white mb-0.5">Jam</span>
            </div>
            <p className="text-[12px] text-[#c8ccff] mt-3 max-w-[150px]">Valuasi efisiensi dukungan bulan ini.</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 text-[#000865] group-hover:scale-110 group-hover:opacity-30 transition-all duration-500 translate-x-6 translate-y-6">
            <Clock9 className="w-28 h-28" strokeWidth={1.5} />
          </div>
        </div> */}

                {/* Metric 4 */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-2xl flex flex-col justify-between group overflow-hidden relative border-r-4 border-r-secondary-fixed">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Bisnis Aktif</span>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">3</span>
                        </div>
                        <p className="text-[12px] text-outline mt-3">Organisasi dikelola dalam akun Anda.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 text-on-surface group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 translate-x-4 translate-y-4">
                        <Activity className="w-24 h-24" strokeWidth={1} />
                    </div>
                </div>
            </div>
        </div>
    )
}
