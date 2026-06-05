export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TourAdvance = "next-button" | "target-click" | "route-arrival";

export type TourPhase = "inactive" | "congrats" | "running" | "completed";

export interface TourStep {
  id: string;
  route: string | null;
  targetSelector: string | null;
  title: string;
  body: string;
  placement: TourPlacement;
  advance: TourAdvance;
  requiresBusiness?: boolean;
  allowSkip?: boolean;
}

export interface TourState {
  phase: TourPhase;
  stepIndex: number;
}

export interface OnboardingStatusResponse {
  onboardingCompleted: boolean;
}

export interface UpdateOnboardingRequest {
  onboardingCompleted: boolean;
}
