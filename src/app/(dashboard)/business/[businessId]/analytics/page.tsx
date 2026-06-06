"use client";

import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { IntentDashboard } from "@/components/features/analytics/IntentDashboard";
import { ConversionRateCard } from "@/components/features/analytics/ConversionRateCard";
import { PerformanceFunnel } from "@/components/features/analytics/PerformanceFunnel";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";
import { FeatureLockOverlay } from "@/components/features/business/FeatureLockOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanGate } from "@/hooks";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BarChart2, Home } from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const gate = usePlanGate();
  const pageLocked = !gate.hasFeature("dataExport");
  const advancedLocked = !gate.hasFeature("advancedAnalytics");

  return (
    <div className="p-4 pt-6 md:p-8 md:pt-8 lg:p-10 w-full mx-auto max-w-[1600px] flex flex-col min-h-full">
      <div className="flex items-center gap-2 mb-4 text-[12px] font-mono text-outline uppercase tracking-widest font-bold">
        <Link href="/dashboard" className="hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
          <Home className="w-3 h-3" /> Utama
        </Link>
        <span>/</span>
        <span className="text-on-surface flex items-center gap-1.5">
          <BarChart2 className="w-3 h-3" /> Analitik
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
          Analitik
        </h1>
        <p className="text-outline mt-2 text-sm max-w-2xl leading-relaxed">
          Lihat analitik dari bisnis anda.
        </p>
      </div>

      <div className="mb-6">
        <ActiveBusinessBanner scopeLabel="Analitik" />
      </div>

      {gate.isLoading ? (
        <div className="flex flex-col gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
      <FeatureLockOverlay
        isLocked={pageLocked}
        featureName="Analitik"
        businessId={businessId}
      >
        <FeatureLockOverlay
          isLocked={advancedLocked}
          featureName="Analitik Lanjutan"
          businessId={businessId}
        >
          {advancedLocked ? (
            <div className="flex flex-col gap-8">
              <div className="h-64 w-full rounded-xl bg-surface-container-low" />
              <div className="h-64 w-full rounded-xl bg-surface-container-low" />
              <div className="h-96 w-full rounded-xl bg-surface-container-low" />
            </div>
          ) : (
            <>
              <div data-tour="advanced-analytics" className="mb-8 w-full">
                <PerformanceFunnel />
              </div>

              <div className="mb-8 w-full">
                <ConversionRateCard />
              </div>

              <div className="flex-1 mb-8 w-full">
                <IntentDashboard />
              </div>
            </>
          )}
        </FeatureLockOverlay>

        <div className="mt-auto pt-4">
          <AnalyticsFooter />
        </div>
      </FeatureLockOverlay>
      )}
    </div>
  );
}
