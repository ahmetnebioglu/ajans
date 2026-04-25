"use client";

import React, { useTransition } from "react";
import { Button } from "@ajans/ui";
import { CheckCircle2, XCircle } from "lucide-react";
import { updatePermissionStatus } from "../lib/actions/permission-actions";
import { toast } from "sonner";

interface PermissionActionButtonsProps {
  requestId: string;
}

export function PermissionActionButtons({ requestId }: PermissionActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      try {
        const result = await updatePermissionStatus(requestId, status);
        if (result.success) {
          toast.success(status === "APPROVED" ? "Talep onaylandı." : "Talep reddedildi.");
        } else {
          toast.error("İşlem başarısız.");
        }
      } catch (error) {
        toast.error("Bir hata oluştu.");
        console.error(error);
      }
    });
  };

  return (
    <div className="flex gap-4">
      <Button 
        variant="danger" 
        disabled={isPending}
        onClick={() => handleStatusUpdate("REJECTED")}
        className="w-16 h-16 p-0 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-600 hover:text-white border-none shadow-none transition-all hover:rotate-6 disabled:opacity-50"
      >
        <XCircle size={28} />
      </Button>
      <Button 
        variant="primary" 
        disabled={isPending}
        onClick={() => handleStatusUpdate("APPROVED")}
        className="w-16 h-16 p-0 rounded-[2rem] bg-teal-50 dark:bg-teal-900/20 text-teal-600 hover:bg-teal-600 hover:text-white border-none shadow-none transition-all hover:-rotate-6 shadow-xl shadow-teal-500/10 disabled:opacity-50"
      >
        <CheckCircle2 size={28} />
      </Button>
    </div>
  );
}
