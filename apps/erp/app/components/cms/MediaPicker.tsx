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
        <div className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-zinc-900 rounded-[4px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/30">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-[4px] flex items-center justify-center border border-emerald-600/10">
                   <HardDrive size={20} />
                </div>
                <div>
                   <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Drive <span className="text-emerald-600">Medya Seçici</span></h2>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">/assets klasöründeki dosyalar listeleniyor</p>
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                   {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                   {uploading ? "YÜKLENİYOR..." : "YENİ YÜKLE"}
                </button>
                <button onClick={onClose} className="p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-400 hover:text-rose-600 rounded-[4px] transition-all">
                   <X size={18} />
                </button>
             </div>
          </div>

          {/* Search */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Dosya adı ile ara..."
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[4px] text-xs font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                   <Loader2 className="animate-spin text-emerald-600" size={40} />
                   <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Dosyalar Getiriliyor...</span>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                        className="group flex flex-col gap-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-[4px] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 hover:shadow-xl transition-all text-left"
                      >
                         <div className="aspect-square bg-white dark:bg-zinc-900 rounded-[4px] flex items-center justify-center overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
                            <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/5 transition-colors" />
                            <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all bg-emerald-600 text-white p-1 rounded-[2px]">
                               <Check size={10} />
                            </div>
                         </div>
                         <div className="px-0.5 overflow-hidden">
                            <div className="text-[9px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate italic">{file.name}</div>
                            <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
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
