"use client";

import React, { useTransition, useRef, useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitContactForm } from "@ajans/core";
import { toast } from "sonner";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: "",
      message: `[Konu: ${formData.get("subject")}] ${formData.get("message") as string}`,
    };

    startTransition(async () => {
      try {
        const result = await submitContactForm(data, 'MERCAN_WEBSITE', 'mercan');
        
        if (result.success) {
          setIsSuccess(true);
          formRef.current?.reset();
          // 5 saniye sonra başarı mesajını kapat
          setTimeout(() => setIsSuccess(false), 8000);
        } else {
          console.error("Form gönderim hatası detayı:", result.error);
          toast.error("Hata: " + result.error);
        }
      } catch (error) {
        console.error("Mesaj gönderilemedi:", error);
        toast.error("Bir ağ hatası oluştu. Lütfen tekrar deneyin.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="bg-[#0F172A] p-12 rounded-[2px] border-l-8 border-blue-600 shadow-2xl animate-in zoom-in-95 duration-500 italic">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-[2px] flex items-center justify-center shadow-lg shadow-blue-600/40 shrink-0 rotate-3">
             <CheckCircle2 className="text-white" size={32} />
          </div>
          <div className="space-y-2">
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">BAŞARIYLA ALINDI</h3>
             <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] leading-relaxed">
               Mesajınız merkez sistemimize iletildi. Uzman ekibimiz en kısa sürede dönüş yapacaktır.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2px] shadow-[30px_30px_60px_rgba(15,23,42,0.1)] border-2 border-slate-950 relative overflow-hidden italic">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950 opacity-[0.03] -skew-x-12 translate-x-12 -translate-y-12" />
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 text-left relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 block">ADINIZ SOYADINIZ</label>
            <input required name="name" type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2px] text-sm font-bold outline-none focus:border-slate-950 transition-all placeholder:text-slate-300 italic" placeholder="İSİM GİRİNİZ" />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 block">E-POSTA ADRESİNİZ</label>
            <input required name="email" type="email" className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2px] text-sm font-bold outline-none focus:border-slate-950 transition-all placeholder:text-slate-300 italic" placeholder="E-POSTA GİRİNİZ" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 block">MESAJ KONUSU</label>
          <input required name="subject" type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2px] text-sm font-bold outline-none focus:border-slate-950 transition-all placeholder:text-slate-300 italic" placeholder="KONU BAŞLIĞI" />
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 block">MESAJINIZ</label>
          <textarea required name="message" rows={5} className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2px] text-sm font-bold outline-none focus:border-slate-950 transition-all placeholder:text-slate-300 resize-none italic" placeholder="DETAYLI MESAJINIZ"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full p-6 bg-slate-950 text-white rounded-[2px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4 group"
        >
          {isPending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="-rotate-12 group-hover:rotate-0 transition-transform" />}
          MESAJI GÖNDER
        </button>
      </form>
    </div>
  );
}
