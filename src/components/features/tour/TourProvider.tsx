"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { TourState, TourStep } from "@/types/tour.md";
import { TOUR_STEPS } from "./tour-steps";
import { CongratulationsDialog } from "./CongratulationsDialog";
import { TourSpotlight } from "./TourSpotlight";
import { TourStepCard } from "./TourStepCard";

const STORAGE_KEY = "chatly:tour";
const STORAGE_EVENT = "chatly:tour:change";
const DEFAULT_STATE: TourState = { phase: "inactive", stepIndex: 0 };

let cachedString: string | null = null;
let cachedState: TourState = DEFAULT_STATE;

function readState(): TourState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedString) return cachedState;
  cachedString = raw;
  if (!raw) {
    cachedState = DEFAULT_STATE;
    return cachedState;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<TourState>;
    cachedState = {
      phase: parsed.phase ?? "inactive",
      stepIndex: typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0,
    };
  } catch {
    cachedState = DEFAULT_STATE;
  }
  return cachedState;
}

function writeState(next: TourState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getServerSnapshot(): TourState {
  return DEFAULT_STATE;
}

function markOnboardingComplete(): void {
  void fetch("/api/me/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ onboardingCompleted: true }),
  });
}

interface TourContextValue {
  state: TourState;
  steps: TourStep[];
  currentStep: TourStep | null;
  isActive: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  goCongrats: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const state = useSyncExternalStore(subscribe, readState, getServerSnapshot);
  const steps = TOUR_STEPS;

  const currentStep =
    state.phase === "running" ? (steps[state.stepIndex] ?? null) : null;

  function start(): void {
    writeState({ phase: "running", stepIndex: 0 });
    router.push("/");
  }

  function goCongrats(): void {
    writeState({ phase: "congrats", stepIndex: 0 });
  }

  function finish(): void {
    markOnboardingComplete();
    writeState({ phase: "completed", stepIndex: 0 });
  }

  function skip(): void {
    markOnboardingComplete();
    writeState(DEFAULT_STATE);
  }

  function next(): void {
    const index = readState().stepIndex;
    if (index >= steps.length - 1) {
      finish();
      return;
    }
    writeState({ phase: "running", stepIndex: index + 1 });
  }

  function prev(): void {
    const index = readState().stepIndex;
    writeState({ phase: "running", stepIndex: Math.max(0, index - 1) });
  }

  const value: TourContextValue = {
    state,
    steps,
    currentStep,
    isActive: state.phase === "running",
    start,
    next,
    prev,
    skip,
    finish,
    goCongrats,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <CongratulationsDialog />
      <TourSpotlight />
      <TourStepCard />
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within <TourProvider>");
  }
  return ctx;
}
