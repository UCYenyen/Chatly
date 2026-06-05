import { Skeleton } from "@/components/ui/skeleton"

export function PerformanceFunnelSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 rounded-xl shadow-2xl min-h-[220px]">
      <div className="flex items-baseline gap-2 mb-2">
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-6 w-72 mb-8" />

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-56" />
          </div>
        ))}
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}
