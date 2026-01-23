"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "./lib/utils";
import "./styles.css";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "outline" | "contained" | "text";
}

export const IconButton = ({
  icon: Icon,
  className,
  variant = "contained",
  ...props
}: IconButtonProps) => {
  const baseStyles = "icon-button-base";

  const variants = {
    outline: "outline",
    contained: "contained",
    text: "text",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      <Icon strokeWidth={1.5} size={16} />
    </button>
  );
};
