"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Point = {
  x: number;
  y: number;
};

export type GameStatus = "idle" | "drawing" | "finished";

const MIN_POINTS_TO_STOP = 50; // minimum points before we allow axis stop
const PROXIMITY_THRESHOLD = 30; // distance from center to show warning
const AXIS_STOP_THRESHOLD = 0.05; // radians (small angle)
const DIRECTION_SETTLE_POINTS = 10; // points needed to determine direction
const MIN_DISTANCE_THRESHOLD = 4; // pixels between points
const OVERLAP_THRESHOLD = 20; // distance to detect crossing own path
const OVERLAP_SKIP_POINTS = 20; // number of recent points to skip for overlap check

export function useCircleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const pressPositionRef = useRef<Point | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const drawingDirectionRef = useRef<number>(0); // 1 for CW, -1 for CCW, 0 for unknown

  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isTooClose, setIsTooClose] = useState(false);
  const [startAngle, setStartAngle] = useState<number | null>(null);

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
    if (points.length >= 4 && points[0]) {
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

  const startDrawing = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { cx, cy } = getCenter();
      const distFromCenter = Math.hypot(x - cx, y - cy);

      setIsTooClose(distFromCenter < PROXIMITY_THRESHOLD);

      // Rule: User should not be able to draw when too near to the center
      if (distFromCenter < PROXIMITY_THRESHOLD) {
        return;
      }

      if (status === "finished") {
        setPoints([]);
        setScore(null);
        setStatus("idle");
        setStartAngle(null);
        lastAngleRef.current = null;
        drawingDirectionRef.current = 0;
      }

      const angle = Math.atan2(y - cy, x - cx);
      setStartAngle(angle);
      pressPositionRef.current = { x, y };
    },
    [status, getCenter],
  );

  const stopDrawing = useCallback(() => {
    if (status === "drawing") {
      setStatus("finished");
    }
  }, [status]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { cx, cy } = getCenter();
      const distFromCenter = Math.hypot(x - cx, y - cy);

      // Proximity Warning
      setIsTooClose(distFromCenter < PROXIMITY_THRESHOLD);

      if (e.buttons !== 1 || status === "finished") return;

      if (status === "idle") {
        // Re-check proximity before starting
        if (distFromCenter < PROXIMITY_THRESHOLD) return;

        const startPoint = pressPositionRef.current || { x, y };
        setPoints([startPoint, { x, y }]);
        setStatus("drawing");

        const angle = Math.atan2(startPoint.y - cy, startPoint.x - cx);
        if (startAngle === null) {
          setStartAngle(angle);
        }
        lastAngleRef.current = angle;
        return;
      }

      if (status === "drawing") {
        const lastPoint = points[points.length - 1];
        if (lastPoint) {
          const distFromLast = Math.hypot(x - lastPoint.x, y - lastPoint.y);
          if (distFromLast < MIN_DISTANCE_THRESHOLD) return;
        }

        const newPoints = [...points, { x, y }];
        const currentAngle = Math.atan2(y - cy, x - cx);

        if (lastAngleRef.current !== null) {
          // Calculate shortest angle difference to detect direction and backtracking
          let delta = currentAngle - lastAngleRef.current;
          if (delta > Math.PI) delta -= 2 * Math.PI;
          if (delta < -Math.PI) delta += 2 * Math.PI;

          // Determine direction after a few points
          if (
            drawingDirectionRef.current === 0 &&
            points.length > DIRECTION_SETTLE_POINTS
          ) {
            drawingDirectionRef.current = delta > 0 ? 1 : -1;
          }

          // 🛑 Backtracking detection
          if (drawingDirectionRef.current !== 0) {
            const isReversing =
              drawingDirectionRef.current === 1 ? delta < -0.05 : delta > 0.05;
            if (isReversing) {
              setStatus("finished");
              return;
            }
          }
        }

        lastAngleRef.current = currentAngle;

        // 🛑 Overlap detection (crossing own path)
        if (newPoints.length > OVERLAP_SKIP_POINTS) {
          for (let i = 0; i < newPoints.length - OVERLAP_SKIP_POINTS; i++) {
            const p = newPoints[i];
            if (p) {
              const dist = Math.hypot(x - p.x, y - p.y);
              if (dist < OVERLAP_THRESHOLD) {
                setPoints(newPoints);
                setStatus("finished");
                return;
              }
            }
          }
        }

        // Auto-stop logic: Crossing the target axis (startAngle)
        if (newPoints.length > MIN_POINTS_TO_STOP && startAngle !== null) {
          let angleDiff = Math.abs(currentAngle - startAngle);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

          if (angleDiff < AXIS_STOP_THRESHOLD) {
            setPoints(newPoints);
            setStatus("finished");
            return;
          }
        }

        setPoints(newPoints);
        const newScore = calculatePrecision(newPoints);
        if (newScore !== null) setScore(newScore);
      }
    },
    [status, points, getCenter, calculatePrecision, startAngle],
  );

  return {
    canvasRef,
    containerRef,
    score,
    status,
    isTooClose,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  };
}
