import { Skeleton } from "@/components/ui/skeleton";

export function BusinessSelectorCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-xl flex flex-col justify-between shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
