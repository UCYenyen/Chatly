"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureUnlockControls } from "./FeatureUnlockProvider";

export function FeatureHelpButton({ topic }: { topic: string }) {
  const { openTutorial, isTutorialAvailable } = useFeatureUnlockControls();

  if (!isTutorialAvailable(topic)) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Lihat tutorial fitur ini"
      title="Lihat tutorial fitur ini"
      onClick={() => openTutorial(topic)}
      className="size-7 shrink-0 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high"
    >
      <HelpCircle className="size-4" />
    </Button>
  );
}
