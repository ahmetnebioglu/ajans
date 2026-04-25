"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Building2,
  ChevronLeft,
  FolderOpen,
  Loader2,
  FileText,
  FileBox,
  ExternalLink,
  Calendar,
  Users,
  User as UserIcon,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  X,
  Upload,
  Camera,
  FolderPlus,
  Folder,
  ChevronRight,
  Move,
  Home,
  ArrowRight,
  ChevronDown,
  CloudUpload,
  ShieldAlert,
  MessageSquare,
  StickyNote,
  Eye,
  Trash2,
  CheckSquare,
  FileDown,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getCompanyDetails,
  updateReportStatus,
  createFolder,
  moveReport,
  bulkUpdateReportStatus,
  bulkDeleteReports,
  logPdfGeneration,
} from "../../../actions/admin-actions";
import { uploadReportAction } from "../../../actions/drive-actions";
import FilePreview from "../../../components/dashboard/FilePreview";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// RECURSIVE FOLDER TREE COMPONENT
const FolderTreeItem = ({
  folder,
  allFolders,
  depth = 0,
  onSelect,
  selectedFolderId,
  isProcessing,
}: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const children = allFolders.filter((f: any) => f.parentId === folder.id);
  const hasChildren = children.length > 0;

  return (
    <div
      className="space-y-1"
      style={{ paddingLeft: `${depth > 0 ? 0.75 : 0}rem` }}
    >
      <button
        onClick={() => onSelect(folder.id)}
        disabled={isProcessing}
        className={`w-full group flex items-center gap-2 p-2 rounded-[4px] border border-transparent transition-all text-left ${selectedFolderId === folder.id ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400 shadow-md" : "bg-slate-50 dark:bg-slate-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-slate-900"}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5 rounded-[4px] transition-colors"
            >
              {isOpen ? (
                <ChevronDown size={12} className="text-slate-400 dark:text-slate-500" />
              ) : (
                <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}
          <Folder
            size={16}
            className={`${selectedFolderId === folder.id ? "text-blue-600 dark:text-blue-400" : "text-amber-500"} flex-shrink-0`}
            fill="currentColor"
            fillOpacity={0.1}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-tighter truncate ${selectedFolderId === folder.id ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}
          >
            {folder.name}
          </span>
        </div>
      </button>
      {isOpen && hasChildren && (
        <div className="space-y-1">
          {children.map((child: any) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              depth={depth + 1}
              onSelect={onSelect}
              selectedFolderId={selectedFolderId}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CompanyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session } = useSession();
  const id = params.id as string;
  const currentFolderId = searchParams.get("folderId");
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isClient = userRole === "CLIENT";

  const [company, setCompany] = useState<any>(null);
  const [currentFolderName, setCurrentFolderName] = useState("Kök Dizin");
  const [loading, setLoading] = useState(true);

  const [dragCounter, setDragCounter] = useState(0);
  const dragActive = dragCounter > 0;

  // Selection state
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<
    "status" | "delete" | null
  >(null);
  const [bulkNewStatus, setBulkNewStatus] = useState("COZULDU");

  // Modals & Preview
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState<any>(null);
  const [visibleNote, setVisibleNote] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);

  // State for forms
  const [isProcessing, setIsProcessing] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Genel");
  const [uploadStatus, setUploadStatus] = useState("BEKLEMEDE");
  const [uploadNote, setUploadNote] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getCompanyDetails(id, currentFolderId);
    if (res.success) {
      setCompany(res.data.company);
      setCurrentFolderName(res.data.currentFolderName || "Kök Dizin");
      setSelectedReportIds([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, currentFolderId]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter") setDragCounter((prev) => prev + 1);
    else if (e.type === "dragleave") setDragCounter((prev) => prev - 1);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
      setShowUploadModal(true);
    }
  }, []);

  const currentFolders = useMemo(() => {
    if (!company) return [];
    return company.folders.filter((f: any) => f.parentId === currentFolderId);
  }, [company, currentFolderId]);

  const currentReports = useMemo(() => {
    if (!company) return [];
    return company.reports;
  }, [company]);

  // PDF Generation Function
  const generatePDFReport = async () => {
    if (!company || currentReports.length === 0) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString("tr-TR");

    // HEADER
    doc.setFontSize(18);
    doc.setTextColor(23, 37, 84); // Indigo 950
    doc.text("MERCAN ERP - ISG DENETIM RAPORU", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Firma: ${company.name}`, 15, 28);
    doc.text(`Konum: ${currentFolderName}`, 15, 33);
    doc.text(`Tarih: ${dateStr}`, 15, 38);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(15, 42, 195, 42);

    // TABLE DATA
    const tableRows = currentReports.map((r: any) => [
      r.title,
      r.category,
      r.status.replace("_", " "),
      r.note || "-",
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Rapor Adı", "Kategori", "Durum", "Uzman Tespit Notu"]],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: {
        2: { fontStyle: "bold" }, // Status column bold
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const status = data.cell.raw;
          if (status === "AKSIYON GEREKLI") {
            data.cell.styles.textColor = [225, 29, 72]; // Rose 600
          } else if (status === "COZULDU") {
            data.cell.styles.textColor = [5, 150, 105]; // Emerald 600
          }
        }
      },
    });

    // FOOTER (Simple)
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Sayfa ${i} / ${pageCount} - Mercan ERP Dijital Arşiv Sistemi`,
        15,
        285,
      );
    }

    doc.save(
      `${company.name.replace(/\s+/g, "_")}_Denetim_Raporu_${dateStr.replace(/\./g, "_")}.pdf`,
    );

    // Log the PDF generation
    await logPdfGeneration(id, company.name);
  };

  const toggleSelect = (reportId: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((i) => i !== reportId)
        : [...prev, reportId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedReportIds.length === currentReports.length)
      setSelectedReportIds([]);
    else setSelectedReportIds(currentReports.map((r) => r.id));
  };

  const handleBulkStatusChange = async () => {
    setIsProcessing(true);
    const res = await bulkUpdateReportStatus(selectedReportIds, bulkNewStatus);
    if (res.success) {
      setShowBulkModal(null);
      loadData();
    }
    setIsProcessing(false);
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const res = await bulkDeleteReports(selectedReportIds);
    if (res.success) {
      setShowBulkModal(null);
      loadData();
    }
    setIsProcessing(false);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;
    setIsProcessing(true);
    const res = await createFolder(newFolderName, id, currentFolderId);
    if (res.success) {
      setShowFolderModal(false);
      setNewFolderName("");
      loadData();
    }
    setIsProcessing(false);
  };

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !id) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadFile.name);
    formData.append("category", uploadCategory);
    formData.append("status", uploadStatus);
    formData.append("note", uploadNote);
    formData.append("folderId", currentFolderId || "");
    const res = await uploadReportAction(formData, id);
    if (res.success) {
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadNote("");
      loadData();
    }
    setIsProcessing(false);
  };

  const handleMoveOperation = async (targetFolderId: string | null) => {
    if (!showMoveModal) return;
    setIsProcessing(true);
    const res = await moveReport(showMoveModal.id, targetFolderId);
    if (res.success) {
      setShowMoveModal(null);
      loadData();
    }
    setIsProcessing(false);
  };

  const openFolder = (folderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) params.set("folderId", folderId);
    else params.delete("folderId");
    router.push(`?${params.toString()}`);
  };

  const bgStatus = (status: string) => {
    switch (status) {
      case "AKSIYON_GEREKLI":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
      case "COZULDU":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      default:
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    }
  };

  if (loading && !company)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 font-black italic uppercase tracking-widest text-[10px]">
        <Loader2 className="animate-spin mb-4" size={48} /> Rapor Kompleksi
        Yükleniyor...
      </div>
    );
  if (!company)
    return (
      <div className="p-10 text-center uppercase font-black text-slate-300 italic animate-pulse">
        Erişim Hatası
      </div>
    );

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 font-medium italic relative min-h-[80vh]"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <FilePreview
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {dragActive && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-4 animate-bounce">
            <div className="w-24 h-24 bg-white rounded-[4px] shadow-2xl flex items-center justify-center mx-auto text-blue-600">
              <CloudUpload size={48} />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">
                BIRAKIN VE YÜKLEYİN
              </h2>
              <p className="text-blue-100 font-bold uppercase tracking-[0.3em] text-[8px]">
                DOSYA "{currentFolderName}" KONUMUNA ATILACAK
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden">
        <Building2 className="absolute -right-12 -bottom-12 text-slate-50 dark:text-zinc-800/20 w-80 h-80 -rotate-12" />
        <div className="space-y-3 relative z-10 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-14 h-14 bg-zinc-950 dark:bg-blue-600 text-white rounded-[4px] flex items-center justify-center shadow-xl transform rotate-2 tracking-tighter">
              <Building2 size={28} />
            </div>
            <div className="flex flex-wrap gap-2">
              {!isClient && (
                <>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-2.5 rounded-[4px] shadow-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all shadow-emerald-600/20"
                  >
                    <Plus size={14} /> Rapor Yükle
                  </button>
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-2.5 rounded-[4px] shadow-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-700 active:scale-95 transition-all"
                  >
                    <FolderPlus size={14} /> Yeni Klasör
                  </button>
                </>
              )}
              <button
                onClick={generatePDFReport}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-[4px] shadow-lg border border-blue-100 dark:border-blue-900/50 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white active:scale-95 transition-all"
              >
                <FileDown size={14} /> PDF Rapor Oluştur
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none not-italic">
            {company.name}
          </h1>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-x-auto whitespace-nowrap hide-those-scrollbars">
        <button
          onClick={() => openFolder(null)}
          className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${!currentFolderId ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
        >
          <Home size={12} /> KÖK DİZİN
        </button>
        {currentFolderId && (
          <>
            <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 italic">
              <FolderOpen size={12} /> {currentFolderName}
            </span>
          </>
        )}
      </div>

      {/* DIRECTORY LISTING */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-zinc-800/50 border-b dark:border-zinc-800">
              <tr>
                {!isClient && (
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                      {selectedReportIds.length === currentReports.length && currentReports.length > 0 ? <CheckSquare size={16} /> : <X size={16} />}
                    </button>
                  </th>
                )}
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em]">Dosya & Tespitler</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em]">Durum / Aksiyon</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em] text-right">Hızlı Bak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 italic">
              {currentFolders.map((folder: any) => (
                <tr
                  key={folder.id}
                  onClick={() => openFolder(folder.id)}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border-b dark:border-slate-800 last:border-0"
                >
                  <td className="p-4 w-10 opacity-0"></td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 rounded-[4px] flex items-center justify-center group-hover:bg-amber-500 dark:group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                      <Folder size={18} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">
                        {folder.name}
                      </div>
                      <div className="text-[8px] font-bold text-slate-300 dark:text-zinc-600 uppercase tracking-[0.1em]">
                        Dijital Arşiv Klasörü
                      </div>
                    </div>
                  </td>
                  <td></td>
                  <td className="p-4 text-right">
                    <ChevronRight
                      size={18}
                      className="text-slate-300 group-hover:text-blue-600 ml-auto"
                    />
                  </td>
                </tr>
              ))}
              {currentReports.map((r: any) => (
                <tr
                  key={r.id}
                  className={`group transition-all duration-300 border-b dark:border-zinc-800 ${selectedReportIds.includes(r.id) ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"}`}
                >
                  {!isClient && (
                    <td className="p-4 w-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                        className={`p-1.5 transition-colors ${selectedReportIds.includes(r.id) ? "text-blue-600" : "text-slate-200 dark:text-zinc-800 hover:text-slate-400"}`}
                      >
                        {selectedReportIds.includes(r.id) ? <CheckSquare size={16} /> : <div className="w-3.5 h-3.5 border border-current rounded-[1px]" />}
                      </button>
                    </td>
                  )}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-[4px] flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {r.title}
                        </span>
                        {r.note && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisibleNote(r.note);
                            }}
                            className="text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase border border-amber-100 dark:border-amber-900"
                          >
                            <StickyNote size={8} /> NOT VAR
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[8px] font-bold text-slate-300 dark:text-zinc-600 uppercase tracking-tighter">
                        <span className="flex items-center gap-1">
                          <Tag size={8} /> {r.category}
                        </span>
                        <span className="w-0.5 h-0.5 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                        <span className="flex items-center gap-1">
                          <UserIcon size={8} /> {r.uploadedBy?.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest border ${bgStatus(r.status)}`}>
                        {r.status.replace("_", " ")}
                      </span>
                      {!isClient && (
                        <button 
                          onClick={() => {
                            const next = { "BEKLEMEDE": "AKSIYON_GEREKLI", "AKSIYON_GEREKLI": "COZULDU", "COZULDU": "BEKLEMEDE" }[r.status];
                            updateReportStatus(r.id, next).then(res => res.success && loadData());
                          }}
                          className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-500 rounded-[4px] transition-all border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                          title="Durum Değiştir"
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-1.5">
                    <button
                      onClick={() => setPreviewFile(r)}
                      className="px-4 py-2 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm active:scale-95 flex items-center gap-2 group/btn"
                    >
                      Göz At <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    {!isClient && (
                      <button
                        onClick={() => setShowMoveModal(r)}
                        className="p-2 bg-slate-50 dark:bg-zinc-800/50 text-slate-400 dark:text-zinc-500 hover:bg-zinc-900 dark:hover:bg-blue-600 hover:text-white rounded-[4px] transition-all shadow-sm border border-transparent"
                        title="Taşı"
                      >
                        <Move size={16} />
                      </button>
                    )}

                    <a
                      href={r.url}
                      target="_blank"
                      className="p-2 bg-slate-50 dark:bg-zinc-800/50 text-slate-400 dark:text-zinc-500 hover:bg-blue-600 hover:text-white rounded-[4px] transition-all shadow-sm border border-transparent"
                      title="Drive'da Gör"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReportIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-zinc-950 text-white px-6 py-3.5 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-zinc-800 flex items-center gap-6 backdrop-blur-md italic font-medium">
            <div className="flex items-center gap-3 pr-6 border-r border-zinc-800">
              <div className="w-8 h-8 bg-blue-600 rounded-[4px] flex items-center justify-center font-black text-base shadow-lg">
                {selectedReportIds.length}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Seçildi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkModal("status")}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition-all border border-zinc-800"
              >
                <CheckSquare size={14} className="text-emerald-400" /> Durum
              </button>
              <button
                onClick={() => setShowBulkModal("delete")}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-100 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
              >
                <Trash2 size={14} /> Sil
              </button>
              <button
                onClick={() => setSelectedReportIds([])}
                className="p-2 text-slate-500 hover:text-white transition-colors border-l border-zinc-800 ml-2"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION MODALS */}
      {showBulkModal === "status" && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 leading-none border dark:border-slate-800">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
                TOPLU DURUM
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                {selectedReportIds.length} DOSYA GÜNCELLENECEK
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {["BEKLEMEDE", "AKSIYON_GEREKLI", "COZULDU"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBulkNewStatus(s)}
                  className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${bulkNewStatus === s ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-md scale-105" : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600"}`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowBulkModal(null)}
                className="flex-1 p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleBulkStatusChange}
                disabled={isProcessing}
                className="flex-2 p-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "GÜNCELLEMEYİ ONAYLA"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal === "delete" && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 border-t-8 border-rose-600 dark:border-rose-500 shadow-[0_20px_50px_rgba(244,63,94,0.15)]">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-rose-600 dark:text-rose-400 leading-none">
                TOPLU SİLME
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-widest px-4">
                {selectedReportIds.length} Adet rapor sistemden kalıcı olarak
                temizlenecektir.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(null)}
                className="flex-1 p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="flex-2 p-4 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "KALICI OLARAK SİL"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER MODALS */}
      {visibleNote && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-10 space-y-4 relative overflow-hidden border dark:border-slate-800">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-inner mb-4">
              <StickyNote size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              UZMAN NOTU
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-bold border-l-4 border-amber-200 dark:border-amber-900 pl-4">
              {visibleNote}
            </p>
            <button
              onClick={() => setVisibleNote(null)}
              className="w-full p-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl mt-4 hover:bg-black dark:hover:bg-blue-700 transition-all"
            >
              KAPAT
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-6 top-6 p-2 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              <X size={28} />
            </button>
            <div className="p-10 space-y-6 overflow-y-auto hide-those-scrollbars">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                  EVRAK YÜKLE
                </h3>
                <p className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest leading-none">
                  <FolderOpen size={12} /> {currentFolderName}
                </p>
              </div>
              <form onSubmit={handleQuickUpload} className="space-y-6">
                <div
                  className={`relative border border-dashed rounded-[4px] p-4 text-center transition-all ${uploadFile ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-400 shadow-inner" : "bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800"}`}
                >
                  <input
                    type="file"
                    required={!uploadFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) =>
                      e.target.files?.[0] && setUploadFile(e.target.files[0])
                    }
                  />
                  <p className="text-[9px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-tighter truncate px-2 leading-none">
                    {uploadFile ? uploadFile.name : "BELGE SEÇİN"}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Kategori
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-zinc-800 p-1 rounded-[4px] border border-slate-200 dark:border-zinc-700">
                      <button
                        type="button"
                        onClick={() => setUploadCategory("Genel")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadCategory === "Genel" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-slate-400"}`}
                      >
                        <FileBox size={12} />
                        <span className="text-[7px] font-black uppercase">
                          GENEL
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadCategory("İş Sağlığı")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadCategory === "İş Sağlığı" ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" : "text-slate-400"}`}
                      >
                        <Users size={12} />
                        <span className="text-[7px] font-black uppercase">
                          SAĞLIK
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadCategory("İş Güvenliği")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadCategory === "İş Güvenliği" ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-slate-400"}`}
                      >
                        <ShieldAlert size={12} />
                        <span className="text-[7px] font-black uppercase">
                          GÜVENLİK
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Durum
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-zinc-800 p-1 rounded-[4px] border border-slate-200 dark:border-zinc-700">
                      <button
                        type="button"
                        onClick={() => setUploadStatus("BEKLEMEDE")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadStatus === "BEKLEMEDE" ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-slate-400"}`}
                      >
                        <Clock size={12} />
                        <span className="text-[7px] font-black">BEKLEMEDE</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadStatus("AKSIYON_GEREKLI")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadStatus === "AKSIYON_GEREKLI" ? "bg-white dark:bg-zinc-700 text-rose-600 shadow-md" : "text-slate-400"}`}
                      >
                        <AlertTriangle size={12} />
                        <span className="text-[7px] font-black">AKSİYON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadStatus("COZULDU")}
                        className={`flex flex-col items-center gap-1 py-1.5 rounded-[4px] transition-all ${uploadStatus === "COZULDU" ? "bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm" : "text-slate-400"}`}
                      >
                        <CheckCircle2 size={12} />
                        <span className="text-[7px] font-black">ÇÖZÜLDÜ</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">
                      UZMAN NOTU
                    </label>
                    <textarea
                      value={uploadNote}
                      onChange={(e) => setUploadNote(e.target.value)}
                      placeholder="..."
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[4px] text-[10px] font-bold italic outline-none focus:ring-1 focus:ring-blue-600 transition-all min-h-[80px] resize-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !uploadFile}
                  className="w-full p-4 bg-zinc-900 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase tracking-widest shadow-2xl text-[9px] active:scale-95 transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "ARŞİVE GÖNDER"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFolderModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8 space-y-6 border border-slate-100 dark:border-zinc-800">
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-1 text-slate-900 dark:text-white">
                YENİ KLASÖR
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                DİJİTAL ARŞİV
              </p>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="KLASÖR ADI..."
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[4px] text-xs font-black italic outline-none focus:border-blue-600 transition-all shadow-inner"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 p-3 text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 p-3 bg-zinc-900 dark:bg-blue-600 text-white rounded-[4px] font-black uppercase tracking-widest shadow-xl text-[9px]"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin mx-auto" size={14} />
                  ) : (
                    "OLUŞTUR"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh] border border-slate-100 dark:border-zinc-800">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                  TAŞIMA SİHİRBAZI
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1.5 whitespace-nowrap">
                  {showMoveModal.title}
                </p>
              </div>
              <button
                onClick={() => setShowMoveModal(null)}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 hide-those-scrollbars">
              <button
                onClick={() => handleMoveOperation(null)}
                disabled={isProcessing}
                className={`w-full p-3 rounded-[4px] border flex items-center gap-3 transition-all opacity-100 ${!showMoveModal.folderId ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600" : "bg-slate-50 dark:bg-zinc-800 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 group"}`}
              >
                <div
                  className={`w-9 h-9 rounded-[4px] flex items-center justify-center ${!showMoveModal.folderId ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-zinc-700 text-slate-400 group-hover:bg-blue-600 group-hover:text-white"}`}
                >
                  <Home size={16} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-tighter">
                    ANA DİZİN (ROOT)
                  </div>
                </div>
              </button>
              <div className="space-y-1.5 mt-2">
                {company.folders.filter((f: any) => !f.parentId).map((folder: any) => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    allFolders={company.folders}
                    onSelect={handleMoveOperation}
                    selectedFolderId={showMoveModal.folderId}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
