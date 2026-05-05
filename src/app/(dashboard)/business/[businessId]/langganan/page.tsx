import { SubscriptionHeader } from '@/components/features/subscription/SubscriptionHeader'
import { CurrentPlan } from '@/components/features/subscription/CurrentPlan'
import { SubscriptionProvider } from '@/components/features/subscription/SubscriptionProvider'
import { ActiveBusinessBanner } from '@/components/features/business/ActiveBusinessBanner'

interface PageProps {
    params: Promise<{ businessId: string }>
}

export default async function SubscriptionPage({ params }: PageProps) {
    const { businessId } = await params

    return (
        <SubscriptionProvider businessId={businessId}>
            <div className="p-8 lg:p-12 xl:p-14 w-full mx-auto max-w-[1500px] flex flex-col min-h-full gap-8">
                <SubscriptionHeader />

                <div className="mt-2">
                    <ActiveBusinessBanner scopeLabel="Langganan Bisnis" />
                </div>

                <div className="grid grid-cols-12 gap-6 xl:gap-8 shrink-0">
                    <div className="col-span-12 xl:col-span-8">
                        <CurrentPlan />
                    </div>
                </div>

                <div className="flex-1" />
            </div>
        </SubscriptionProvider>
    )
}
