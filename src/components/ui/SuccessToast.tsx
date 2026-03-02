"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 right-4 md:right-8 z-50"
        >
          <div className="bg-white rounded-xl shadow-xl border border-green-200 overflow-hidden min-w-[250px]">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DeleteToastProps {
  isVisible: boolean;
  onClose: () => void;
}

export function DeleteSuccessToast({ isVisible, onClose }: DeleteToastProps) {
  return (
    <SuccessToast
      message="Deleted successfully"
      isVisible={isVisible}
      onClose={onClose}
    />
  );
}
