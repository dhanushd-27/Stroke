"use client";

import { useCircleCanvas } from "../hooks/use-circle-canvas";
import { PrecisionIndicator } from "./precision-indicator";
import { DrawingCanvas } from "./drawing-canvas";

export default function CircleCanvas() {
  const {
    canvasRef,
    containerRef,
    score,
    status,
    startDrawing,
    stopDrawing,
    handlePointerMove,
  } = useCircleCanvas();

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <PrecisionIndicator score={score} status={status} />

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
    </div>
  );
}
