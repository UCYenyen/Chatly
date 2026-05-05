"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Plus,
    Settings2,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CreateBusinessModal } from "@/components/personal/CreateBusinessModal";
import { DeleteBusinessModal } from "@/components/personal/DeleteBusinessModal";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { cn } from "@/lib/utils";
import type { BusinessDTO } from "@/types/business.md";

export function BusinessSelectorCards() {
    const router = useRouter();
    const {
        businesses,
        activeBusiness,
        setActiveBusinessId,
        isLoading,
    } = useBusinessContext();

    const handleSelect = (business: BusinessDTO): void => {
        setActiveBusinessId(business.id);
        router.push(`/business/${business.id}/ringkasan`);
        toast.success(`Beralih ke ${business.name}`);
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
                                        <button
                                            type="button"
                                            aria-label={`Hapus ${biz.name}`}
                                            className="text-outline hover:text-destructive transition-colors p-1 rounded disabled:opacity-50 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

                <CreateBusinessModal>
                    <button
                        type="button"
                        className="border-2 border-dashed border-outline-variant/30 bg-surface-container/20 hover:bg-surface-container/50 hover:border-secondary-fixed/50 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 min-h-[220px]"
                    >
                        <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4 group-hover:bg-[#bff44c] group-hover:border-[#a4d730] transition-colors shadow-sm">
                            <Plus className="w-6 h-6 text-outline group-hover:text-[#141f00] transition-colors" />
                        </div>
                        <span className="font-bold text-[15px] text-on-surface mb-1 text-center">
                            Tambahkan Bisnis Baru
                        </span>
                        <span className="text-[12px] text-outline text-center max-w-[160px]">
                            Buka instans baru untuk divisi atau merek lain.
                        </span>
                    </button>
                </CreateBusinessModal>
            </div>
        </div>
    );
}
