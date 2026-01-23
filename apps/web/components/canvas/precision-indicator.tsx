"use client";

import { cn } from "@repo/ui/utils";
import { type GameStatus } from "../../hooks/use-circle-canvas";

interface PrecisionIndicatorProps {
  score: number | null;
  status: GameStatus;
  isTooClose?: boolean;
  className?: string;
}

export function PrecisionIndicator({
  score,
  status,
  isTooClose,
  className,
}: PrecisionIndicatorProps) {
  if (isTooClose && status !== "drawing" && status !== "finished") {
    return (
      <div className={cn("text-xs font-medium text-error", className)}>
        You are too close to the center
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className={cn("text-xs font-medium text-text-muted", className)}>
        Try to draw a perfect circle
      </div>
    );
  }

  if (score === null && status === "drawing") return null;

  return (
    <div
      className={cn(
        "text-xs font-medium transition-colors duration-300",
        className,
      )}
    >
      Precision:{" "}
      <span
        className={cn(
          score !== null && score > 85
            ? "text-green-600"
            : score !== null && score > 60
              ? "text-yellow-600"
              : "text-red-600",
        )}
      >
        {score ?? 0}%
      </span>
    </div>
  );
}
