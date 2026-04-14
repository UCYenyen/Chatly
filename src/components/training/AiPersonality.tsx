import { MessageSquareText } from "lucide-react"

export function AiPersonality() {
  const tones = [
    { id: 'professional', name: 'Profesional', desc: 'Formal, presisi, dan fokus pada bisnis' },
    { id: 'friendly', name: 'Ramah', desc: 'Hangat, mudah didekati, dan membantu' },
    { id: 'casual', name: 'Santai', desc: 'Rileks, informal, dan santai' },
    { id: 'direct', name: 'Langsung', desc: 'Langsung ke intinya, jelas, dan berorientasi aksi' }
  ];

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl h-fit">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquareText className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">Nada Bicara AI</h2>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold mb-1">
          Pilih Kepribadian Dasar
        </span>
        
        <div className="flex flex-col gap-3">
          {tones.map((tone, idx) => (
            <div 
              key={tone.id} 
              className={`flex flex-col p-4 rounded-md border cursor-pointer transition-colors shadow-sm ${
                idx === 0 
                  ? 'bg-surface-container-high border-secondary-fixed/50 border-l-[3px] border-l-secondary-fixed' 
                  : 'bg-[#08111d] border-outline-variant/15 hover:border-outline-variant/30'
              }`}
            >
              <span className={`text-[13px] font-medium ${idx === 0 ? 'text-secondary-fixed' : 'text-on-surface'}`}>
                {tone.name}
              </span>
              <span className="text-[11px] text-outline mt-1">{tone.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
