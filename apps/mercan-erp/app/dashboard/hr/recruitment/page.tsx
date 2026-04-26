"use client";

import React, { useEffect, useState } from "react";
import { 
  Table, 
  Tag, 
  Select, 
  message, 
  Typography, 
  Card,
  Input,
  Button
} from "antd";
import { 
  User, 
  Mail, 
  Phone, 
  Search, 
  Filter,
  UserCheck
} from "lucide-react";
import { 
  getCandidates, 
  updateCandidateStatus 
} from "../../../hr/actions";
import { CandidateStatus } from "@ajans/db";

const { Title, Text } = Typography;

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const candRes = await getCandidates();
      if (candRes.success) setCandidates(candRes.data);
    } catch (err) {
      message.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const res = await updateCandidateStatus(candidateId, newStatus as CandidateStatus);
      if (res.success) {
        message.success("Aday durumu güncellendi");
        setCandidates((prev: any) => 
          prev.map((c: any) => c.id === candidateId ? { ...c, status: newStatus } : c)
        );
      } else {
        message.error(res.error);
      }
    } catch (err) {
      message.error("Hata oluştu");
    }
  };

  const filteredCandidates = candidates.filter((c: any) => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "AD SOYAD",
      key: "name",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-zinc-700">
            <User size={18} className="text-slate-500" />
          </div>
          <div>
            <Text strong className="block text-[13px] uppercase tracking-tight">{record.firstName} {record.lastName}</Text>
            <Text className="text-[11px] text-slate-400">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "BAŞVURULAN POZİSYON",
      dataIndex: ["jobPosting", "title"],
      key: "job",
      render: (text: string) => <Tag color="blue" className="font-bold text-[10px] px-2">{text || "GENEL BAŞVURU"}</Tag>,
    },
    {
      title: "İLETİŞİM",
      key: "contact",
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
            <Mail size={12} /> {record.email}
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
              <Phone size={12} /> {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "DURUM YÖNETİMİ",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          size="middle"
          style={{ width: 150 }}
          className="custom-select"
        >
          <Select.Option value="NEW"><Tag color="cyan">YENİ</Tag></Select.Option>
          <Select.Option value="REVIEW"><Tag color="purple">İNCELEME</Tag></Select.Option>
          <Select.Option value="INTERVIEW"><Tag color="orange">MÜLAKAT</Tag></Select.Option>
          <Select.Option value="REJECTED"><Tag color="red">REDDEDİLDİ</Tag></Select.Option>
          <Select.Option value="HIRED"><Tag color="green">İŞE ALINDI</Tag></Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 italic font-medium">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-900 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            Aday Takip <span className="text-[var(--color-purple-600)]">Sistemi</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">ATS / Başvuru Yönetim Paneli</p>
        </div>
        <div className="flex gap-3">
          <Input 
            prefix={<Search size={14} className="text-slate-600" />}
            placeholder="Aday Ara..."
            className="w-64 h-12 bg-slate-900 border-slate-800 rounded-[4px] text-xs font-black uppercase tracking-widest text-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<Filter size={14} />} className="h-12 border-slate-800 text-xs font-black uppercase tracking-widest bg-slate-900 text-slate-400">Filtrele</Button>
        </div>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white dark:bg-zinc-950" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredCandidates}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="premium-table dark-table"
          locale={{ emptyText: <div className="p-16 text-center text-slate-400 uppercase font-black text-[10px] tracking-[0.5em]">Aday kaydı bulunamadı</div> }}
        />
      </Card>
      <style jsx global>{`
        .dark-table .ant-table {
          background: transparent !important;
          color: #94a3b8 !important;
        }
        .dark-table .ant-table-thead > tr > th {
          background: #09090b !important;
          color: #475569 !important;
          border-bottom: 1px solid #18181b !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          font-style: italic;
        }
        .dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #18181b !important;
          transition: all 0.3s !important;
        }
        .dark-table .ant-table-tbody > tr:hover > td {
          background: #0c0c0e !important;
        }
        .dark-table .ant-pagination-item {
          background: transparent !important;
          border-color: #27272a !important;
        }
        .dark-table .ant-pagination-item-active {
          border-color: #9333ea !important;
        }
        .dark-table .ant-pagination-item-active a {
          color: #9333ea !important;
        }
      `}</style>
    </div>
  );
}
