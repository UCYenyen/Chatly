import { CumulativeAnalytics } from "@/components/dashboard/CumulativeAnalytics"
import { BusinessSelectorCards } from "@/components/dashboard/BusinessSelectorCards"
import { AnalyticsFooter } from "@/components/analytics/AnalyticsFooter"

export default function DashboardPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1600px] flex flex-col min-h-full">
      <CumulativeAnalytics />
      
      <div className="flex-1 mt-6">
        <BusinessSelectorCards />
      </div>
      
      <div className="mt-auto pt-16">
        <AnalyticsFooter />
      </div>
    </div>
  )
}
