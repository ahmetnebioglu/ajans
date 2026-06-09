"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Loader2,
  Camera,
  Layers,
  AlertCircle
} from "lucide-react";
import { uploadReportAction } from "../actions/drive-actions";

type Step = 1 | 2 | 3;

export default function ReportWizard() {
  const [step, setStep] = useState<Step>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Rutin Kontrol",
    notes: "",
    file: null as File | null,
  });
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.file) return;
    
    setIsUploading(true);
    setResult(null);
    
    try {
      // Daha önce hazırladığımız action'ı kullanıyoruz
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.file!);
        // Eski sayfada test için varsayılan "Mercan Grup" ID'sini kullanıyoruz
        const res = await uploadReportAction(formDataToSend, "mercan-grup-id"); 
        
        if (res.success) {
          setStep(3);
          setResult({ success: true, message: "Rapor başarıyla sisteme yüklendi ve arşivlendi." });
        } else {
          setResult({ success: false, message: res.error || "Yükleme sırasında hata oluştu." });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(formData.file);
      
    } catch (error) {
      setIsUploading(false);
      setResult({ success: false, message: "Kritik bir hata oluştu." });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden min-h-[480px] flex flex-col italic">
      {/* Progress Header */}
      <div className="relative h-1.5 bg-gray-100 dark:bg-zinc-800 w-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Step Indicator */}
        <div className="flex justify-between mb-6 items-center px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-9 h-9 rounded-[2px] flex items-center justify-center transition-all duration-300 font-black text-xs
                ${step === s ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200 dark:shadow-blue-900/20" : 
                  step > s ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}
              `}>
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s < 3 && <div className={`w-10 h-[1px] mx-1.5 ${step > s ? "bg-emerald-500" : "bg-gray-100 dark:bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Rapor Künyesi</h2>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic">İşlem yapılan proje ve kategori bilgilerini girin.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-400 italic">Rapor Başlığı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Kat 3 Elektrik Tesisatı Kontrolü"
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-[2px] text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:italic placeholder:text-gray-400"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-400 italic">Kategori</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Rutin Kontrol", "Arıza / Tamir", "Montaj", "Hakediş"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`p-2.5 rounded-[2px] border text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.category === cat 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-blue-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Medya & Belgeler</h2>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic">İşlemle ilgili fotoğraf veya dökümanı yükleyin.</p>
              </div>

              <div 
                className={`
                  relative border-2 border-dashed rounded-[2px] p-8 text-center transition-all
                  ${formData.file ? "border-emerald-500 bg-emerald-50/10" : "border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:border-blue-400"}
                `}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-[2px] flex items-center justify-center ${formData.file ? "bg-emerald-500" : "bg-zinc-900"} text-white shadow-xl`}>
                    {formData.file ? <CheckCircle2 size={32} /> : <Camera size={32} />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                      {formData.file ? formData.file.name : "Tıklayın veya Sürükleyin"}
                    </h3>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.2em] font-black">Maksimum 10MB - PDF, PNG, JPG</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-400 italic">Ek Notlar (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-[2px] text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:italic placeholder:text-gray-400"
                  placeholder="Sahadaki özel durumlar varsa buraya ekleyin..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500 py-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <Loader2 size={64} className="text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Layers size={24} className="text-blue-200" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Yükleniyor...</h2>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic">Raporunuz Google Drive'a arşivleniyor.</p>
                  </div>
                </div>
              ) : result?.success ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-500 rounded-[2px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 animate-bounce">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase">MÜKEMMEL!</h2>
                    <p className="text-[12px] text-gray-600 dark:text-zinc-400 font-medium italic max-w-xs mx-auto">Saha raporu başarıyla sisteme aktarıldı. Diğer ekip üyeleri artık bu rapora erişebilir.</p>
                  </div>
                  <button 
                    onClick={() => { setStep(1); setFormData({ title: "", category: "Rutin Kontrol", notes: "", file: null }); setResult(null); }}
                    className="mt-2 px-6 py-2.5 bg-zinc-900 dark:bg-blue-600 text-white rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-900/20"
                  >
                    YENİ RAPOR OLUŞTUR
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-rose-500 rounded-[2px] flex items-center justify-center mx-auto shadow-2xl shadow-rose-200 dark:shadow-rose-900/20">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">HATA OLUŞTU!</h2>
                  <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">{result?.message}</p>
                  <button 
                    onClick={() => setStep(2)}
                    className="mt-2 px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    TEKRAR DENE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {step < 3 && !isUploading && (
          <div className="flex justify-between items-center mt-6 gap-3 border-t border-gray-100 dark:border-zinc-800 pt-4">
            <button 
              onClick={() => step > 1 && setStep((s) => s - 1 as Step)}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all ${step === 1 ? "opacity-0 invisible" : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50"}`}
            >
              <ChevronLeft size={16} /> GERİ
            </button>

            <button 
              onClick={() => {
                if (step === 1 && formData.title) setStep(2);
                else if (step === 2 && formData.file) handleSubmit();
              }}
              disabled={(step === 1 && !formData.title) || (step === 2 && !formData.file)}
              className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-blue-600 text-white rounded-[2px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {step === 2 ? "RAPORU GÖNDER" : "DEVAM ET"} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
