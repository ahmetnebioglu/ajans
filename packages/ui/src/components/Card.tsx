import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden", className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-8 border-b border-slate-100 dark:border-slate-800", className)}>
    {children}
  </div>
);

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-8", className)}>
    {children}
  </div>
);
