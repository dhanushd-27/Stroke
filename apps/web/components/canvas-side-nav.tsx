"use client";

import React from "react";
import { Button } from "@repo/ui/button";
import { Shape, useCurrentShapeStore } from "../stores/currentShape-store";

export default function CanvasSideNav() {
  const { shape, setShape } = useCurrentShapeStore();

  return (
    <div className="flex flex-row md:flex-col gap-4 min-w-37.5 items-center md:items-start justify-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl">
      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 hidden md:block">
        Shapes
      </h4>

      <Button
        variant={shape === Shape.Circle ? "contained" : "text"}
        className="w-full justify-start"
        onClick={() => setShape(Shape.Circle)}
      >
        Circle
      </Button>

      <Button
        variant={shape === Shape.Triangle ? "contained" : "text"}
        className="w-full justify-start"
        onClick={() => setShape(Shape.Triangle)}
      >
        Triangle
      </Button>

      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-2 hidden md:block" />

      <Button
        variant="text"
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        onClick={() => setShape(Shape.None)}
      >
        Go Back
      </Button>
    </div>
  );
}
