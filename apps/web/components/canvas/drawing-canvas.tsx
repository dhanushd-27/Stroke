"use client";
import { forwardRef } from "react";
import { cn } from "@repo/ui/utils";

interface DrawingCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  className?: string;
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ className, ...props }, ref) => {
    return (
      <canvas
        ref={ref}
        className={cn(
          "touch-none bg-background cursor-crosshair w-full h-full",
          className,
        )}
        {...props}
      />
    );
  },
);

DrawingCanvas.displayName = "DrawingCanvas";
