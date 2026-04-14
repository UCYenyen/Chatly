export function MessageVolume() {
  return (
    <div className="bg-[#3545d6] rounded-xl p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center min-h-[220px]">
      <div className="relative z-10 flex flex-col h-full justify-center">
        <div>
          <h2 className="text-xl font-headline font-bold text-white mb-4 shadow-sm">Volume Pesan</h2>
          <h1 className="text-5xl font-bold font-headline text-white mb-6 tracking-tight">42.892</h1>
          <p className="text-[13px] text-[#c8ccff] leading-relaxed max-w-[220px]">
            Distribusi global di semua saluran. Kapasitas tersisa: 84%
          </p>
        </div>
      </div>
      
      <div className="absolute right-0 bottom-0 opacity-20 text-[#000865] translate-x-12 translate-y-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
    </div>
  )
}
