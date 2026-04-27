"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ExternalLink, 
  FileText, 
  FileWarning, 
  Maximize2, 
  Loader2,
  Edit3,
  Monitor
} from "lucide-react";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    title: string;
    fileUrl: string;
    driveFileId: string;
    fileName: string;
  } | null;
}

export default function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when file changes
  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const driveId = file?.driveFileId;
  const isMockData = !!driveId && driveId.startsWith("mock_id");
  const hasNoDriveId = !driveId || driveId.trim() === "";

  const previewUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : "";
  
  // Desteklenen tüm ofis ve medya formatları
  const previewableExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".pdf", 
    ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt",
    ".txt", ".csv"
  ];
  
  const isPreviewable = previewableExtensions.some(ext => 
    (file?.fileName || "").toLowerCase().endsWith(ext)
  );

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl cursor-zoom-out" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-full flex flex-col bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-zinc-800">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 font-medium italic">
           <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                 <Monitor size={24} />
              </div>
              <div className="min-w-0">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase truncate leading-none mb-1">{file?.title}</h3>
                 <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest truncate">PANEL ÖN İZLEME SİSTEMİ</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <a 
                href={file?.fileUrl} 
                target="_blank" 
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
              >
                 Drive'da Düzenle <Edit3 size={14} />
              </a>
              <button onClick={onClose} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                 <X size={24} />
              </button>
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-950 relative flex items-center justify-center">
           {hasNoDriveId ? (
              <div className="text-center p-12 space-y-6 max-w-sm italic">
                  <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                     <FileWarning size={48} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">DOSYAYA ERİŞİLEMİYOR</h4>
                     <p className="text-xs text-slate-400 dark:text-zinc-600 font-bold uppercase leading-relaxed tracking-widest">
                        Bu raporun Google Drive bağlantısı bulunamadı veya dosya henüz oluşturulmadı.
                     </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-2xl transition-all"
                  >
                     KAPAT <X size={18} />
                  </button>
              </div>
           ) : isMockData ? (
              <div className="text-center p-12 space-y-6 max-w-sm italic">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative overflow-hidden">
                     <Monitor size={48} className="relative z-10" />
                     <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">SİMÜLASYON VERİSİ</h4>
                     <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase leading-relaxed tracking-widest">
                        Bu dosya test süreçleri için otomatik üretilmiştir. <br />
                        Gerçek bir Google Drive dosyası değildir.
                     </p>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                     <p className="text-[10px] font-black text-slate-500 dark:text-zinc-600 uppercase tracking-widest leading-none mb-1">DOSYA ID</p>
                     <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-700 truncate">{driveId}</p>
                  </div>
              </div>
           ) : isPreviewable ? (
              <>
                 {isLoading && (
                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                       <Loader2 className="animate-spin text-blue-600" size={48} />
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Döküman Hazırlanıyor</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">LÜTFEN BEKLEYİN...</p>
                       </div>
                    </div>
                 )}
                 <iframe 
                    src={previewUrl}
                    onLoad={() => setIsLoading(false)}
                    className={`w-full h-full border-none bg-white shadow-inner transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    allow="autoplay"
                    title="Google Drive Document Preview"
                 />
              </>
           ) : (
              <div className="text-center p-12 space-y-6 max-w-sm italic">
                 <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <FileWarning size={48} />
                 </div>
                  <div className="space-y-2">
                     <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">ÖN İZLEME KAPALI</h4>
                     <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase leading-relaxed tracking-widest">BU DOSYA TÜRÜ İÇİN ÖN İZLEME DESTEKLENMİYOR.</p>
                  </div>
                  <a href={file?.fileUrl} target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-2xl transition-all">
                     DRIVE'DA GÖRÜNTÜLE <ExternalLink size={18} />
                  </a>
              </div>
           )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 flex justify-center italic">
           <p className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-[0.4em]">Mercan ERP Güvenli Ön İzleme Katmanı</p>
        </div>

      </div>
    </div>
  );
}
