import React from "react";
import { verifyRequest } from "../actions/contact-actions";
import { CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; type?: string };
}) {
  const token = searchParams.token;
  const type = searchParams.type as "contact" | "reference";

  if (!token || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-8">
        <div className="text-center space-y-4">
           <XCircle size={64} className="text-red-500 mx-auto" />
           <h1 className="text-2xl font-black text-white uppercase italic">GEÇERSİZ BAĞLANTI</h1>
           <p className="text-slate-400">Doğrulama linki hatalı veya süresi dolmuş.</p>
        </div>
      </div>
    );
  }

  const result = await verifyRequest(token, type);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden p-8">
      {/* Hero Style Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-[-15%] w-[60%] h-full bg-blue-500/[0.1] skew-x-[-20deg] origin-top border-l border-white/[0.05]" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
         <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] text-center space-y-8 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5 mb-4">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;SİSTEM DOĞRULAMA&gt;
              </span>
            </div>

            {result.success ? (
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
                  <p className="text-slate-400 font-medium italic">{result.error}</p>
                </div>
              </>
            )}

            <div className="pt-8">
              <Link href="/" className="inline-flex items-center gap-3 bg-blue-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-600/20 w-full justify-center group">
                ANASAYFAYA DÖN <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
