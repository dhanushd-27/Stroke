import React from 'react';
import { cn } from './lib/utils';
import "./styles.css";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
} & React.ComponentPropsWithoutRef<"a">;

export function AppLink({ href, as: Component = "a", children, className }: LinkProps) {
  return <Component href={href} className={cn("link", className)} target="_blank">{children}</Component>;
}
