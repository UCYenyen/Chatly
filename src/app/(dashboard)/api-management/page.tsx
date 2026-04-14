import { ApiManagementHeader } from "@/components/api-management/ApiManagementHeader"
import { ApiStatsRow } from "@/components/api-management/ApiStatsRow"
import { SecretKeysTable } from "@/components/api-management/SecretKeysTable"
import { ActiveWebhooks } from "@/components/api-management/ActiveWebhooks"
import { ApiManagementFooter } from "@/components/api-management/ApiManagementFooter"

export default function ApiManagementPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1300px] flex flex-col min-h-full">
      <ApiManagementHeader />
      
      <div className="flex flex-col mt-4 flex-1">
        <ApiStatsRow />
        <SecretKeysTable />
        <ActiveWebhooks />
      </div>
      
      <div className="mt-10">
        <ApiManagementFooter />
      </div>
    </div>
  )
}
