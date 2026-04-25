import React from "react";

/**
 * Mercan ERP CRM Kanban İskelet Yükleme Ekranı.
 * "Premium/Dark" temaya uygun, sharp-corner (rounded-none) ve shimmer efektli.
 */
export function KanbanSkeleton() {
  return (
    <div className="flex flex-col xl:flex-row gap-2.5 h-full w-full overflow-hidden bg-zinc-950">
      {[1, 2, 3, 4].map((col) => (
        <div 
          key={col} 
          className="flex-1 min-w-[280px] max-w-[360px] h-full bg-zinc-900 border border-zinc-800 rounded-[2px] flex flex-col shadow-lg"
        >
          {/* Header Skeleton */}
          <div className="p-2.5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-zinc-800 rounded-[2px]" />
              <div className="h-2 w-16 bg-zinc-800 animate-pulse" />
            </div>
            <div className="h-3 w-6 bg-black border border-zinc-800 rounded-[2px] animate-pulse" />
          </div>

          {/* Cards Container Skeleton */}
          <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
            {[1, 2, 3, 4].map((card) => (
              <div 
                key={card} 
                className="bg-black border border-zinc-800 rounded-[2px] p-2.5 h-24 relative overflow-hidden"
              >
                {/* Accent Line Skeleton */}
                <div className="absolute top-2.5 left-0 w-0.5 h-4 bg-zinc-800" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-2 w-12 bg-zinc-900 animate-pulse" />
                    <div className="h-2 w-8 bg-zinc-900 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 w-32 bg-zinc-800 animate-pulse" />
                    <div className="h-2 w-24 bg-zinc-900 animate-pulse" />
                  </div>
                  <div className="pt-1.5 border-t border-zinc-900/50 flex justify-between">
                    <div className="h-2 w-16 bg-zinc-900 animate-pulse" />
                    <div className="h-2 w-2 bg-zinc-900 animate-pulse" />
                  </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
