"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureUnlockControls } from "./FeatureUnlockProvider";

export function FeatureTutorialButton() {
  const { openTutorial, hasFeatureTutorials } = useFeatureUnlockControls();

  if (!hasFeatureTutorials) return null;

  return (
    <Button type="button" variant="outline" onClick={() => openTutorial()}>
      <GraduationCap className="size-4" />
      Lihat tutorial fitur
    </Button>
  );
}
