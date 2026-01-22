"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "./lib/utils";
import "./styles.css";

interface IconButtonProps {
  icon: LucideIcon;
  className?: string;
  variant?: "outline" | "contained" | "text";
  disabled?: boolean;
  onClick?: () => void;
}

export const IconButton = ({
  icon: Icon,
  className,
  variant = "contained",
  disabled = false,
  onClick,
}: IconButtonProps) => {
  const baseStyles = "icon-button-base";

  const variants = {
    outline: "outline",
    contained: "contained",
    text: "text",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon strokeWidth={1.5} size={16}/>
    </button>
  );
};
