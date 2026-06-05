"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FeatureLockOverlayProps {
  isLocked: boolean;
  featureName: string;
  children: React.ReactNode;
  businessId: string;
}

export function FeatureLockOverlay({
  isLocked,
  featureName,
  children,
  businessId,
}: FeatureLockOverlayProps) {
  const router = useRouter();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>

      <div className="absolute inset-0 bg-gradient-to-b from-surface-container/40 via-surface-container/60 to-surface-container/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container border-2 border-outline-variant/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-outline" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
            Fitur {featureName} Terkunci
          </h3>
          <p className="text-[13px] text-outline mb-6 max-w-xs">
            Upgrade ke paket berbayar untuk membuka akses penuh ke fitur ini.
          </p>
        </div>

        <Button
          onClick={() => router.push(`/business/${businessId}/langganan`)}
          className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold px-6"
        >
          Upgrade Paket
        </Button>
      </div>
    </div>
  );
}
