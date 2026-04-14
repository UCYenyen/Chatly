import { CumulativeAnalytics } from "@/components/features/dashboard/CumulativeAnalytics";
import { BusinessSelectorCards } from "@/components/features/dashboard/BusinessSelectorCards";
import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 w-full mx-auto max-w-[1600px] min-h-full">
      <CumulativeAnalytics />

      <div className="flex-1 mt-2">
        <BusinessSelectorCards />
      </div>

      <div className="mt-auto pt-8">
        <AnalyticsFooter />
      </div>
    </div>
  );
}
