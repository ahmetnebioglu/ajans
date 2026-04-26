"use client";

import React, { useState } from "react";
import { submitApplication } from "./actions";
import { Loader2, CheckCircle2, User, Mail, Phone, Briefcase, Link as LinkIcon, Send } from "lucide-react";

interface Job {
  id: string;
  title: string;
}

export default function CareerForm({ jobs }: { jobs: Job[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitApplication(formData);

    if (result.success) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(result.error || "Bir hata oluştu.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-12 text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-emerald-900 tracking-tight uppercase italic">Başvurunuz Alındı!</h2>
          <p className="text-emerald-700 font-medium">Başvurunuz başarıyla sisteme kaydedilmiştir. HR ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
        </div>
        <button 
          onClick={() => setSuccess(false)}
          className="text-emerald-600 font-black uppercase tracking-widest text-sm hover:underline"
        >
          Yeni Başvuru Yap
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FIRST NAME */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Adınız</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              name="firstName"
              type="text" 
              placeholder="Ahmet"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* LAST NAME */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Soyadınız</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              name="lastName"
              type="text" 
              placeholder="Yılmaz"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">E-Posta</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              name="email"
              type="email" 
              placeholder="ahmet@example.com"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* PHONE */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Telefon</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              name="phone"
              type="tel" 
              placeholder="05XX XXX XX XX"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* POSITION SELECT */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Başvurulan Pozisyon</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              required
              name="appliedForId"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all appearance-none cursor-pointer"
            >
              <option value="">Pozisyon Seçiniz...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CV FILE UPLOAD */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">CV Dosyası (Sadece PDF)</label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              name="cvFile"
              type="file" 
              accept=".pdf"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>
          <p className="text-[9px] text-slate-500 font-bold ml-1 italic">Maksimum dosya boyutu: 5MB. Sadece PDF formatı kabul edilmektedir.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-black uppercase tracking-widest text-center animate-shake">
          {error}
        </div>
      )}

      <button 
        disabled={loading}
        type="submit"
        className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10 group"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            BAŞVURUYU TAMAMLA
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </>
        )}
      </button>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
          KVKK KAPSAMINDA PAYLAŞTIĞINIZ VERİLER, SADECE İŞE ALIM SÜREÇLERİNİ YÜRÜTMEK AMACIYLA GÜVENLE İŞLENECEK VE 3. TARAFLARLA PAYLAŞILMAYACAKTIR.
        </p>
      </div>
    </form>
  );
}
