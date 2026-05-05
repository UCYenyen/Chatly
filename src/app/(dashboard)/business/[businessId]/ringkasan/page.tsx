"use client";

import { CumulativeAnalytics } from "@/components/features/dashboard/CumulativeAnalytics";
import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";

export default function BusinessDashboardPage() {
    const { activeBusiness } = useBusinessContext();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 w-full mx-auto max-w-[1600px] min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-headline font-bold text-on-surface">
                    Dasbor: <span className="text-secondary-fixed">{activeBusiness?.name || "Memuat..."}</span>
                </h1>
                <p className="text-outline">Ikhtisar performa dan aktivitas asisten AI Anda.</p>
            </div>

            <CumulativeAnalytics />

            <div className="mt-auto pt-8">
                <AnalyticsFooter />
            </div>
        </div>
    );
}
