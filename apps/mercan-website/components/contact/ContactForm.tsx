"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { createContactMessage } from "@/app/actions/contact-actions";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
       const result = await createContactMessage(data);
       if (result.success) {
          setStatus("success");
       } else {
          alert("Hata: " + result.error);
          setStatus("idle");
       }
    } catch (error) {
       console.error("Mesaj gönderilemedi:", error);
       setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[1.5rem] text-center space-y-4 animate-in zoom-in-95">
         <div className="w-16 h-16 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/20">
            <CheckCircle2 size={32} />
         </div>
         <h4 className="text-2xl font-black text-emerald-900 uppercase italic">MESAJINIZ İLETİLDİ</h4>
         <p className="text-emerald-700 font-medium italic">En kısa sürede e-posta adresiniz üzerinden dönüş sağlayacağız.</p>
         <button onClick={() => setStatus("idle")} className="text-emerald-600 text-[10px] font-black uppercase tracking-widest pt-4 hover:underline">YENİ MESAJ GÖNDER</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-blue-600/5 border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -skew-x-12 translate-x-12 -translate-y-12" />
      
      <form onSubmit={handleSubmit} className="space-y-8 text-left relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">ADINIZ SOYADINIZ</label>
            <input required name="name" type="text" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="İsminizi girin" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">E-POSTA ADRESİNİZ</label>
            <input required name="email" type="email" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="E-posta adresiniz" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">MESAJ KONUSU</label>
          <input required name="subject" type="text" className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300" placeholder="Hangi konuda yazıyorsunuz?" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block text-center">MESAJINIZ</label>
          <textarea required name="message" rows={5} className="w-full p-5 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300 resize-none" placeholder="Size nasıl yardımcı olabiliriz?"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={status === "loading"}
          className="w-full p-6 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4 group"
        >
          {status === "loading" ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="-rotate-12 group-hover:rotate-0 transition-transform" />}
          MESAJI GÖNDER
        </button>
      </form>
    </div>
  );
}
