import { Skeleton } from "@/components/ui/skeleton";

export function ActiveBusinessBannerSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    </div>
  );
}
