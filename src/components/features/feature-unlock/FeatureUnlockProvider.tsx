"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useFeatureUnlock } from "@/hooks/use-feature-unlock";
import { useTour } from "@/components/features/tour/TourProvider";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { guideStepsFor, getTutorialById } from "@/lib/feature-tutorials";
import { FeatureUnlockDialog } from "./FeatureUnlockDialog";
import { FeatureGuide } from "./FeatureGuide";
import type { FeatureGuideStep, Tutorial } from "@/types/feature-tutorial.md";

interface FeatureUnlockControls {
  openTutorial: (tutorialId?: string) => void;
  hasFeatureTutorials: boolean;
  isTutorialAvailable: (id: string) => boolean;
}

const FeatureUnlockContext = createContext<FeatureUnlockControls | null>(null);

export function useFeatureUnlockControls(): FeatureUnlockControls {
  const ctx = useContext(FeatureUnlockContext);
  if (!ctx) {
    throw new Error(
      "useFeatureUnlockControls must be used within <FeatureUnlockProvider>",
    );
  }
  return ctx;
}

type ManualPhase = "idle" | "dialog" | "guide";

function applyGates(
  steps: FeatureGuideStep[],
  monthlyReportEmail: string,
): FeatureGuideStep[] {
  return steps.map((step) =>
    step.id === "dataExport"
      ? {
          ...step,
          canAdvance: monthlyReportEmail.trim().length > 0,
          blockedHint:
            "Isi email tujuan lalu klik Simpan untuk bisa melanjutkan.",
        }
      : step,
  );
}

export function FeatureUnlockProvider({ children }: { children: ReactNode }) {
  const {
    businessId,
    unlockedTutorials,
    availableTutorials,
    isLoading,
    isTutorialAvailable,
    markDone,
  } = useFeatureUnlock();
  const { isActive, state } = useTour();
  const { activeBusiness } = useBusinessContext();

  const [dismissedSignature, setDismissedSignature] = useState("");
  const [guideSignature, setGuideSignature] = useState("");
  const [manualPhase, setManualPhase] = useState<ManualPhase>("idle");
  const [manualTutorials, setManualTutorials] = useState<Tutorial[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const tourBusy = isActive || state.phase === "congrats";
  const autoSignature = unlockedTutorials
    .map((tutorial) => tutorial.id)
    .sort()
    .join(",");

  const hasUnlocks = Boolean(autoSignature) && Boolean(businessId);
  const autoGuideOpen = hasUnlocks && guideSignature === autoSignature;
  const autoDialogOpen =
    hasUnlocks &&
    !tourBusy &&
    !isLoading &&
    manualPhase === "idle" &&
    dismissedSignature !== autoSignature &&
    !autoGuideOpen;

  const isManual = manualPhase !== "idle";
  const dialogOpen = autoDialogOpen || manualPhase === "dialog";
  const guideActive = autoGuideOpen || manualPhase === "guide";
  const dialogTutorials = isManual ? manualTutorials : unlockedTutorials;
  const guideTutorials =
    manualPhase === "guide" ? manualTutorials : unlockedTutorials;

  const monthlyReportEmail = activeBusiness?.monthlyReportEmail ?? "";
  const steps = businessId
    ? applyGates(guideStepsFor(guideTutorials, businessId), monthlyReportEmail)
    : [];

  const openTutorial = (tutorialId?: string): void => {
    if (tutorialId) {
      const tutorial = getTutorialById(tutorialId);
      if (!tutorial || !isTutorialAvailable(tutorialId)) {
        toast.info("Tutorial fitur ini belum tersedia di paketmu.");
        return;
      }
      setManualTutorials([tutorial]);
      setStepIndex(0);
      setManualPhase("guide");
      return;
    }
    if (availableTutorials.length === 0) {
      toast.info("Belum ada fitur premium pada paketmu untuk ditampilkan.");
      return;
    }
    setManualTutorials(availableTutorials);
    setStepIndex(0);
    setManualPhase("dialog");
  };

  const handleShowGuide = (): void => {
    setStepIndex(0);
    if (isManual) {
      setManualPhase("guide");
    } else {
      setGuideSignature(autoSignature);
    }
  };

  const closeManual = (): void => {
    setManualPhase("idle");
    setManualTutorials([]);
  };

  const handleDismiss = (): void => {
    if (isManual) {
      closeManual();
      return;
    }
    setDismissedSignature(autoSignature);
    void markDone();
  };

  const handleFinishGuide = (): void => {
    if (manualPhase === "guide") {
      closeManual();
      return;
    }
    setDismissedSignature(autoSignature);
    setGuideSignature("");
    void markDone();
  };

  return (
    <FeatureUnlockContext.Provider
      value={{
        openTutorial,
        hasFeatureTutorials: availableTutorials.length > 0,
        isTutorialAvailable,
      }}
    >
      {children}

      <FeatureUnlockDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && dialogOpen) handleDismiss();
        }}
        tutorials={dialogTutorials}
        manual={isManual}
        onShowGuide={handleShowGuide}
        onDismiss={handleDismiss}
      />

      {guideActive && steps.length > 0 ? (
        <FeatureGuide
          steps={steps}
          stepIndex={stepIndex}
          onNext={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
          onPrev={() => setStepIndex((i) => Math.max(i - 1, 0))}
          onFinish={handleFinishGuide}
        />
      ) : null}
    </FeatureUnlockContext.Provider>
  );
}
