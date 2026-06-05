import { Skeleton } from "@/components/ui/skeleton";

export function CurrentPlanSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 xl:p-10 rounded-xl flex flex-col gap-8 shadow-2xl relative overflow-hidden h-full">
      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">
            Paket Saat Ini
          </span>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        </div>
        <div className="flex items-end gap-1 flex-col md:flex-row md:items-baseline">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 pt-6 border-t border-outline-variant/10 relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Tanggal Penagihan Berikutnya
          </span>
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Metode Pembayaran
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-14 rounded" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-2 relative z-10">
        <Skeleton className="h-11 w-32 rounded-md" />
        <Skeleton className="h-11 w-32 rounded-md" />
      </div>
    </div>
  );
}
