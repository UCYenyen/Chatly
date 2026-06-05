import { Skeleton } from "@/components/ui/skeleton";

export function IgnoreListItemSkeleton() {
  return (
    <li className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2">
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-9 rounded-md" />
    </li>
  );
}

export function ContactItemSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-1.5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
