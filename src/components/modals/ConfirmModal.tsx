"use client";

import { useEffect } from "react";
import { AlertTriangle, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      button: "bg-primary hover:bg-primary-dark",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="p-6 text-center">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", style.icon)}>
            <AlertTriangle className={cn("w-8 h-8", style.iconColor)} />
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-muted dark:text-slate-400">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-border dark:border-slate-600 text-foreground dark:text-white font-medium rounded-xl hover:bg-primary-light dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 px-4 py-3 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2",
              style.button
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
