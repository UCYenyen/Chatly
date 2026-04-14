import { BookOpen } from "lucide-react"

export function KnowledgeBase() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">Knowledge Base Information</h2>
      </div>
      <div className="flex flex-col gap-5">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Core Context & Documentaton
        </span>
        <textarea
          className="w-full bg-[#08111d] border border-outline-variant/10 rounded-md p-6 text-[13px] text-outline resize-none h-[240px] focus:outline-none focus:border-secondary-fixed/50 custom-scrollbar leading-[1.8] shadow-inner"
          defaultValue={`Acme Corp is a leading provider of high-tech manufacturing solutions. Our core products include the ZX-1 Turbine and the Quantum-Flow Regulator.\n\nWhen customers ask about pricing, refer them to the regional sales manager. For technical support, the primary troubleshooting step is always a system reset (Hold reset button for 10s).\n\nOur mission is to provide efficient, zero-friction engineering support via AI-driven interfaces. Never disclose internal proprietary formulas or manufacturing costs.`}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-outline font-medium">342 words written</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
            <span className="text-[11px] text-outline font-medium">Auto-saved 2m ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
