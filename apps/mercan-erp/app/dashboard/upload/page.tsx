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
    if (res.success) setCompanies(res.companies || []);
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
      setUploadedId(res.fileId || "success");
      setStep(3);
    } else {
      alert("Hata: " + res.error);
    }
    setIsUploading(false);
  };

  const StatusButton = ({ value, label, icon: Icon, colorClass, activeClass }: any) => (
    <button
      onClick={() => setStatus(value)}
      className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
        status === value ? activeClass : "bg-white border-slate-100 text-slate-400 opacity-60"
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Dynamic Header */}
      <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[0.75rem] shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
                <ClipboardList size={22} className="text-white" />
             </div>
             <div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">RAPOR SİHİRBAZI</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">Canlı Saha Veri Girişi</p>
             </div>
          </div>
          <div className="text-xs font-black text-slate-500">ADIM {step}/3</div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-[0.625rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[520px] flex flex-col">
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 flex">
             <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>

          <div className="p-8 flex-1 flex flex-col">
            
            {/* STEP 1: COMPANY SELECTION */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <div className="space-y-1">
                   <h2 className="text-xl font-black text-slate-900">Firma Seçimi</h2>
                   <p className="text-xs text-slate-400 font-medium italic">Hangi firma için rapor oluşturuyorsunuz?</p>
                </div>
                
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex flex-col items-center py-10 text-slate-300">
                       <Loader2 className="animate-spin mb-2" />
                       <span className="text-[10px] font-black">FİRMALAR YÜKLENİYOR...</span>
                    </div>
                  ) : companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => setSelectedCompanyId(company.id)}
                        className={`w-full p-5 rounded-md border-2 transition-all flex items-center justify-between group ${
                          selectedCompanyId === company.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl translate-x-2" 
                          : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <Users size={18} className={selectedCompanyId === company.id ? "text-blue-200" : "text-slate-400"} />
                           <span className="font-bold text-sm uppercase tracking-tight">{company.name}</span>
                        </div>
                        {selectedCompanyId === company.id && <CheckCircle2 size={18} />}
                      </button>
                  ))}
                </div>

                <button
                  disabled={!selectedCompanyId}
                  onClick={() => setStep(2)}
                  className="w-full mt-10 p-5 bg-slate-900 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-30"
                >
                  SONRAKİ ADIM <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* STEP 2: REPORT DETAILS & UPLOAD */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                {/* Back Link */}
                <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                   <ChevronLeft size={14} /> GERİ DÖN
                </button>

                <div className="space-y-1">
                   <h2 className="text-xl font-black text-slate-900">Rapor Detayları</h2>
                   <p className="text-xs text-slate-400 font-medium italic">Rapor türüne ve durumuna karar verin.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Görsel veya Dosya</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*, application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      />
                      <div className={`p-10 border-2 border-dashed rounded-[0.5rem] text-center transition-all ${file ? "bg-emerald-50 border-emerald-500 shadow-inner" : "bg-slate-50 border-slate-200 group-hover:border-blue-400"}`}>
                         <div className={`w-20 h-20 rounded-xl mx-auto flex items-center justify-center shadow-xl mb-4 ${file ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"}`}>
                            {file ? <CheckCircle2 size={40} /> : <Camera size={40} />}
                         </div>
                         {file ? (
                           <div className="text-emerald-700 font-black text-xs uppercase tracking-tight">{file.name}</div>
                         ) : (
                           <p className="text-slate-400 font-bold text-xs uppercase italic tracking-widest">DOSYA SEÇİN VEYA FOTOĞRAF ÇEKİN</p>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rapor Durumu</label>
                    <div className="flex gap-2">
                       <StatusButton 
                          value="BEKLEMEDE" 
                          label="Beklemede" 
                          icon={Loader2} 
                          activeClass="bg-slate-100 border-slate-900 text-slate-900" 
                        />
                       <StatusButton 
                          value="AKSIYON_GEREKLI" 
                          label="Aksiyon" 
                          icon={AlertTriangle} 
                          activeClass="bg-red-50 border-red-600 text-red-600 shadow-lg shadow-red-100" 
                        />
                       <StatusButton 
                          value="COZULDU" 
                          label="Çözüldü" 
                          icon={CheckCircle2} 
                          activeClass="bg-emerald-50 border-emerald-600 text-emerald-600" 
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rapor Türü (Kategori)</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition-all"
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
                  className="w-full mt-4 p-5 bg-blue-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                  {isUploading ? "GÖNDERİLİYOR..." : "RAPORU GÖNDER"}
                </button>
              </div>
            )}

            {/* STEP 3: SUCCESS SUCCESS */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                 <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={64} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase underline decoration-emerald-500 decoration-4 underline-offset-4">BAŞARILI</h2>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed px-6">Rapor sisteme işlendi, veritabanı güncellendi ve ilgili Drive klasörüne senkronize edildi.</p>
                 </div>
                 <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                 >
                    YENİ RAPOR OLUŞTUR
                 </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-md mx-auto px-6 mt-8 flex items-center gap-3 text-slate-400 bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
         <AlertCircle size={20} />
         <p className="text-[10px] font-bold leading-tight">Yüklenen dosyalar Google Cloud üzerinde güvence altındadır ve anlık olarak yönetici paneline düşmektedir.</p>
      </div>

    </div>
  );
}
