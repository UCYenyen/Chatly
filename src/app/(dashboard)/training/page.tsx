import { TrainingHeader } from "@/components/training/TrainingHeader"
import { KnowledgeBase } from "@/components/training/KnowledgeBase"
import { ExternalData } from "@/components/training/ExternalData"
import { AiPersonality } from "@/components/training/AiPersonality"
import { TrainingPreview } from "@/components/training/TrainingPreview"
import { TrainingFooter } from "@/components/training/TrainingFooter"

export default function TrainingPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1500px] flex flex-col min-h-full">
      <TrainingHeader />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-8 flex-1">
        <div className="col-span-1 xl:col-span-7 flex flex-col">
          <KnowledgeBase />
          <ExternalData />
        </div>
        
        <div className="col-span-1 xl:col-span-5 flex flex-col">
          <AiPersonality />
          <TrainingPreview />
        </div>
      </div>
      
      <div className="mt-8">
        <TrainingFooter />
      </div>
    </div>
  )
}
