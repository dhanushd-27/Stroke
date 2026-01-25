"use client";

import { useCircleCanvas } from "../../hooks/circle/use-circle-canvas";
import { PrecisionIndicator } from "./precision-indicator";
import { ShareActions } from "../share-actions";
import { DrawingCanvas } from "../canvas/drawing-canvas";
import { Button } from "@repo/ui/button";
import { Shape, useCurrentShapeStore } from "../../stores/currentShape-store";

export default function CircleCanvas() {
  const {
    canvasRef,
    containerRef,
    score,
    status,
    completionStatus,
    isTooClose,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  } = useCircleCanvas();

  const setShape = useCurrentShapeStore((state) => state.setShape);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="h-6 flex items-center justify-center">
        <PrecisionIndicator
          score={score}
          status={status}
          completionStatus={completionStatus}
          isTooClose={isTooClose}
        />
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-[min(80vw,500px)] aspect-square"
      >
        <DrawingCanvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>

      <div className="h-10 flex items-center justify-center">
        {completionStatus === "success" ? (
          <ShareActions />
        ) : (
          (status === "idle" || completionStatus === "incomplete") && (
            <Button variant="text" onClick={() => setShape(Shape.None)}>
              Back
            </Button>
          )
        )}
      </div>
    </div>
  );
}
