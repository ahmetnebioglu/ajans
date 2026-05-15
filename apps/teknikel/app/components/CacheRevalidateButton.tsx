"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button, message } from "antd";

interface CacheRevalidateButtonProps {
  onRevalidate: () => Promise<{ success: boolean; error?: string }>;
  label?: string;
}

export function CacheRevalidateButton({
  onRevalidate,
  label = "Önbelleği Yenile",
}: CacheRevalidateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleRevalidate = async () => {
    setIsLoading(true);
    try {
      const result = await onRevalidate();
      if (result.success) {
        messageApi.success("Önbellek başarıyla yenilendi.");
        // 1.5 saniye sonra sayfayı yenile
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        messageApi.error(result.error || "Önbellek yenilenirken bir hata oluştu.");
      }
    } catch (error) {
      messageApi.error("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        onClick={handleRevalidate}
        disabled={isLoading}
        variant="outlined"
        color="default"
        size="large"
        title={label}
      >
        <RefreshCw
          size={16}
          className={isLoading ? "animate-spin" : ""}
        />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </>
  );
}
