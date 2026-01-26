"use client";

import React from "react";
import CanvasSideNav from "./canvas-side-nav";

interface CanvasLayoutProps {
  children: React.ReactNode;
}

export default function CanvasLayout({ children }: CanvasLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full h-full p-4 relative">
      {/* Main Canvas Area - Centered */}
      <div className="flex-1 w-full flex justify-center items-center">
        {children}
      </div>

      {/* Right Side Navigation - Fixed/Sticky or positioned to the side */}
      <div className="flex-none">
        <CanvasSideNav />
      </div>
    </div>
  );
}
