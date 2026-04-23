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
    <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
      {/* Progress Header */}
      <div className="relative h-2 bg-gray-100 w-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-8 flex-1 flex flex-col">
        {/* Step Indicator */}
        <div className="flex justify-between mb-8 items-center px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${step === s ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200" : 
                  step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}
              `}>
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-[2px] mx-2 ${step > s ? "bg-green-500" : "bg-gray-100"}`} />}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-2">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Rapor Künyesi</h2>
                <p className="text-gray-500">İşlem yapılan proje ve kategori bilgilerini girin.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Rapor Başlığı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Kat 3 Elektrik Tesisatı Kontrolü"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kategori</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Rutin Kontrol", "Arıza / Tamir", "Montaj", "Hakediş"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`p-3 rounded-xl border text-sm transition-all ${
                          formData.category === cat 
                          ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
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
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Medya & Belgeler</h2>
                <p className="text-gray-500">İşlemle ilgili fotoğraf veya dökümanı yükleyin.</p>
              </div>

              <div 
                className={`
                  relative border-2 border-dashed rounded-3xl p-12 text-center transition-all
                  ${formData.file ? "border-green-500 bg-green-50/30" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-400"}
                `}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${formData.file ? "bg-green-500" : "bg-blue-600"} text-white shadow-xl`}>
                    {formData.file ? <CheckCircle2 size={40} /> : <Camera size={40} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {formData.file ? formData.file.name : "Tıklayın veya Sürükleyin"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Maksimum 10MB - PDF, PNG, JPG</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ek Notlar (Opsiyonel)</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Sahadaki özel durumlar varsa buraya ekleyin..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
              {isUploading ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <Loader2 size={80} className="text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Layers size={30} className="text-blue-200" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Yükleniyor...</h2>
                    <p className="text-gray-500">Raporunuz Google Drive'a arşivleniyor.</p>
                  </div>
                </div>
              ) : result?.success ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200 animate-bounce">
                    <CheckCircle2 size={50} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">MÜKEMMEL!</h2>
                    <p className="text-gray-600 max-w-xs mx-auto">Saha raporu başarıyla sisteme aktarıldı. Diğer ekip üyeleri artık bu rapora erişebilir.</p>
                  </div>
                  <button 
                    onClick={() => { setStep(1); setFormData({ title: "", category: "Rutin Kontrol", notes: "", file: null }); setResult(null); }}
                    className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all hover:scale-105"
                  >
                    Yeni Rapor Oluştur
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-200">
                    <AlertCircle size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vov! Bir Şeyler Ters Gitti.</h2>
                  <p className="text-red-600 text-sm">{result?.message}</p>
                  <button 
                    onClick={() => setStep(2)}
                    className="mt-4 px-8 py-3 bg-gray-100 text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-all"
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {step < 3 && !isUploading && (
          <div className="flex justify-between items-center mt-12 gap-4 border-t border-gray-100 pt-6">
            <button 
              onClick={() => step > 1 && setStep((s) => s - 1 as Step)}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${step === 1 ? "opacity-0 invisible" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              <ChevronLeft size={20} /> Geri
            </button>

            <button 
              onClick={() => {
                if (step === 1 && formData.title) setStep(2);
                else if (step === 2 && formData.file) handleSubmit();
              }}
              disabled={(step === 1 && !formData.title) || (step === 2 && !formData.file)}
              className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {step === 2 ? "Raporu Gönder" : "Devam Et"} <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
