import type { BooleanFeatureKey } from "@/types/plan-limits.md";

export interface Tutorial {
  id: string;
  feature?: BooleanFeatureKey;
  name: string;
  description: string;
  route: string;
  selector: string;
  guideTitle: string;
  guideBody: string;
}

export interface FeatureGuideStep {
  id: string;
  route: string;
  selector: string;
  title: string;
  body: string;
  canAdvance?: boolean;
  blockedHint?: string;
}
