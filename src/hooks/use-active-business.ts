"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { BusinessDTO } from "@/types/business.md";

const STORAGE_KEY = "chatly:activeBusinessId";
const STORAGE_EVENT = "chatly:activeBusinessId:change";

interface UseActiveBusinessResult {
  activeBusinessId: string | null;
  activeBusiness: BusinessDTO | null;
  setActiveBusinessId: (id: string | null) => void;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getStoredId(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function useActiveBusiness(
  businesses: BusinessDTO[],
): UseActiveBusinessResult {
  const storedId = useSyncExternalStore(subscribe, getStoredId, getServerSnapshot);

  const setActiveBusinessId = useCallback((id: string | null): void => {
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const resolvedId =
    storedId && businesses.some((b) => b.id === storedId)
      ? storedId
      : businesses.length > 0
        ? businesses[0].id
        : null;

  const activeBusiness = businesses.find((b) => b.id === resolvedId) ?? null;

  return {
    activeBusinessId: resolvedId,
    activeBusiness,
    setActiveBusinessId,
  };
}
