"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[4px] shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-6 duration-500 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 tracking-tighter uppercase italic leading-none">
                {title}
              </h2>
            )}
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-[4px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
