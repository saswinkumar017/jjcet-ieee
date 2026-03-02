"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Premium Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark hover:shadow-glow hover:-translate-y-0.5 focus:ring-primary",
    secondary: "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:shadow-glow hover:-translate-y-0.5 focus:ring-primary",
    accent: "bg-accent text-foreground hover:shadow-glow-accent hover:-translate-y-0.5 focus:ring-accent",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-primary hover:bg-primary/10 focus:ring-primary",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-1.5-sm gap",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}

// Premium Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export function Card({
  children,
  hover = true,
  glow = false,
  gradient = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-border/50 transition-all duration-300",
        hover && "hover:shadow-medium hover:border-primary/20 hover:-translate-y-1",
        glow && "hover:shadow-glow",
        gradient && "gradient-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Skeleton Loader Component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect" | "card";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circle: "h-12 w-12 rounded-full",
    rect: "h-32 w-full rounded-xl",
    card: "h-64 w-full rounded-xl",
  };

  return <div className={cn("skeleton", variants[variant], className)} />;
}

// Premium Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300",
            icon && "pl-10",
            error && "border-error focus:ring-error/30 focus:border-error",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

// Animated Counter Component
interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function Counter({ end, duration = 2000, suffix = "", prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, isVisible]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Fade In Animation Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export function FadeIn({ children, delay = 0, direction = "up", duration = 300 }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: "translate-y-8",
    down: "translate-y-[-8px]",
    left: "translate-x-[-8px]",
    right: "translate-x-8",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all",
        isVisible ? "opacity-100 translate-none" : `opacity-0 ${transforms[direction]}`
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
}

// Stagger Children Animation
interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
}

export function StaggerChildren({ children, staggerDelay = 100 }: StaggerProps) {
  return (
    <div className="space-y-4">
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * staggerDelay}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

// Premium Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "accent";
  pulse?: boolean;
  className?: string;
}

export function Badge({ children, variant = "default", pulse = false, className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    accent: "bg-accent/20 text-amber-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        variants[variant],
        pulse && "badge-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}

// Premium Divider
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("h-px bg-gradient-to-r from-transparent via-border to-transparent", className)} />
  );
}
