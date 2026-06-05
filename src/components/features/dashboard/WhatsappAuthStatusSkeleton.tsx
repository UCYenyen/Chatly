import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WhatsappAuthStatusSkeleton() {
  return (
    <Card className="bg-surface-container border-outline-variant/20">
      <CardContent className="flex items-start gap-3 p-4">
        <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded-md" />
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}
