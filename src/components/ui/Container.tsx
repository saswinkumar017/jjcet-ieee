"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-8xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  size = "lg",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "default" | "primary" | "secondary" | "accent" | "muted";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const sectionBackgrounds = {
  default: "bg-background",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-foreground",
  muted: "bg-muted/30",
};

const sectionPadding = {
  none: "",
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-20",
  xl: "py-20 md:py-24",
};

export function Section({
  children,
  className,
  background = "default",
  padding = "md",
}: SectionProps) {
  return (
    <section
      className={cn(
        sectionBackgrounds[background],
        sectionPadding[padding],
        className
      )}
    >
      {children}
    </section>
  );
}
