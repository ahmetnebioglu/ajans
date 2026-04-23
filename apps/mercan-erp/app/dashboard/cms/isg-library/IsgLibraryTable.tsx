"use client";

import { useState } from "react";
import { Trash2, FileText, CheckCircle, XCircle, Plus, Upload, Loader2, Tags, Settings } from "lucide-react";
import { addIsgDocument, deleteIsgDocument, toggleIsgDocumentStatus, uploadIsgDocument, createIsgCategory, deleteIsgCategory } from "../../../actions/cms-actions";

export function IsgLibraryTable({ initialDocuments, initialCategories }: { initialDocuments: any[], initialCategories: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [categories, setCategories] = useState(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: "",
    categoryId: "",
    file: null as File | null,
    fileType: "PDF"
  });

  const [newCatName, setNewCatName] = useState("");

  const handleAdd = async () => {
    if (!newDoc.title || !newDoc.categoryId || !newDoc.file) {
      alert("Lütfen başlık, kategori ve döküman dosyasını seçin.");
      return;
    }

    setLoading(true);
    setUploadProgress(true);

    const formData = new FormData();
    formData.append("file", newDoc.file);
    formData.append("title", newDoc.title);
    formData.append("categoryId", newDoc.categoryId);
    formData.append("fileType", newDoc.fileType);

    const res = await uploadIsgDocument(formData);
    
    if (res.success && res.doc) {
      setDocuments([res.doc, ...documents]);
      setIsAdding(false);
      setNewDoc({ title: "", categoryId: "", file: null, fileType: "PDF" });
    } else {
      alert(res.error || "Yükleme sırasında bir hata oluştu.");
    }
    
    setLoading(false);
    setUploadProgress(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setLoading(true);
    const res = await createIsgCategory(newCatName);
    if (res.success) {
      setCategories([...categories, res.category]);
      setNewCatName("");
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const res = await deleteIsgCategory(id);
    if (res.success) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu belgeyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const res = await deleteIsgDocument(id);
    if (res.success) {
      setDocuments(documents.filter(d => d.id !== id));
    } else {
      alert(res.error || "Silinirken hata oluştu.");
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    const res = await toggleIsgDocumentStatus(id, !currentStatus);
    if (res.success) {
      setDocuments(documents.map(d => d.id === id ? { ...d, isPublished: !currentStatus } : d));
    } else {
      alert(res.error || "Durum güncellenirken hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-12 space-y-6">
      <div className="flex justify-between items-center py-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">İSG <span className="text-blue-600">Kütüphanesi</span></h1>
           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Döküman Arşivinizi Yönetin</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsManagingCategories(!isManagingCategories)} 
            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 border ${
              isManagingCategories 
                ? "bg-slate-100 dark:bg-blue-600/20 text-slate-500 dark:text-blue-400 border-slate-200 dark:border-blue-500/30" 
                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800"
            }`}
          >
            <Tags size={18} />
            KATEGORİLER
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 ${
              isAdding ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            {isAdding ? <XCircle size={18} /> : <Plus size={18} />}
            {isAdding ? "İPTAL" : "YENİ BELGE EKLE"}
          </button>
        </div>
      </div>

      {isManagingCategories && (
        <div className="p-12 border border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex flex-col space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">KATEGORİ YÖNETİMİ</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Belgeleri gruplandırmak için kategoriler oluşturun.</p>
           </div>
           
           <div className="flex gap-4">
              <input 
                type="text" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Yeni Kategori Adı (Örn: Eğitim Videoları)"
                className="flex-1 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none"
              />
              <button 
                onClick={handleAddCategory}
                disabled={loading || !newCatName}
                className="px-8 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                EKLE
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl group">
                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 italic">{cat.name}</span>
                   <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {isAdding && (
        <div className="p-12 border border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          {uploadProgress && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={48} className="animate-spin text-blue-600" />
              <p className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Döküman Google Drive'a Yükleniyor...</p>
            </div>
          )}

          <div className="flex flex-col space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">YENİ BELGE EKLE</h3>
             <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Tüm alanları eksiksiz doldurun.</p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Belge Adı</label>
              <input 
                type="text"
                value={newDoc.title} 
                onChange={e => setNewDoc({...newDoc, title: e.target.value})} 
                placeholder="Örn: Ofis Risk Analizi Formu"
                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Kategori</label>
              <select 
                value={newDoc.categoryId} 
                onChange={e => setNewDoc({...newDoc, categoryId: e.target.value})} 
                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none cursor-pointer"
              >
                <option value="">Kategori Seçin...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Döküman Dosyası</label>
              <div className="relative group">
                 <input 
                   type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.mp4"
                   onChange={e => {
                     const file = e.target.files?.[0];
                     if (file) {
                       if (file.size > 50 * 1024 * 1024) {
                         alert("Dosya boyutu çok büyük! Maksimum 50MB yükleyebilirsiniz.");
                         e.target.value = "";
                         return;
                       }
                       setNewDoc({...newDoc, file, fileType: file.name.split('.').pop()?.toUpperCase() || "PDF"});
                     }
                   }} 
                   className="absolute inset-0 opacity-0 cursor-pointer z-10"
                 />
                 <div className="w-full p-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center space-y-4 group-hover:border-blue-600 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-all">
                    <Upload size={48} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                    <div className="text-center">
                       <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {newDoc.file ? newDoc.file.name : "DOSYAYI SEÇİN VEYA SÜRÜKLEYİN"}
                       </p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, MP4, ODT, RTF, TXT, CSV (MAX 50MB)</p>
                       {newDoc.file && (
                         <div className="mt-4 px-4 py-1 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest inline-block">
                           TÜR: {newDoc.fileType}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 disabled:opacity-50 transition-all hover:bg-slate-900 dark:hover:bg-blue-700 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            {loading ? "YÜKLENİYOR..." : "BELGEYİ YAYINLA"}
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Arşiv Listesi</p>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 italic">
              <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">BELGE</th>
              <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-24 text-center text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.3em] italic">Henüz belge eklenmemiş.</td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white text-lg tracking-tighter uppercase italic leading-tight">{doc.title}</span>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{doc.category?.name || "Kategorisiz"}</span>
                           <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">•</span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">{doc.fileType}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleToggleStatus(doc.id, doc.isPublished)}
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${
                          doc.isPublished 
                            ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-blue-600/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {doc.isPublished ? 'AÇIK' : 'KAPALI'}
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)} 
                        disabled={loading} 
                        className="p-4 text-slate-200 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
