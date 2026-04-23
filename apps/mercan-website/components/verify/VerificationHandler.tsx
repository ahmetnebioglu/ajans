"use client";

import React, { useEffect, useState, useRef } from "react";
import { verifyRequest } from "../../app/actions/contact-actions";
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface VerificationHandlerProps {
  token: string;
  type: "contact" | "reference";
}

export default function VerificationHandler({ token, type }: VerificationHandlerProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    async function performVerification() {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const result = await verifyRequest(token, type);
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(result.error || "Doğrulama başarısız oldu.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMsg("Beklenmedik bir hata oluştu.");
      }
    }

    performVerification();
  }, [token, type]);

  if (status === "loading") {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-pulse">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">İŞLENİYOR<span className="text-blue-500">...</span></h1>
          <p className="text-slate-400 font-medium italic">Talebiniz doğrulanıyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {status === "success" ? (
        <>
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">BAŞARIYLA <span className="text-blue-500">DOĞRULANDI</span></h1>
            <p className="text-slate-400 font-medium italic">
              Talebiniz sistemimizde doğrulandı. Ekibimiz sizinle en kısa sürede iletişime geçecektir. Teşekkür ederiz.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-600/30">
            <XCircle size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">İŞLEM <span className="text-red-500">BAŞARISIZ</span></h1>
            <p className="text-slate-400 font-medium italic">{errorMsg}</p>
          </div>
        </>
      )}

      <div className="pt-8">
        <Link href="/" className="inline-flex items-center gap-3 bg-blue-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-600/20 w-full justify-center group">
          ANASAYFAYA DÖN <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
