import { Skeleton } from "@/components/ui/skeleton";

export function DialogHeaderSkeleton() {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 pb-3 sm:pb-4 z-20 sticky top-0 bg-surface-container-low/80 flex flex-col gap-4">
      {/* Title and Description */}
      <div className="flex-1">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Toggle Buttons */}
      <div className="flex items-center gap-2 bg-surface-container-high/50 p-1 rounded-lg w-fit">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
