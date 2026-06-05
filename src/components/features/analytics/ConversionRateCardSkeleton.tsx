import { Skeleton } from "@/components/ui/skeleton"

export function ConversionRateCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 rounded-xl flex flex-col justify-center h-full shadow-2xl min-h-[220px] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-baseline gap-2 mb-2">
            <Skeleton className="h-3 w-32" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-16 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 bg-surface-container border-t border-l border-outline-variant/20 rounded-tl-xl p-3.5 px-5 flex items-center gap-3 shadow-[-5px_-5px_20px_rgba(0,0,0,0.2)]">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-low border-2 border-outline-variant/30 p-6 rounded-xl relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-outline-variant/50">
              <Skeleton className="h-5 w-5" />
            </div>

            <div className="space-y-4 pr-8">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
