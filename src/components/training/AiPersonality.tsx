import { Mic, ChevronDown } from "lucide-react"

export function AiPersonality() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl h-fit">
      <div className="flex items-center gap-3 mb-8">
        <Mic className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">AI Personality</h2>
      </div>

      <div className="flex flex-col gap-4 mb-10">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Voice Configuration
        </span>
        <div className="bg-[#08111d] flex items-center justify-between p-4 px-4 rounded-md border border-outline-variant/15 cursor-pointer hover:border-outline-variant/30 transition-colors shadow-sm">
          <span className="text-[13px] text-outline font-medium">Enterprise Professional</span>
          <ChevronDown className="w-4 h-4 text-outline" />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold mb-1">
          Personality Traits
        </span>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] font-medium">
            <span className="text-outline">Conciseness</span>
            <span className="text-secondary-fixed font-mono font-bold">80%</span>
          </div>
          <div className="h-[3px] w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary-fixed rounded-full shadow-[0_0_10px_rgba(164,215,48,0.5)]" style={{ width: '80%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] font-medium">
            <span className="text-outline">Creativity</span>
            <span className="text-secondary-fixed font-mono font-bold">40%</span>
          </div>
          <div className="h-[3px] w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary-fixed rounded-full shadow-[0_0_10px_rgba(164,215,48,0.5)]" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] font-medium">
            <span className="text-outline">Technicality</span>
            <span className="text-secondary-fixed font-mono font-bold">95%</span>
          </div>
          <div className="h-[3px] w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary-fixed rounded-full shadow-[0_0_10px_rgba(164,215,48,0.5)]" style={{ width: '95%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
