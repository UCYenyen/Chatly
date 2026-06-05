"use client";

import { TrainingHeader } from "@/components/features/training/TrainingHeader";
import { KnowledgeBase } from "@/components/features/training/KnowledgeBase";
import { AiPersonality } from "@/components/features/training/AiPersonality";
import { BusinessHours } from "@/components/features/training/BusinessHours";
import { MonthlyReport } from "@/components/features/training/MonthlyReport";
import { TrainingPreview } from "@/components/features/training/TrainingPreview";
import { TrainingFooter } from "@/components/features/training/TrainingFooter";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";
import { FeatureLockOverlay } from "@/components/features/business/FeatureLockOverlay";
import { useBusinessSubscription } from "@/hooks";
import { useParams } from "next/navigation";

export default function TrainingPage() {
    const params = useParams();
    const businessId = params.businessId as string;
    const { isPaid, isLoading } = useBusinessSubscription(businessId);

    return (
        <div className="p-4 pt-6 md:p-8 md:pt-8 lg:p-10 w-full mx-auto max-w-[1600px] flex flex-col min-h-full">
            <TrainingHeader />

            <ActiveBusinessBanner scopeLabel="Pelatihan AI" />

            <FeatureLockOverlay
                isLocked={isLoading ? false : !isPaid}
                featureName="Pelatihan"
                businessId={businessId}
            >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-8 flex-1">
                    <div className="col-span-1 xl:col-span-7 flex flex-col">
                        <KnowledgeBase />
                    </div>

                    <div className="col-span-1 xl:col-span-5 flex flex-col">
                        <AiPersonality />
                        <div className="mt-8">
                            <BusinessHours />
                        </div>
                        <div className="mt-8">
                            <MonthlyReport />
                        </div>
                        {/* <TrainingPreview /> */}
                    </div>
                </div>

                <div className="mt-8">
                    <TrainingFooter />
                </div>
            </FeatureLockOverlay>
        </div>
    );
}
