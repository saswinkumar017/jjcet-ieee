"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "bordered" | "glass";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const cardVariants = {
  default: "bg-surface shadow-sm border border-border",
  elevated: "bg-surface shadow-xl border-0",
  bordered: "bg-transparent border-2 border-border",
  glass: "glass shadow-md border border-border/50",
};

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  variant = "default",
  hover = false,
  padding = "md",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "rounded-2xl transition-all duration-300",
        cardVariants[variant],
        cardPadding[padding],
        hover && "hover:shadow-primary/10 hover:border-primary/30 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  hover?: boolean;
}

export function CardImage({ src, alt, className, hover = false }: CardImageProps) {
  return (
    <div className={cn("overflow-hidden rounded-t-2xl", className)}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        whileHover={hover ? { scale: 1.1, transition: { duration: 0.5 } } : undefined}
      />
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold text-foreground", className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-muted mt-1", className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-border flex items-center gap-3", className)}>
      {children}
    </div>
  );
}
