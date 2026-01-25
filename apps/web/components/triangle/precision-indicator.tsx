"use client";

import { cn } from "@repo/ui/utils";
import {
  type CompletionStatus,
  type GameStatus,
} from "../../hooks/triangle/use-triangle-canvas";

interface PrecisionIndicatorProps {
  score: number | null;
  status: GameStatus;
  completionStatus?: CompletionStatus;
  className?: string;
}

export function PrecisionIndicator({
  score,
  status,
  completionStatus,
  className,
}: PrecisionIndicatorProps) {
  if (status === "idle") {
    return (
      <div className={cn("text-xs font-medium text-text-primary", className)}>
        Connect the dots to draw a triangle
      </div>
    );
  }

  if (status === "finished") {
    if (completionStatus === "incomplete") {
      return (
        <div className={cn("text-xs font-medium text-text-muted", className)}>
          Incomplete, Try Again!
        </div>
      );
    }
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
