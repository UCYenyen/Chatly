"use client";

import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { IntentDashboard } from "@/components/features/analytics/IntentDashboard";
import { ConversionRateCard } from "@/components/features/analytics/ConversionRateCard";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";
import { FeatureLockOverlay } from "@/components/features/business/FeatureLockOverlay";
import { useBusinessSubscription } from "@/hooks";
import { useParams } from "next/navigation";

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { isPaid, isLoading } = useBusinessSubscription(businessId);

  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1400px] flex flex-col min-h-full">
      <div className="mb-6">
        <ActiveBusinessBanner scopeLabel="Analitik" />
      </div>

      <FeatureLockOverlay
        isLocked={isLoading ? false : !isPaid}
        featureName="Analitik"
        businessId={businessId}
      >
        {/* Conversion Rate Card */}
        <div className="mb-8 w-full">
          <ConversionRateCard />
        </div>

        {/* Intent Dashboard */}
        <div className="flex-1 mb-8 w-full">
          <IntentDashboard />
        </div>

        <div className="mt-auto pt-4">
          <AnalyticsFooter />
        </div>
      </FeatureLockOverlay>
    </div>
  );
}
