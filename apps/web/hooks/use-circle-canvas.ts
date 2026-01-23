"use client";

import { useCallback, useRef, useState } from "react";
import {
  getDistance,
  getAngle,
  getAngleDiff,
  calculatePrecision,
  Point,
} from "../utils/canvas-math";
import {
  MIN_POINTS_TO_STOP,
  PROXIMITY_THRESHOLD,
  MIN_DISTANCE_THRESHOLD,
} from "../utils/canvas-constants";
import { checkBacktracking, checkAxisStop } from "../utils/circle-engine";
import { useCanvasScale } from "./use-canvas-scale";
import { useCanvasRender } from "./use-canvas-render";

export type { Point };
export type GameStatus = "idle" | "drawing" | "finished";
export type CompletionStatus = "incomplete" | "close" | "success" | null;

export function useCircleCanvas() {
  const { canvasRef, containerRef, canvasSize } = useCanvasScale();

  const pressPositionRef = useRef<Point | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const drawingDirectionRef = useRef<number>(0);

  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isTooClose, setIsTooClose] = useState(false);
  const [startAngle, setStartAngle] = useState<number | null>(null);

  const getCenter = useCallback(
    () => ({
      cx: canvasSize.width / 2,
      cy: canvasSize.height / 2,
    }),
    [canvasSize],
  );

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

    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = mutedColor;
    ctx.fill();

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
  }, [getCenter, points, canvasRef, canvasSize.width, canvasSize.height]);

  useCanvasRender(draw, [draw]);

  const startDrawing = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = getCenter();
      const distFromCenter = getDistance(
        { x, y },
        { x: center.cx, y: center.cy },
      );

      setIsTooClose(distFromCenter < PROXIMITY_THRESHOLD);
      if (distFromCenter < PROXIMITY_THRESHOLD) return;

      if (status === "finished") {
        setPoints([]);
        setScore(null);
        setStatus("idle");
        setCompletionStatus(null);
        setStartAngle(null);
        lastAngleRef.current = null;
        drawingDirectionRef.current = 0;
      }

      const angle = getAngle({ x, y }, center);
      setStartAngle(angle);
      pressPositionRef.current = { x, y };
    },
    [status, getCenter],
  );

  const stopDrawing = useCallback(() => {
    if (status !== "drawing") return;
    setStatus("finished");

    if (startAngle !== null && points.length > MIN_POINTS_TO_STOP) {
      const lastPoint = points[points.length - 1];
      if (lastPoint) {
        const startPoint = points[0];
        const center = getCenter();
        const distToStart = startPoint
          ? getDistance(lastPoint, startPoint)
          : Infinity;
        const currentAngle = getAngle(lastPoint, center);
        const angleDiff = getAngleDiff(currentAngle, startAngle);

        if (distToStart < 20 || angleDiff < 0.15) {
          setCompletionStatus("success");
          if (startPoint && distToStart < 55) {
            setPoints((prev) => [...prev, startPoint]);
          }
        } else if (angleDiff < 0.3) {
          setCompletionStatus("close");
        } else {
          setCompletionStatus("incomplete");
        }
      }
    } else {
      setCompletionStatus("incomplete");
    }
  }, [status, startAngle, points, getCenter]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const center = getCenter();
      const currentPoint = { x, y };
      const distFromCenter = getDistance(currentPoint, {
        x: center.cx,
        y: center.cy,
      });

      setIsTooClose(distFromCenter < PROXIMITY_THRESHOLD);

      if (e.buttons !== 1 || status === "finished") return;

      if (status === "idle") {
        if (distFromCenter < PROXIMITY_THRESHOLD) return;
        const startPoint = pressPositionRef.current || currentPoint;
        setPoints([startPoint, currentPoint]);
        setStatus("drawing");
        const angle = getAngle(startPoint, center);
        if (startAngle === null) setStartAngle(angle);
        lastAngleRef.current = angle;
        return;
      }

      if (status === "drawing") {
        const lastPoint = points[points.length - 1];
        if (
          lastPoint &&
          getDistance(currentPoint, lastPoint) < MIN_DISTANCE_THRESHOLD
        )
          return;

        const newPoints = [...points, currentPoint];
        const currentAngle = getAngle(currentPoint, center);

        if (lastAngleRef.current !== null) {
          const { isReversing, delta } = checkBacktracking(
            currentAngle,
            lastAngleRef.current,
            drawingDirectionRef.current,
            points.length,
          );

          if (drawingDirectionRef.current === 0 && points.length > 10) {
            drawingDirectionRef.current = delta > 0 ? 1 : -1;
          }

          const distToStart = points[0]
            ? getDistance(currentPoint, points[0])
            : Infinity;
          if (isReversing && distToStart > 30) {
            setStatus("finished");
            return;
          }
        }

        lastAngleRef.current = currentAngle;

        if (newPoints.length > MIN_POINTS_TO_STOP && startAngle !== null) {
          if (checkAxisStop(currentAngle, startAngle)) {
            const distToStart = newPoints[0]
              ? getDistance(currentPoint, newPoints[0])
              : Infinity;
            if (newPoints[0] && distToStart < 5) newPoints.push(newPoints[0]);
            setPoints(newPoints);
            setStatus("finished");
            setCompletionStatus("success");
            return;
          }
        }

        setPoints(newPoints);
        const newScore = calculatePrecision(newPoints, center);
        if (newScore !== null) setScore(newScore);
      }
    },
    [status, points, getCenter, startAngle],
  );

  return {
    canvasRef,
    containerRef,
    score,
    status,
    completionStatus,
    isTooClose,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  };
}
