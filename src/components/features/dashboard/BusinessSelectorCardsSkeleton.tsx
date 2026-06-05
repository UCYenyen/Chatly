import { Skeleton } from "@/components/ui/skeleton";

export function BusinessSelectorCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-xl flex flex-col justify-between shadow-lg min-h-55"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
