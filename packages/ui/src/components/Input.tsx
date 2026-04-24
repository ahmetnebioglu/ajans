import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all italic",
            error && "border-rose-500 focus:ring-rose-500/5",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest italic">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
