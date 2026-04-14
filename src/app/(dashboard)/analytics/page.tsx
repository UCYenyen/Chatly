import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { IntentDashboard } from "@/components/features/analytics/IntentDashboard";

export default function AnalyticsPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1400px] flex flex-col min-h-full">
      <div className="flex-1 mb-8 w-full">
        <IntentDashboard />
      </div>

      <div className="mt-auto pt-4">
        <AnalyticsFooter />
      </div>
    </div>
  );
}
