import { SubscriptionHeader } from '@/components/features/subscription/SubscriptionHeader'
import { CurrentPlan } from '@/components/features/subscription/CurrentPlan'
import { SubscriptionProvider } from '@/components/features/subscription/SubscriptionProvider'
import { ActiveBusinessBanner } from '@/components/features/business/ActiveBusinessBanner'
import { FeatureTutorialButton } from '@/components/features/feature-unlock/FeatureTutorialButton'

interface PageProps {
    params: Promise<{ businessId: string }>
}

export default async function SubscriptionPage({ params }: PageProps) {
    const { businessId } = await params

    return (
        <SubscriptionProvider businessId={businessId}>
            <div className="p-4 pt-6 md:p-8 md:pt-8 lg:p-10 w-full mx-auto max-w-[1600px] flex flex-col min-h-full gap-8">
                <SubscriptionHeader />

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <ActiveBusinessBanner scopeLabel="Langganan Bisnis" />
                    <FeatureTutorialButton />
                </div>

                <CurrentPlan />

                <div className="flex-1" />
            </div>
        </SubscriptionProvider>
    )
}
