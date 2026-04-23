"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

import { createReferenceRequest } from "@/app/actions/reference-actions";

export default function ReferenceRequestForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      sector: formData.get("sector") as string,
    };

    try {
       const result = await createReferenceRequest(data);
       if (result.success) {
          setStatus("success");
       } else {
          alert("Bir hata oluştu: " + result.error);
          setStatus("idle");
       }
    } catch (error) {
       console.error("Talep gönderilemedi:", error);
       setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[1.5rem] text-center space-y-4 animate-in zoom-in-95">
         <div className="w-16 h-16 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/20">
            <CheckCircle2 size={32} />
         </div>
         <h4 className="text-2xl font-black text-emerald-900 uppercase italic">TALEBİNİZ ALINDI</h4>
         <p className="text-emerald-700 font-medium italic">En kısa sürede referans listemiz e-posta adresinize gönderilecektir.</p>
         <button onClick={() => setStatus("idle")} className="text-emerald-600 text-[10px] font-black uppercase tracking-widest pt-4 hover:underline">YENİ TALEP OLUŞTUR</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl shadow-blue-600/5 border border-slate-100 relative">
      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">AD SOYAD</label>
            <input required name="fullName" type="text" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="İsminizi girin" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">FİRMA ADI</label>
            <input required name="companyName" type="text" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="Şirket ismini girin" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">E-POSTA</label>
            <input required name="email" type="email" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="E-posta adresiniz" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">İLGİLENİLEN SEKTÖR</label>
            <input required name="sector" type="text" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="Örn: İnşaat" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === "loading"}
          className="w-full p-6 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4"
        >
          {status === "loading" ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="-rotate-12" />}
          LİSTEYİ ŞİMDİ TALEP EDİN
        </button>
      </form>
    </div>
  );
}
