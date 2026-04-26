"use client";

import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Tag, Row, Col, Typography, message, Skeleton } from "antd";
import { 
  Briefcase, 
  Users, 
  Clock, 
  FileText,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { getHRSummary, getCandidates } from "../../hr/actions";

const { Title, Text } = Typography;

export default function HRDashboardPage() {
  const [summary, setSummary] = useState({ activeJobs: 0, pendingCandidates: 0, pendingLeaves: 0 });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, candRes] = await Promise.all([
          getHRSummary(),
          getCandidates()
        ]);
        
        if (sumRes.success) setSummary(sumRes.data);
        if (candRes.success) setRecentCandidates(candRes.data.slice(0, 5));
      } catch (err) {
        message.error("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { 
      title: "Aktif İlanlar", 
      value: summary.activeJobs, 
      icon: <Briefcase size={24} className="text-blue-500" />, 
      color: "#1890ff" 
    },
    { 
      title: "Bekleyen Adaylar", 
      value: summary.pendingCandidates, 
      icon: <Users size={24} className="text-emerald-500" />, 
      color: "#52c41a" 
    },
    { 
      title: "Onay Bekleyen İzinler", 
      value: summary.pendingLeaves, 
      icon: <Clock size={24} className="text-orange-500" />, 
      color: "#faad14" 
    },
  ];

  const columns = [
    {
      title: "ADAY",
      dataIndex: "fullName",
      key: "fullName",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <UserCheck size={14} className="text-slate-500" />
          </div>
          <Text strong className="text-[12px] uppercase">{record.firstName} {record.lastName}</Text>
        </div>
      ),
    },
    {
      title: "POZİSYON",
      dataIndex: ["jobPosting", "title"],
      key: "job",
      render: (text: string) => <Tag color="blue">{text || "Genel Başvuru"}</Tag>,
    },
    {
      title: "DURUM",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: any = { NEW: "cyan", REVIEW: "purple", INTERVIEW: "orange", REJECTED: "red", HIRED: "green" };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 italic font-medium">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-3 border-b pb-6 border-slate-900">
         <div className="space-y-1">
            <Title level={2} className="!m-0 !font-black !tracking-tighter uppercase italic text-white">İK <span className="text-[var(--color-purple-600)]">Özet Panosu</span></Title>
            <Text className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Sistem genelindeki güncel İK verileri</Text>
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-[4px]">
            <TrendingUp size={12} className="text-[var(--color-purple-600)]" /> Verimlilik Takibi Aktif
         </div>
      </div>

      {/* STATS CARDS */}
      <Row gutter={[16, 16]}>
        {stats.map((s, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-zinc-900">
              <Skeleton loading={loading} active avatar>
                <Statistic
                  title={<Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.title}</Text>}
                  value={s.value}
                  prefix={s.icon}
                  valueStyle={{ fontWeight: 900, fontStyle: "italic", fontSize: "32px", letterSpacing: "-0.05em" }}
                />
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>

      {/* RECENT APPLICATIONS TABLE */}
      <Card 
        title={
          <div className="flex items-center gap-2 py-2">
            <FileText size={16} className="text-blue-600" />
            <Text className="text-[11px] font-black uppercase tracking-[0.3em]">Son Başvurular</Text>
          </div>
        }
        className="shadow-xl border-none"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={recentCandidates}
          pagination={false}
          loading={loading}
          rowKey="id"
          locale={{ emptyText: "Henüz başvuru bulunmuyor" }}
        />
      </Card>
    </div>
  );
}
