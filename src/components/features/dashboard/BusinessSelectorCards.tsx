"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ArrowRight,
    Lock,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreateBusinessModal } from "@/components/personal/CreateBusinessModal";
import { DeleteBusinessModal } from "@/components/personal/DeleteBusinessModal";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { cn } from "@/lib/utils";
import type { BusinessDTO } from "@/types/business.md";
import type { SubscriptionPlan } from "@prisma/client";

export function BusinessSelectorCards() {
    const router = useRouter();
    const {
        businesses,
        activeBusiness,
        setActiveBusinessId,
        isLoading,
    } = useBusinessContext();
    const [hasPaidSubscription, setHasPaidSubscription] = useState<boolean>(false);
    const [checkingSubscription, setCheckingSubscription] = useState<boolean>(true);

    useEffect(() => {
        const checkSubscriptions = async (): Promise<void> => {
            setCheckingSubscription(true);
            try {
                const paidSubscriptions = await Promise.all(
                    businesses.map(async (biz) => {
                        try {
                            const res = await fetch(`/api/businesses/${biz.id}/subscription`, {
                                method: "GET",
                                cache: "no-store",
                            });
                            if (!res.ok) return false;
                            const data = await res.json() as { subscription: { plan: SubscriptionPlan } | null };
                            const plan = data.subscription?.plan;
                            return plan && plan !== "FREE";
                        } catch {
                            return false;
                        }
                    })
                );
                setHasPaidSubscription(paidSubscriptions.some((hasPaid) => hasPaid));
            } catch {
                setHasPaidSubscription(false);
            } finally {
                setCheckingSubscription(false);
            }
        };

        if (businesses.length > 0) {
            void checkSubscriptions();
        } else {
            setCheckingSubscription(false);
        }
    }, [businesses]);

    const handleSelect = (business: BusinessDTO): void => {
        setActiveBusinessId(business.id);
        router.push(`/business/${business.id}/ringkasan`);
        toast.success(`Beralih ke ${business.name}`);
    };

    const handleAddBusinessClick = (): void => {
        if (!hasPaidSubscription) {
            toast.error("Anda harus berlangganan untuk membuat bisnis baru", {
                description: "Upgrade ke paket berbayar untuk membuka fitur ini",
            });
            router.push("/billing");
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-headline font-bold text-on-surface">
                    Organisasi Bisnis Anda
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {isLoading && businesses.length === 0 && (
                    <div className="col-span-full text-[13px] text-outline">Memuat bisnis...</div>
                )}

                {businesses.map((biz) => {
                    const isActive = activeBusiness?.id === biz.id;
                    return (
                        <div
                            key={biz.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelect(biz)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelect(biz);
                                }
                            }}
                            className={cn(
                                "text-left bg-surface-container-low border p-6 rounded-xl flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:border-outline shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed",
                                isActive
                                    ? "border-secondary-fixed/50 shadow-[0_0_20px_rgba(164,215,48,0.15)]"
                                    : "border-outline-variant/15",
                            )}
                        >
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="font-bold text-[16px] text-on-surface tracking-wide group-hover:text-secondary-fixed transition-colors line-clamp-1">
                                        {biz.name}
                                    </h3>
                                    {biz.description && (
                                        <p className="text-[12px] text-outline mt-2 line-clamp-2 leading-relaxed">
                                            {biz.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DeleteBusinessModal business={biz}>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus ${biz.name}`}
                                            className="text-outline hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </DeleteBusinessModal>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowRight className="w-4 h-4 text-on-surface" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {hasPaidSubscription ? (
                    <CreateBusinessModal>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-2 border-dashed border-outline-variant/30 bg-surface-container/20 hover:bg-surface-container/50 hover:border-secondary-fixed/50 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 min-h-55 w-full"
                        >
                            <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4 group-hover:bg-secondary-fixed group-hover:border-secondary-fixed transition-colors shadow-sm">
                                <Plus className="w-6 h-6 text-outline group-hover:text-on-secondary-fixed transition-colors" />
                            </div>
                            <span className="font-bold text-[15px] text-on-surface mb-2 text-center line-clamp-2 px-2 leading-snug">
                                Tambahkan Bisnis Baru
                            </span>
                            <span className="text-[12px] text-outline text-center px-3 line-clamp-3 leading-relaxed">
                                Buka instans baru untuk divisi atau merek lain.
                            </span>
                        </Button>
                    </CreateBusinessModal>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddBusinessClick}
                        disabled={checkingSubscription}
                        className="border-2 border-dashed border-outline-variant/30 bg-surface-container/20 p-6 rounded-xl flex flex-col items-center justify-center cursor-not-allowed group transition-all duration-300 min-h-55 w-full opacity-60 disabled:opacity-60"
                    >
                        <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-outline" />
                        </div>
                        <span className="font-bold text-[15px] text-on-surface mb-2 text-center line-clamp-2 px-2 leading-snug">
                            Upgrade Diperlukan
                        </span>
                        <span className="text-[12px] text-outline text-center px-3 line-clamp-2 leading-relaxed">
                            Upgrade ke paket berbayar
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}
