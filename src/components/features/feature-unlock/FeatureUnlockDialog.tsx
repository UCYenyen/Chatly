"use client";

import {
  BarChart2,
  BellRing,
  FileSpreadsheet,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BooleanFeatureKey } from "@/types/plan-limits.md";
import type { FeatureTutorial } from "@/types/feature-tutorial.md";

const FEATURE_ICON: Record<BooleanFeatureKey, LucideIcon> = {
  customPersonality: Sparkles,
  dataExport: FileSpreadsheet,
  advancedAnalytics: BarChart2,
  adminNotification: BellRing,
  slaSupport: Sparkles,
};

interface FeatureUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorials: FeatureTutorial[];
  manual?: boolean;
  onShowGuide: () => void;
  onDismiss: () => void;
}

export function FeatureUnlockDialog({
  open,
  onOpenChange,
  tutorials,
  manual = false,
  onShowGuide,
  onDismiss,
}: FeatureUnlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {manual ? "Tutorial fitur paketmu" : "🎉 Fitur baru terbuka!"}
          </DialogTitle>
          <DialogDescription>
            {manual
              ? `Paketmu punya ${tutorials.length} fitur. Mau lihat cara pakainya?`
              : `Paket barumu membuka ${tutorials.length} fitur. Mau lihat cara pakainya?`}
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3 py-2">
          {tutorials.map((tutorial) => {
            const Icon = FEATURE_ICON[tutorial.feature];
            return (
              <li key={tutorial.feature} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed/15 text-secondary-fixed">
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">
                    {tutorial.name}
                  </span>
                  <span className="text-[12px] text-outline leading-snug">
                    {tutorial.description}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onDismiss}>
            Nanti saja
          </Button>
          <Button type="button" onClick={onShowGuide}>
            Tunjukkan caranya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
