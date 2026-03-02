"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const badgeVariants = {
  default: "bg-muted/20 text-muted",
  primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className,
  pulse = false,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        badgeVariants[variant],
        badgeSizes[size],
        pulse && "animate-pulse-glow",
        className
      )}
    >
      {children}
    </motion.span>
  );
}
