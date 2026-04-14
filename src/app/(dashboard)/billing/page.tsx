import { BillingHeader } from "@/components/features/billing/BillingHeader";
import { CurrentPlan } from "@/components/features/billing/CurrentPlan";
import { PaymentMethod } from "@/components/features/billing/PaymentMethod";
import { BillingInfo } from "@/components/features/billing/BillingInfo";
import { TransactionHistory } from "@/components/features/billing/TransactionHistory";
import { BillingFooter } from "@/components/features/billing/BillingFooter";

export default function BillingPage() {
  return (
    <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1500px] flex flex-col min-h-full gap-8">
      <BillingHeader />

      <div className="grid grid-cols-12 gap-6 xl:gap-8 shrink-0">
        <div className="col-span-12 xl:col-span-7 2xl:col-span-8">
          <CurrentPlan />
        </div>
        <div className="col-span-12 xl:col-span-5 2xl:col-span-4">
          <PaymentMethod />
        </div>
      </div>

      <div className="w-full shrink-0 mt-2">
        <BillingInfo />
      </div>

      <div className="w-full flex-1 mt-4 mb-8">
        <TransactionHistory />
      </div>

      <div className="mt-auto pt-4">
        <BillingFooter />
      </div>
    </div>
  );
}
