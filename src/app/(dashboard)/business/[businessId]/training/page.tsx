import { TrainingHeader } from "@/components/features/training/TrainingHeader";
import { KnowledgeBase } from "@/components/features/training/KnowledgeBase";
import { ExternalData } from "@/components/features/training/ExternalData";
import { AiPersonality } from "@/components/features/training/AiPersonality";
import { TrainingPreview } from "@/components/features/training/TrainingPreview";
import { TrainingFooter } from "@/components/features/training/TrainingFooter";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";

export default function TrainingPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1500px] flex flex-col min-h-full">
      <TrainingHeader />

      <div className="mt-6">
        <ActiveBusinessBanner scopeLabel="Pelatihan AI" />
      </div>

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
  );
}
