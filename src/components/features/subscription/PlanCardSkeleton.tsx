import { Skeleton } from "@/components/ui/skeleton";

export function PlanCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 sm:p-5 md:p-6 shadow-lg">
      {/* Header Section */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Price Section */}
      <div className="flex items-baseline gap-1">
        <Skeleton className="h-12 w-32" />
      </div>

      {/* Features List */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 shrink-0 mt-0.5" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Button */}
      <Skeleton className="h-9 sm:h-10 md:h-11 w-full rounded-md mt-auto" />
    </div>
  );
}
