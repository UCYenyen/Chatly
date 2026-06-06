"use client"

import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { MonthlyReport } from "@/components/features/analytics/MonthlyReport";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { CustomerTransactionTable } from "@/components/features/business/CustomerTransactionTable";
import { FeatureLockOverlay } from "@/components/features/business/FeatureLockOverlay";
import { useBusinessSubscription, usePlanGate } from "@/hooks";
import { useParams } from "next/navigation";
import { ActiveBusinessBanner } from "@/components/features/business/ActiveBusinessBanner";
import Link from "next/link";
import { Home, CreditCard } from "lucide-react";
export default function TransactionsPage() {
    const { activeBusiness } = useBusinessContext();
    const params = useParams();
    const businessId = params.businessId as string;
    const { isPaid, isLoading } = useBusinessSubscription(businessId);
    const gate = usePlanGate();
    const exportLocked = !gate.hasFeature("dataExport");

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 lg:p-10 w-full mx-auto max-w-[1600px] min-h-full">
             <div className="flex items-center gap-2 mb-4 text-[12px] font-mono text-outline uppercase tracking-widest font-bold">
                <Link href="/dashboard" className="hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                    <Home className="w-3 h-3" /> Utama
                </Link>
                <span>/</span>
                <span className="text-on-surface flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Transaksi
                </span>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-on-surface">
                    Transaksi: <span className="text-secondary-fixed">{activeBusiness?.name || "Memuat..."}</span>
                </h1>
                <p className="text-outline mt-2 text-sm leading-relaxed max-w-2xl">Kelola dan pantau semua pembayaran yang dibuat melalui asisten AI.</p>
            </div>
            <ActiveBusinessBanner scopeLabel="Transaksi" />
            <FeatureLockOverlay
                isLocked={isLoading ? false : !isPaid}
                featureName="Transaksi"
                businessId={businessId}
            >
                <CustomerTransactionTable businessId={businessId} />

                <div className="mt-8 w-full">
                    <FeatureLockOverlay
                        isLocked={exportLocked}
                        featureName="Ekspor Data"
                        businessId={businessId}
                    >
                        <MonthlyReport />
                    </FeatureLockOverlay>
                </div>

                <div className="mt-auto pt-8">
                    <AnalyticsFooter />
                </div>
            </FeatureLockOverlay>
        </div>
    );
}
