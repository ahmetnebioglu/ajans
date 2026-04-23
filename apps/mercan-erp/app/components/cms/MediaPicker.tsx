"use client";

import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Search, 
  X, 
  Check, 
  Loader2, 
  FileBox,
  Upload,
  HardDrive
} from "lucide-react";


interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileId: string, fileUrl?: string) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // Google Drive API üzerinden dosyaları doğrudan çek
      const res = await fetch("/api/cms/drive-assets");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Media list load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Upload successful, auto-select and close
        onSelect(data.fileId, data.webViewLink);
        onClose();
      } else {
        const error = await res.json();
        alert("Yükleme hatası: " + (error.error || "Bilinmeyen hata"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
       
       <div className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                   <HardDrive size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Drive <span className="text-emerald-600">Medya Seçici</span></h2>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">/assets klasöründeki dosyalar listeleniyor</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                   {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                   {uploading ? "YÜKLENİYOR..." : "YENİ YÜKLE"}
                </button>
                <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-600 rounded-2xl transition-all hover:rotate-90">
                   <X size={20} />
                </button>
             </div>
          </div>

          {/* Search */}
          <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Dosya adı ile ara..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                   <Loader2 className="animate-spin text-emerald-600" size={48} />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Dosyalar Getiriliyor...</span>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {files
                     .filter(f => f.mimeType.includes("image")) // Sadece görselleri göster
                     .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                     .map((file) => (
                      <button 
                        key={file.id}
                        onClick={() => {
                          onSelect(file.id, file.webViewLink);
                          onClose();
                        }}
                        className="group flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-600/5 transition-all text-left"
                      >
                         <div className="aspect-square bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
                            <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors" />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-emerald-600 text-white p-1.5 rounded-lg">
                               <Check size={14} />
                            </div>
                         </div>
                         <div className="px-1 overflow-hidden">
                            <div className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate italic">{file.name}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                         </div>
                      </button>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
