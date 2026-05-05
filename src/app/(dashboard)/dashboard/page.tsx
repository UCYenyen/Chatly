"use client";

import { BusinessSelectorCards } from "@/components/features/dashboard/BusinessSelectorCards";
import { AnalyticsFooter } from "@/components/features/analytics/AnalyticsFooter";

export default function MainDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 md:pt-8 w-full mx-auto max-w-[1600px] min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-on-surface">Selamat Datang di Chatly</h1>
        <p className="text-outline mt-2">Pilih bisnis untuk mulai mengelola asisten AI Anda atau buat bisnis baru.</p>
      </div>

      <div className="flex-1">
        <BusinessSelectorCards />
      </div>

      <div className="mt-auto pt-8">
        <AnalyticsFooter />
      </div>
    </div>
  );
}
