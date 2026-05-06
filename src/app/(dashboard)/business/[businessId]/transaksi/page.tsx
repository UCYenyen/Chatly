"use client"

import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { CustomerTransactionTable } from "@/components/features/business/CustomerTransactionTable";
import { useParams } from "next/navigation";

export default function TransactionsPage() {
    const { activeBusiness } = useBusinessContext();
    const params = useParams();
    const businessId = params.businessId as string;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 w-full mx-auto max-w-[1600px] min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-headline font-bold text-on-surface">
                    Transaksi: <span className="text-secondary-fixed">{activeBusiness?.name || "Memuat..."}</span>
                </h1>
                <p className="text-outline">Kelola dan pantau semua pembayaran yang dibuat melalui asisten AI.</p>
            </div>

            <CustomerTransactionTable businessId={businessId} />

            <div className="mt-auto pt-8">
                <AnalyticsFooter />
            </div>
        </div>
    );
}
