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
            "w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[4px] text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600/50 transition-all placeholder:text-zinc-400 placeholder:italic",
            error && "border-rose-500 focus:ring-rose-500/10",
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
