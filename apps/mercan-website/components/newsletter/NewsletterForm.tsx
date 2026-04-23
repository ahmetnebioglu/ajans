"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeToNewsletter } from "../../app/actions/newsletter-actions";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus("idle");
    
    const res = await subscribeToNewsletter(email, "mercan");
    
    if (res.success) {
      setStatus("success");
      setMessage(res.message || "Başarıyla kayıt oldunuz!");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(res.error || "Bir hata oluştu.");
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz..."
          disabled={loading || status === "success"}
          className="w-full h-14 pl-6 pr-32 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-corporate-blue/5 dark:focus:ring-blue-500/10 transition-all placeholder:text-slate-400 disabled:opacity-50 italic"
          required
        />
        <button
          type="submit"
          disabled={loading || status === "success"}
          className="absolute right-2 top-2 h-10 px-6 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-corporate-blue dark:hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : status === "success" ? (
            <CheckCircle2 size={14} />
          ) : (
            <>
              KAYDOL <Send size={14} />
            </>
          )}
        </button>
      </form>

      {/* Mesaj Bildirimi */}
      {status !== "idle" && (
        <div 
          className={`mt-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            status === "success" 
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {status === "success" ? <CheckCircle2 className="shrink-0 mt-0.5" size={16} /> : <AlertCircle className="shrink-0 mt-0.5" size={16} />}
          <p className="text-[11px] font-bold uppercase tracking-tight italic leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
