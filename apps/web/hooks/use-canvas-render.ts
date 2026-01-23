"use client";

import { useEffect, useRef } from "react";

export function useCanvasRender(draw: () => void, deps: any[]) {
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
