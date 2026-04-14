export function TokenUsage() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-10 rounded-xl flex flex-col h-[280px] shadow-2xl relative overflow-hidden">
      <div className="flex items-start justify-between relative z-10 w-full shrink-0">
        <div>
          <h2 className="text-xl font-headline font-bold text-on-surface mb-1">Token Usage Overview</h2>
          <p className="text-[13px] text-outline">Across all LLM providers</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1 border border-outline-variant/10 shadow-inner">
          <button className="px-5 py-1.5 text-[10px] font-mono text-outline hover:text-on-surface uppercase tracking-widest rounded-full transition-colors font-bold">
            7 Days
          </button>
          <button className="px-5 py-1.5 text-[10px] font-mono bg-[#3545d6] text-white uppercase tracking-widest rounded-full shadow-md font-bold">
            30 Days
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-8 flex items-end justify-between flex-1 gap-2 relative z-10 w-full h-[150px]">
        <div className="w-full bg-surface-container-highest rounded-t h-[30%] opacity-80"></div>
        <div className="w-full bg-[#1c2635] rounded-t h-[40%] opacity-80"></div>
        <div className="w-full bg-[#1c2635] rounded-t h-[35%] opacity-80"></div>
        <div className="w-full bg-surface-container-highest rounded-t h-[50%] opacity-80"></div>
        <div className="w-full bg-[#1c2635] rounded-t h-[45%] opacity-80"></div>
        <div className="w-full bg-[#1c2635] rounded-t h-[60%] opacity-80"></div>
        <div className="w-full bg-[#3545d6] rounded-t h-[100%] shadow-[0_0_20px_rgba(53,69,214,0.4)]"></div>
        <div className="w-full bg-[#1c2635] rounded-t h-[40%] opacity-80"></div>
        <div className="w-full bg-surface-container-highest rounded-t h-[35%] opacity-80"></div>
        <div className="w-full bg-surface-container-highest rounded-t h-[50%] opacity-80"></div>
        <div className="w-full bg-surface-container-highest rounded-t h-[30%] opacity-80"></div>
      </div>
    </div>
  )
}
