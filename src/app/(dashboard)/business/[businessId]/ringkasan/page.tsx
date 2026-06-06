"use client"

import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { WhatsappAuthContainer } from "@/components/features/dashboard/WhatsappAuthContainer";
import { BusinessHours } from "@/components/features/training/BusinessHours";
import { NotificationAdminsCard } from "@/components/features/notifications/NotificationAdminsCard";
import { FeatureLockOverlay } from "@/components/features/business/FeatureLockOverlay";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useBusinessSubscription } from "@/hooks";
import { useParams } from "next/navigation";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";
import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";
export default function BusinessDashboardPage() {
    const { activeBusiness } = useBusinessContext();
    const params = useParams();
    const businessId = params.businessId as string;
    const { isPaid, isLoading } = useBusinessSubscription(businessId);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 lg:p-10 w-full mx-auto max-w-[1600px] min-h-full">
            <div className="flex items-center gap-2 mb-4 text-[12px] font-mono text-outline uppercase tracking-widest font-bold">
                <Link href="/dashboard" className="hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                    <Home className="w-3 h-3" /> Utama
                </Link>
                <span>/</span>
                <span className="text-on-surface flex items-center gap-1.5">
                    <LayoutDashboard className="w-3 h-3" /> Ringkasan
                </span>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-on-surface">
                    Dasbor: <span className="text-secondary-fixed">{activeBusiness?.name || "Memuat..."}</span>
                </h1>
                <p className="text-outline mt-2 text-sm leading-relaxed max-w-2xl">Kelola koneksi WhatsApp dan pantau aktivitas asisten AI Anda.</p>
            </div>
            <ActiveBusinessBanner scopeLabel="Ringkasan" />

            <FeatureLockOverlay
                isLocked={isLoading ? false : !isPaid}
                featureName="Dasbor"
                businessId={businessId}
            >
                {activeBusiness && (
                    <div className="flex flex-col gap-8">
                        <div data-tour="whatsapp-setup">
                            <WhatsappAuthContainer businessId={activeBusiness.id} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <BusinessHours />
                            <NotificationAdminsCard />
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-8">
                    <AnalyticsFooter />
                </div>
            </FeatureLockOverlay>
        </div>
    );
}
