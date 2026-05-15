"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface CacheRevalidateButtonProps {
  onRevalidate: () => Promise<{ success: boolean; error?: string }>;
  label?: string;
}

export function CacheRevalidateButton({
  onRevalidate,
  label = "Önbelleği Yenile",
}: CacheRevalidateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRevalidate = async () => {
    setIsLoading(true);
    setShowMessage(null);
    try {
      const result = await onRevalidate();
      if (result.success) {
        setShowMessage({ type: "success", text: "Önbellek başarıyla yenilendi." });
        // 2 saniye sonra sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setShowMessage({ type: "error", text: result.error || "Önbellek yenilenirken bir hata oluştu." });
      }
    } catch (error) {
      setShowMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRevalidate}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={label}
      >
        <RefreshCw
          size={16}
          className={isLoading ? "animate-spin" : ""}
        />
        <span className="text-sm font-medium">{label}</span>
      </button>
      {showMessage && (
        <span className={`text-sm ${showMessage.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {showMessage.text}
        </span>
      )}
    </div>
  );
}
