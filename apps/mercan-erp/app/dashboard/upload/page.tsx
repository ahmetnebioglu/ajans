"use client";

import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft, 
  Users, 
  Loader2,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { uploadReportAction } from "../../actions/drive-actions";
import { getExpertCompanies } from "../../actions/expert-actions";

type Step = 1 | 2 | 3;

export default function MobileUploadPage() {
  const [step, setStep] = useState<Step>(1);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [category, setCategory] = useState("Genel");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("BEKLEMEDE");
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getExpertCompanies();
    if (res.success) setCompanies(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedCompanyId) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("category", category);
    formData.append("status", status);

    const res = await uploadReportAction(formData, selectedCompanyId);
    
    if (res.success) {
      setUploadedId(res.data.fileId || "success");
      setStep(3);
    } else {
      alert("Hata: " + res.error);
    }
    setIsUploading(false);
  };

  const StatusButton = ({ value, label, icon: Icon, colorClass, activeClass }: any) => (
    <button
      onClick={() => setStatus(value)}
      className={`flex-1 p-3 rounded-[4px] border flex flex-col items-center gap-2 transition-all ${
        status === value ? activeClass : "bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 text-slate-400 opacity-60"
      }`}
    >
      <Icon size={16} />
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Dynamic Header */}
      <div className="bg-zinc-950 dark:bg-black text-white p-6 pb-12 rounded-none border-b border-zinc-800 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-zinc-900 dark:bg-blue-600 rounded-[4px] flex items-center justify-center shadow-lg border border-zinc-800">
                <ClipboardList size={18} className="text-white" />
             </div>
             <div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">RAPOR SİHİRBAZI</h1>
                <p className="text-[9px] text-zinc-500 dark:text-blue-400 font-black uppercase tracking-widest leading-none mt-1.5">Canlı Saha Veri Girişi</p>
             </div>
          </div>
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">ADIM {step}/3</div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-zinc-900 rounded-[4px] shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 flex">
             <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>

          <div className="p-8 flex-1 flex flex-col">
            
            {/* STEP 1: COMPANY SELECTION */}
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                <div className="space-y-1">
                   <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Firma Seçimi</h2>
                   <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest italic">Hangi firma için rapor oluşturuyorsunuz?</p>
                </div>
                
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex flex-col items-center py-10 text-slate-300 dark:text-zinc-800">
                       <Loader2 className="animate-spin mb-2" />
                       <span className="text-[9px] font-black uppercase">FİRMALAR YÜKLENİYOR...</span>
                    </div>
                  ) : companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => setSelectedCompanyId(company.id)}
                        className={`w-full p-4 rounded-[4px] border transition-all flex items-center justify-between group ${
                          selectedCompanyId === company.id 
                          ? "bg-zinc-950 dark:bg-blue-600 border-zinc-950 dark:border-blue-600 text-white shadow-xl translate-x-1" 
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <Users size={16} className={selectedCompanyId === company.id ? "text-blue-200" : "text-slate-400"} />
                           <span className="font-black text-xs uppercase tracking-tighter">{company.name}</span>
                        </div>
                        {selectedCompanyId === company.id && <CheckCircle2 size={16} />}
                      </button>
                  ))}
                </div>

                <button
                  disabled={!selectedCompanyId}
                  onClick={() => setStep(2)}
                  className="w-full mt-6 p-4 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-30 text-[10px] tracking-widest"
                >
                  SONRAKİ ADIM <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: REPORT DETAILS & UPLOAD */}
            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                {/* Back Link */}
                <button onClick={() => setStep(1)} className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase flex items-center gap-1 hover:text-slate-600 transition-colors">
                   <ChevronLeft size={12} /> GERİ DÖN
                </button>

                <div className="space-y-1">
                   <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Rapor Detayları</h2>
                   <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest italic">Rapor türüne ve durumuna karar verin.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1 leading-none">Görsel veya Dosya</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*, application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      />
                      <div className={`p-6 border border-dashed rounded-[4px] text-center transition-all ${file ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 shadow-inner" : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 group-hover:border-blue-400"}`}>
                         <div className={`w-16 h-16 rounded-[4px] mx-auto flex items-center justify-center shadow-xl mb-3 ${file ? "bg-emerald-500 text-white" : "bg-zinc-950 dark:bg-blue-600 text-white"}`}>
                            {file ? <CheckCircle2 size={32} /> : <Camera size={32} />}
                         </div>
                         {file ? (
                           <div className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-tighter truncate px-2">{file.name}</div>
                         ) : (
                           <p className="text-slate-400 dark:text-zinc-500 font-black text-[9px] uppercase italic tracking-widest leading-tight">DOSYA SEÇİN VEYA FOTOĞRAF ÇEKİN</p>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1 leading-none">Rapor Durumu</label>
                    <div className="flex gap-1.5">
                       <StatusButton 
                          value="BEKLEMEDE" 
                          label="Beklemede" 
                          icon={Loader2} 
                          activeClass="bg-zinc-100 dark:bg-zinc-800 border-zinc-950 dark:border-zinc-500 text-zinc-950 dark:text-white" 
                        />
                       <StatusButton 
                          value="AKSIYON_GEREKLI" 
                          label="Aksiyon" 
                          icon={AlertTriangle} 
                          activeClass="bg-red-50 dark:bg-red-900/20 border-red-600 text-red-600 shadow-lg shadow-red-100 dark:shadow-none" 
                        />
                       <StatusButton 
                          value="COZULDU" 
                          label="Çözüldü" 
                          icon={CheckCircle2} 
                          activeClass="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-600 text-emerald-600" 
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1 leading-none">Rapor Türü (Kategori)</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[4px] font-black text-[11px] uppercase outline-none focus:border-blue-600 transition-all"
                    >
                      <option value="Genel">Genel</option>
                      <option value="İş Sağlığı">İş Sağlığı</option>
                      <option value="İş Güvenliği">İş Güvenliği</option>
                      <option value="Yangın / Acil Durum">Yangın / Acil Durum</option>
                    </select>
                  </div>
                </div>

                <button
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className="w-full mt-4 p-4 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase flex items-center justify-center gap-2 shadow-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-30 text-[10px] tracking-widest"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  {isUploading ? "GÖNDERİLİYOR..." : "RAPORU GÖNDER"}
                </button>
              </div>
            )}

            {/* STEP 3: SUCCESS SUCCESS */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500 italic">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[4px] flex items-center justify-center shadow-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={48} />
                 </div>
                 <div className="space-y-1.5">
                    <h2 className="text-2xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase underline decoration-emerald-500 decoration-2 underline-offset-4 leading-none">BAŞARILI</h2>
                    <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-bold leading-relaxed px-4 uppercase tracking-tighter">Rapor sisteme işlendi, veritabanı güncellendi ve ilgili Drive klasörüne senkronize edildi.</p>
                 </div>
                 <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all mt-4"
                 >
                    YENİ RAPOR OLUŞTUR
                 </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-md mx-auto px-4 mt-6 flex items-start gap-2.5 text-slate-400 dark:text-zinc-600 bg-slate-100/30 dark:bg-zinc-900/30 p-3 rounded-[4px] border border-slate-200/50 dark:border-zinc-800/50">
         <AlertCircle size={14} className="shrink-0 mt-0.5" />
         <p className="text-[9px] font-black uppercase tracking-tighter leading-tight italic">Yüklenen dosyalar Google Cloud üzerinde güvence altındadır ve anlık olarak yönetici paneline düşmektedir.</p>
      </div>

    </div>
  );
}
