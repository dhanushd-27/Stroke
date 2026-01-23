"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Point = {
  x: number;
  y: number;
};

export type GameStatus = "idle" | "drawing" | "finished";

const MIN_POINTS_TO_STOP = 50; // minimum points before we allow auto-stop
const STOP_DISTANCE_THRESHOLD = 20; // pixels from starting point

export function useCircleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const getCenter = useCallback(
    () => ({
      cx: canvasSize.width / 2,
      cy: canvasSize.height / 2,
    }),
    [canvasSize],
  );

  // Sharp rendering helper
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cx, cy } = getCenter();
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const style = getComputedStyle(canvas);
    const mutedColor =
      style.getPropertyValue("--color-text-muted").trim() || "#646464";
    const primaryColor =
      style.getPropertyValue("--color-text-primary").trim() || "#131313";

    // 1. Draw center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = mutedColor;
    ctx.fill();

    // 2. Draw user path
    if (points.length > 0 && points[0]) {
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        if (p) ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }, [canvasSize, getCenter, points]);

  // Animation Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  // Responsive logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });

        const canvas = canvasRef.current;
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const calculatePrecision = useCallback(
    (pts: Point[]) => {
      if (pts.length < 10) return null;

      const { cx, cy } = getCenter();
      const distances = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
      const meanRadius =
        distances.reduce((a, b) => a + b, 0) / distances.length;
      const variance =
        distances.reduce((sum, d) => sum + Math.pow(d - meanRadius, 2), 0) /
        distances.length;
      const stdDev = Math.sqrt(variance);
      const normalized = Math.max(0, 1 - stdDev / meanRadius);
      return Math.round(normalized * 100);
    },
    [getCenter],
  );

  const startDrawing = useCallback(() => {
    if (status === "finished") {
      setPoints([]);
      setScore(null);
      setStatus("idle");
    }
  }, [status]);

  const stopDrawing = useCallback(() => {
    if (status === "drawing") {
      setStatus("finished");
    }
  }, [status]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.buttons !== 1 || status === "finished") return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (status === "idle") {
        // Don't start until they move a bit
        setPoints([{ x, y }]);
        setStatus("drawing");
        return;
      }

      if (status === "drawing") {
        const newPoints = [...points, { x, y }];

        // Auto-stop logic: proximity to starting point
        if (newPoints.length > MIN_POINTS_TO_STOP) {
          const startPoint = newPoints[0];
          if (startPoint) {
            const distFromStart = Math.hypot(
              x - startPoint.x,
              y - startPoint.y,
            );

            // If they are getting back to the start point after some movement
            if (distFromStart < STOP_DISTANCE_THRESHOLD) {
              setPoints(newPoints);
              setStatus("finished");
              return;
            }
          }
        }

        setPoints(newPoints);
        const newScore = calculatePrecision(newPoints);
        if (newScore !== null) setScore(newScore);
      }
    },
    [status, points, calculatePrecision],
  );

  return {
    canvasRef,
    containerRef,
    score,
    status,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  };
}
