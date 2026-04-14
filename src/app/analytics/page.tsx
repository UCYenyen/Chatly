import { VerifiedConversion } from "@/components/analytics/VerifiedConversion"
import { TokenUsage } from "@/components/analytics/TokenUsage"
import { IntentAnalyticsTable } from "@/components/analytics/IntentAnalyticsTable"
import { MessageVolume } from "@/components/analytics/MessageVolume"
import { TopIntents } from "@/components/analytics/TopIntents"
import { AiInsight } from "@/components/analytics/AiInsight"
import { AnalyticsFooter } from "@/components/analytics/AnalyticsFooter"

export default function AnalyticsPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1600px] flex flex-col min-h-full">
      <div className="grid grid-cols-12 gap-6 xl:gap-8 mb-6 xl:mb-8 shrink-0">
        <div className="col-span-12 xl:col-span-4">
          <VerifiedConversion />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <TokenUsage />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6 xl:gap-8 flex-1 mb-8">
        <div className="col-span-12 xl:col-span-8 flex flex-col min-h-[500px]">
          <IntentAnalyticsTable />
        </div>
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 xl:gap-8 min-h-0">
          <div className="flex-[1.2]"><MessageVolume /></div>
          <div className="flex-[1.2]"><TopIntents /></div>
          <div className="flex-1"><AiInsight /></div>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <AnalyticsFooter />
      </div>
    </div>
  )
}
