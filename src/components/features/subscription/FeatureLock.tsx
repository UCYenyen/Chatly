"use client";

import type { ReactNode } from "react";
import type { SubscriptionPlan } from "@prisma/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureLockProps {
  locked: boolean;
  requiredPlan: SubscriptionPlan | null;
  featureName: string;
  children: ReactNode;
}

export function FeatureLock({
  locked,
  requiredPlan,
  featureName,
  children,
}: FeatureLockProps) {
  const params = useParams();
  const businessId = (params?.businessId || params?.id) as string;

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={cn("blur-sm pointer-events-none opacity-40")}>
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
          <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-outline">
            <Lock className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-sm font-bold text-on-surface">
              {featureName} Terkunci
            </h3>
            <p className="text-xs text-outline leading-relaxed">
              {featureName} tersedia di paket{" "}
              <span className="font-bold text-secondary">{requiredPlan}</span>
            </p>
          </div>

          <Link href={`/business/${businessId}/langganan`} className="w-full">
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-bold h-9 shadow-md">
              Upgrade Paket
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
