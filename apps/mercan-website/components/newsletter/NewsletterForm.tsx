"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage("Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın.");
      } else {
        setStatus("error");
        setMessage(data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Sunucuya bağlanılamadı.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-500">
        <CheckCircle2 className="text-corporate-green h-12 w-12" />
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-slate-900">Neredeyse Tamam!</h4>
          <p className="text-sm text-slate-500 font-medium italic">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input 
          type="email" 
          placeholder="E-posta adresiniz" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-md pr-12 h-12"
          disabled={status === "loading"}
        />
        <button 
          type="submit"
          disabled={status === "loading"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-corporate-blue hover:scale-110 transition-transform disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">{message}</p>
      )}
      <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
        Kayıt olarak gizlilik politikamızı ve veri işleme şartlarını kabul etmiş olursunuz.
      </p>
    </form>
  );
}
