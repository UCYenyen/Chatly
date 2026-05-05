import { ApiManagementHeader } from "@/components/features/api-management/ApiManagementHeader";
import { ApiStatsRow } from "@/components/features/api-management/ApiStatsRow";
import { SecretKeysTable } from "@/components/features/api-management/SecretKeysTable";
import { ActiveWebhooks } from "@/components/features/api-management/ActiveWebhooks";
import { ApiManagementFooter } from "@/components/features/api-management/ApiManagementFooter";

import { notFound } from "next/navigation";

export default function ApiManagementPage() {
  notFound();
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
  );
}
