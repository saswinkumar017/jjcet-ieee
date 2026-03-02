"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines,
}: SkeletonProps) {
  const baseStyles = "animate-shimmer bg-gradient-to-r from-border via-muted/30 to-border bg-[length:200%_100%]";
  
  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  if (lines && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseStyles,
              "rounded h-4",
              i === lines - 1 && "w-3/4"
            )}
            style={{
              width: i === lines - 1 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" lines={2} />
      <div className="flex gap-2">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={100} />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <Skeleton variant="rectangular" height={180} />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" lines={2} />
        <div className="flex justify-between pt-2">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <Skeleton variant="rectangular" height={160} />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" lines={2} />
        <Skeleton variant="text" width={80} />
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 text-center">
      <Skeleton variant="circular" width={120} height={120} className="mx-auto mb-4" />
      <Skeleton variant="text" className="mx-auto w-2/3" />
      <Skeleton variant="text" className="mx-auto w-1/2 mt-1" />
      <div className="flex justify-center gap-2 mt-4">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width={150} />
          <Skeleton variant="text" width={100} />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
      </div>
    </div>
  );
}
