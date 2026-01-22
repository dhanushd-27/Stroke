"use client";

import { ReactNode } from "react";
import { cn } from "./lib/utils";
import "./styles.css";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "outline" | "contained" | "text";
  iconOnly?: boolean;
  disabled?: boolean;
}

export const Button = ({
  children,
  className,
  variant = "contained",
  iconOnly = false,
  disabled = false,
}: ButtonProps) => {
  const baseStyles =
    "base-style";

  const variants = {
    outline:
      "outline",
    contained: "contained",
    text: "text-text-primary hover:bg-tuatara-100",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)}>
      {children}
    </button>
  );
};
