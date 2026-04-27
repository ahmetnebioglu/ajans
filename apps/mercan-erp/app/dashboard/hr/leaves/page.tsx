"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, message, Typography, Card, Tooltip } from "antd";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  User, 
  Clock, 
  Filter, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "next-themes";
import { getLeaveRequests, updateLeaveStatus } from "../../../hr/actions";
import { LeaveStatus } from "@ajans/db";

const { Title, Text } = Typography;

export default function LeavesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getLeaveRequests();
      if (res.success) setRequests(res.data);
    } catch (err) {
      message.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (leaveId: string, newStatus: LeaveStatus) => {
    try {
      const res = await updateLeaveStatus(leaveId, newStatus);
      if (res.success) {
        message.success(`İzin talebi ${newStatus === "APPROVED" ? "onaylandı" : "reddedildi"}`);
        fetchData(); // Listeyi yenile
      } else {
        message.error(res.error);
      }
    } catch (err) {
      message.error("İşlem sırasında hata oluştu");
    }
  };

  const columns = [
    {
      title: "PERSONEL",
      key: "user",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-zinc-800 rounded flex items-center justify-center">
            <User size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <Text strong className="block text-[12px] uppercase tracking-tight">{record.user?.name || "Bilinmiyor"}</Text>
            <Text className="text-[10px] text-slate-400">{record.user?.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "İZİN TİPİ",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const types: any = { ANNUAL: "Mavi", SICK: "Kırmızı", EXCUSE: "Mor" };
        const colors: any = { ANNUAL: "blue", SICK: "red", EXCUSE: "purple" };
        const labels: any = { ANNUAL: "YILLIK İZİN", SICK: "SAĞLIK İZNİ", EXCUSE: "MAZERET İZNİ" };
        return <Tag color={colors[type]} className="font-black text-[9px] px-2">{labels[type] || type}</Tag>;
      },
    },
    {
      title: "TARİHLER",
      key: "dates",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 italic">
          <Calendar size={12} className="text-blue-500" />
          {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: "DURUM",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config: any = {
          PENDING: { color: "orange", label: "BEKLEMEDE" },
          APPROVED: { color: "green", label: "ONAYLANDI" },
          REJECTED: { color: "red", label: "REDDEDİLDİ" },
        };
        const { color, label } = config[status] || { color: "default", label: status };
        return <Tag color={color} className="font-black text-[9px] px-2">{label}</Tag>;
      },
    },
    {
      title: "AKSİYONLAR",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "PENDING" ? (
            <>
              <Tooltip title="Onayla">
                <Button 
                  type="primary" 
                  size="small" 
                  className="bg-green-600 border-none flex items-center justify-center h-8 w-8"
                  icon={<CheckCircle size={16} />}
                  onClick={() => handleStatusChange(record.id, "APPROVED")}
                />
              </Tooltip>
              <Tooltip title="Reddet">
                <Button 
                  type="primary" 
                  danger 
                  size="small" 
                  className="flex items-center justify-center h-8 w-8"
                  icon={<XCircle size={16} />}
                  onClick={() => handleStatusChange(record.id, "REJECTED")}
                />
              </Tooltip>
            </>
          ) : (
            <Text className="text-[9px] font-black text-slate-300 uppercase">İşlem Tamamlandı</Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 italic font-medium">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
        <div className="space-y-1">
          <Title level={2} className="!m-0 !font-black !tracking-tighter uppercase italic text-slate-900 dark:text-white">İZİN <span className="text-[var(--color-purple-600)]">YÖNETİMİ</span></Title>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Personel izin talepleri ve onay süreçleri</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<Filter size={14} />} className="text-[10px] font-black uppercase tracking-widest h-10 border-none bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm">Filtrele</Button>
          <div className="flex items-center gap-2 px-4 bg-purple-600/10 rounded text-[9px] font-black text-purple-400 uppercase tracking-widest border border-purple-600/20">
            <Clock size={12} /> {requests.filter((r: any) => r.status === "PENDING").length} BEKLEYEN TALEP
          </div>
        </div>
      </div>

      {/* LEAVE TABLE AREA */}
      <Card className="shadow-2xl border-none overflow-hidden bg-white dark:bg-zinc-950" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 12 }}
          className="premium-table"
          locale={{ emptyText: <div className="p-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Herhangi bir izin talebi bulunmuyor</div> }}
        />
      </Card>

      {/* FOOTER INFO */}
      <div className="mt-10 p-6 bg-slate-50 dark:bg-zinc-900/50 rounded border border-slate-100 dark:border-zinc-800 flex items-start gap-4">
        <div className="p-3 bg-white dark:bg-zinc-950 rounded shadow-sm border border-slate-100 dark:border-zinc-800">
          <ShieldCheck className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div className="space-y-1">
          <Text strong className="block text-[11px] uppercase tracking-tight dark:text-slate-200">Onaylama Politikası</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 block max-w-2xl leading-relaxed uppercase tracking-widest font-bold">
            Tüm izin talepleri şirket politikalarına uygun olarak değerlendirilmelidir. Onaylanan talepler personelin izin bakiyesinden otomatik olarak düşülür ve ilgili yöneticilere bildirim gönderilir.
          </Text>
        </div>
      </div>
       <style jsx global>{`
        .premium-table .ant-table {
          background: transparent !important;
          color: ${isDark ? '#94a3b8' : '#475569'} !important;
        }
        .premium-table .ant-table-thead > tr > th {
          background: ${isDark ? '#09090b' : '#f8fafc'} !important;
          color: ${isDark ? '#475569' : '#64748b'} !important;
          border-bottom: 1px solid ${isDark ? '#18181b' : '#e2e8f0'} !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          font-style: italic;
        }
        .premium-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${isDark ? '#18181b' : '#f1f5f9'} !important;
          transition: all 0.3s !important;
        }
        .premium-table .ant-table-tbody > tr:hover > td {
          background: ${isDark ? '#0c0c0e' : '#f8fafc'} !important;
        }
        .premium-table .ant-pagination-item {
          background: transparent !important;
          border-color: ${isDark ? '#27272a' : '#e2e8f0'} !important;
        }
        .premium-table .ant-pagination-item a {
          color: ${isDark ? '#94a3b8' : '#475569'} !important;
        }
        .premium-table .ant-pagination-item-active {
          border-color: #9333ea !important;
        }
        .premium-table .ant-pagination-item-active a {
          color: #9333ea !important;
        }
      `}</style>
    </div>
  );
}
