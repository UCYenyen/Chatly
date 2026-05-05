"use client";

import { MessageSquareText } from "lucide-react"
import { useBusinessContext } from "@/components/features/business/BusinessProvider"
import { useUpdateBusiness } from "@/hooks/use-update-business"
import { toast } from "sonner"

export function AiPersonality() {
  const { activeBusiness, refresh } = useBusinessContext();
  const { updateBusiness, isPending } = useUpdateBusiness(activeBusiness?.id ?? null);

  const tones = [
    { id: 'professional', name: 'Profesional', desc: 'Formal, presisi, dan fokus pada bisnis' },
    { id: 'friendly', name: 'Ramah', desc: 'Hangat, mudah didekati, dan membantu' },
    { id: 'casual', name: 'Santai', desc: 'Rileks, informal, dan santai' },
    { id: 'direct', name: 'Langsung', desc: 'Langsung ke intinya, jelas, dan berorientasi aksi' }
  ];

  const currentTone = activeBusiness?.aiTone || 'professional';

  const handleSelect = async (toneId: string) => {
    if (toneId === currentTone || isPending) return;
    
    const updated = await updateBusiness({ aiTone: toneId });
    if (updated) {
      toast.success(`Nada bicara diubah ke ${tones.find(t => t.id === toneId)?.name}`);
      await refresh();
    } else {
      toast.error("Gagal mengubah nada bicara");
    }
  };

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
          {tones.map((tone) => {
            const isSelected = tone.id === currentTone;
            return (
              <div 
                key={tone.id} 
                onClick={() => handleSelect(tone.id)}
                className={`flex flex-col p-4 rounded-md border cursor-pointer transition-all shadow-sm ${
                  isSelected 
                    ? 'bg-surface-container-high border-secondary-fixed/50 border-l-[3px] border-l-secondary-fixed ring-1 ring-secondary-fixed/10' 
                    : 'bg-[#08111d] border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container/10'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-bold ${isSelected ? 'text-secondary-fixed' : 'text-on-surface'}`}>
                    {tone.name}
                  </span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
                  )}
                </div>
                <span className="text-[11px] text-outline mt-1 leading-relaxed">{tone.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
