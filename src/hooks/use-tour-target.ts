"use client";

import { useEffect, useRef, useState } from "react";

function rectEquals(a: DOMRect | null, b: DOMRect | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

function findVisibleTarget(selector: string): Element | null {
  const elements = Array.from(document.querySelectorAll(selector));
  const visible = elements.find((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  });
  return visible ?? elements[0] ?? null;
}

export function useTourTarget(
  selector: string | null,
  enabled: boolean,
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const previousRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    let frame = 0;
    const measure = (): void => {
      let next: DOMRect | null = null;
      if (enabled && selector) {
        const element = findVisibleTarget(selector);
        next = element ? element.getBoundingClientRect() : null;
      }
      if (!rectEquals(previousRef.current, next)) {
        previousRef.current = next;
        setRect(next);
      }
      frame = requestAnimationFrame(measure);
    };

    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [selector, enabled]);

  return rect;
}
