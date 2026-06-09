"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Tooltip, Modal, Select, Button, message } from "antd";
import { useTheme } from "next-themes";
import { 
  ExternalLink, 
  Eye, 
  Trash2, 
  CheckSquare, 
  X, 
  Loader2,
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { updateReportStatus, bulkUpdateReportStatus, bulkDeleteReports } from "../actions/admin-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FilePreview from "./dashboard/FilePreview";

interface ReportsTableProps {
  initialReports: any[];
  currentSort?: string;
  currentDir?: "asc" | "desc";
}

export default function ReportsTable({ 
  initialReports,
  currentSort,
  currentDir
}: ReportsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const [reports, setReports] = useState(initialReports);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<"status" | "delete" | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("COZULDU");

  const router = useRouter();

  useEffect(() => { setReports(initialReports); }, [initialReports]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateReportStatus(id, newStatus);
    if (res.success) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      message.success("Durum başarıyla güncellendi");
    }
    setUpdatingId(null);
  };

  const handleBulkStatusUpdate = async () => {
    setIsBulkProcessing(true);
    const res = await bulkUpdateReportStatus(selectedIds, bulkNewStatus);
    if (res.success) {
      setSelectedIds([]);
      setShowBulkModal(null);
      router.refresh();
      message.success("Toplu durum güncellemesi başarılı");
    }
    setIsBulkProcessing(false);
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    const res = await bulkDeleteReports(selectedIds);
    if (res.success) {
      setSelectedIds([]);
      setShowBulkModal(null);
      router.refresh();
      message.success("Seçili raporlar silindi");
    }
    setIsBulkProcessing(false);
  };

  const columns = [
    {
      title: "RAPOR BİLGİSİ",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-tight truncate max-w-[250px]">
            {text}
          </span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase italic tracking-widest">
            {record.category}
          </span>
        </div>
      ),
    },
    {
      title: "FİRMA",
      dataIndex: ["company", "name"],
      key: "company",
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2">
          <Building2 size={12} className="text-blue-500 opacity-50" />
          <Link 
            href={`/dashboard/companies/${record.workspaceId}`}
            className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase italic hover:underline"
          >
            {name}
          </Link>
        </div>
      ),
    },
    {
      title: "DURUM",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        const colors: Record<string, string> = {
          BEKLEMEDE: "orange",
          AKSIYON_GEREKLI: "red",
          COZULDU: "green",
        };
        return (
          <div className="flex items-center gap-2">
            {updatingId === record.id ? (
              <Loader2 className="animate-spin text-blue-500" size={12} />
            ) : (
              <Tag color={colors[status]} className="font-black text-[8px] uppercase tracking-[0.15em] border-none px-2 py-0.5 rounded-[2px] shadow-sm">
                {status.replace("_", " ")}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "TARİH",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (date: Date) => (
        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600 font-bold italic text-[9px]">
          <Calendar size={12} />
          {new Date(date).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
    {
      title: "AKSİYONLAR",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Önizle">
            <button 
              onClick={() => {
                const driveIdMatch = record.fileUrl?.match(/\/d\/(.+?)\//) || record.fileUrl?.match(/\/d\/(.+?)$/);
                setPreviewFile({
                  ...record,
                  driveFileId: driveIdMatch ? driveIdMatch[1] : "mock_id_" + record.id,
                  fileName: record.title + ".pdf"
                });
              }} 
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-[4px] hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              aria-label="Raporu Önizle"
            >
              <Eye size={14} />
            </button>
          </Tooltip>
          <Tooltip title="Drive'da Aç">
            <a 
              href={record.fileUrl || "#"} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-zinc-950 dark:bg-zinc-800 text-white rounded-[4px] hover:bg-indigo-600 transition-all shadow-md"
              aria-label="Dosyayı Yeni Sekmede Aç"
            >
              <ExternalLink size={14} />
            </a>
          </Tooltip>
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />
          <Select 
            value={record.status}
            onChange={(val) => handleStatusUpdate(record.id, val)}
            className="status-select-mini"
            suffixIcon={<MoreVertical size={10} />}
            variant="borderless"
            options={[
              { value: "BEKLEMEDE", label: "BEKLEMEDE" },
              { value: "AKSIYON_GEREKLI", label: "AKSİYON" },
              { value: "COZULDU", label: "ÇÖZÜLDÜ" },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <Table
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as string[]),
        }}
        columns={columns}
        dataSource={reports}
        rowKey="id"
        pagination={{ 
          pageSize: 10, 
          placement: ["bottomCenter"],
          showSizeChanger: false,
          className: "premium-pagination"
        }}
        className="ant-table-premium"
        locale={{ emptyText: "Rapor bulunamadı" }}
      />

      <style jsx global>{`
        .ant-table-premium {
          background: transparent !important;
        }
        .ant-table-premium .ant-table {
          background: transparent !important;
          color: ${isDark ? '#94a3b8' : '#475569'} !important;
        }
        .ant-table-premium .ant-table-thead > tr > th {
          background: ${isDark ? '#09090b' : '#f8fafc'} !important;
          color: ${isDark ? '#52525b' : '#64748b'} !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          letter-spacing: 0.15em !important;
          text-transform: uppercase !important;
          padding: 20px 24px !important;
          border-bottom: 1px solid ${isDark ? '#27272a' : '#e2e8f0'} !important;
        }
        .ant-table-premium .ant-table-tbody > tr > td {
          padding: 20px 24px !important;
          border-bottom: 1px solid ${isDark ? '#27272a' : '#f1f5f9'} !important;
          transition: all 0.3s ease !important;
        }
        .ant-table-premium .ant-table-tbody > tr:hover > td {
          background: ${isDark ? '#18181b' : '#f8fafc'} !important;
        }
        .status-select-mini {
          width: 32px !important;
        }
        .status-select-mini .ant-select-selection-item {
          display: none !important;
        }
        .premium-pagination.ant-pagination {
          margin-top: 32px !important;
          margin-bottom: 32px !important;
        }
        .premium-pagination .ant-pagination-item {
          border-radius: 4px !important;
          border: 1px solid ${isDark ? '#18181b' : '#e2e8f0'} !important;
          background: ${isDark ? '#09090b' : '#ffffff'} !important;
          font-family: inherit !important;
          font-weight: 900 !important;
          font-size: 11px !important;
        }
        .premium-pagination .ant-pagination-item-active {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
        }
        .premium-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .premium-pagination .ant-pagination-item a {
          color: ${isDark ? '#3f3f46' : '#64748b'} !important;
        }
        .premium-pagination .ant-pagination-item-active a {
          color: white !important;
        }
      `}</style>

      {/* FLOATING ACTION BAR */}
      {selectedIds.length > 0 && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900 text-white px-8 py-5 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-800 flex items-center gap-8 backdrop-blur-md italic font-medium">
               <div className="flex items-center gap-3 pr-8 border-r border-slate-700">
                  <div className="w-10 h-10 bg-blue-600 rounded-[4px] flex items-center justify-center font-black text-lg shadow-lg">{selectedIds.length}</div>
                  <span className="text-xs font-black uppercase tracking-widest">Seçili</span>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => setShowBulkModal("status")} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all">
                     <CheckSquare size={16} className="text-emerald-400" /> Durum
                  </button>
                  <button onClick={() => setShowBulkModal("delete")} className="flex items-center gap-2 px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-100 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all">
                     <Trash2 size={16} /> Sil
                  </button>
                  <button onClick={() => setSelectedIds([])} className="p-2.5 text-slate-500 hover:text-white transition-colors border-l border-slate-700 ml-2"><X size={18} /></button>
               </div>
            </div>
          </div>
       )}

      {/* BULK MODALS */}
      <Modal
        title={null}
        footer={null}
        open={showBulkModal === "status"}
        onCancel={() => setShowBulkModal(null)}
        centered
        className="premium-modal"
      >
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">Toplu Statü Güncelle</h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest">{selectedIds.length} DOSYA SEÇİLDİ</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {["BEKLEMEDE", "AKSIYON_GEREKLI", "COZULDU"].map((s) => (
              <button key={s} onClick={() => setBulkNewStatus(s)} className={`p-4 rounded-[4px] border-2 text-[10px] font-black uppercase tracking-widest transition-all ${bulkNewStatus === s ? "bg-blue-600 text-white border-blue-600 shadow-xl" : "dark:bg-zinc-800 border-transparent text-slate-400"}`}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
          <Button 
            onClick={handleBulkStatusUpdate} 
            loading={isBulkProcessing}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white border-none font-black uppercase tracking-widest text-[10px] rounded-[4px] shadow-2xl"
          >
            DEĞİŞİKLİKLERİ ONAYLA
          </Button>
        </div>
      </Modal>

      <Modal
        title={null}
        footer={null}
        open={showBulkModal === "delete"}
        onCancel={() => setShowBulkModal(null)}
        centered
        className="premium-modal"
      >
        <div className="p-6 space-y-6 text-center">
           <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Trash2 size={40} />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">Emin Misiniz?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                {selectedIds.length} adet rapor kalıcı olarak silinecektir. <br/> Bu işlem geri alınamaz.
              </p>
           </div>
           <div className="flex gap-3">
              <Button onClick={() => setShowBulkModal(null)} className="flex-1 h-12 font-black uppercase text-[10px] dark:bg-zinc-800 dark:text-white border-none">VAZGEÇ</Button>
              <Button onClick={handleBulkDelete} loading={isBulkProcessing} className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white border-none font-black uppercase text-[10px]">EVET, SİL</Button>
           </div>
        </div>
      </Modal>

      <FilePreview isOpen={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} />
    </div>
  );
}
