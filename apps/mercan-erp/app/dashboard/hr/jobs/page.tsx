"use client";

import React, { useEffect, useState } from "react";
import { 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Typography, 
  Card,
  Badge
} from "antd";
import { 
  Plus, 
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import { 
  getJobPostings, 
  createJobPosting 
} from "../../../hr/actions";

const { Title, Text } = Typography;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await getJobPostings();
      if (jobsRes.success) setJobs(jobsRes.data);
    } catch (err) {
      message.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (values: any) => {
    try {
      const res = await createJobPosting(values);
      if (res.success) {
        message.success("İş ilanı başarıyla yayınlandı");
        setIsModalOpen(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(res.error);
      }
    } catch (err) {
      message.error("Hata oluştu");
    }
  };

  const columns = [
    {
      title: "İLAN BAŞLIĞI",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-zinc-800 rounded flex items-center justify-center">
            <Briefcase size={18} className="text-indigo-600" />
          </div>
          <Text strong className="text-[13px] uppercase tracking-tight">{text}</Text>
        </div>
      ),
    },
    {
      title: "DURUM",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "orange"} className="font-black text-[10px] px-2">
          {status === "ACTIVE" ? "YAYINDA" : "TASLAK"}
        </Tag>
      ),
    },
    {
      title: "ADAY SAYISI",
      dataIndex: ["_count", "candidates"],
      key: "count",
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <Badge count={count} showZero color="#6366f1" className="font-black" />
          <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Başvuru</Text>
        </div>
      ),
    },
    {
      title: "OLUŞTURMA TARİHİ",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold italic">
          <Clock size={12} /> {new Date(date).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 italic font-medium">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-900 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            İş <span className="text-[var(--color-purple-600)]">İlanları</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Aktif Pozisyonlar ve İlan Yönetimi</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          className="h-12 bg-purple-600 text-xs font-black uppercase tracking-widest px-8 shadow-xl shadow-purple-600/20"
          onClick={() => setIsModalOpen(true)}
        >
          Yeni İlan Yayınla
        </Button>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white dark:bg-zinc-950" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={jobs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="premium-table dark-table"
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

      <Modal
        title={<Text className="text-[14px] font-black uppercase tracking-[0.4em] italic">YENİ POZİSYON OLUŞTUR</Text>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateJob}
          className="mt-8"
        >
          <Form.Item
            label={<Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">İlan Başlığı</Text>}
            name="title"
            rules={[{ required: true, message: 'Pozisyon adı gereklidir' }]}
          >
            <Input placeholder="Örn: Kıdemli React Geliştirici" className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded" />
          </Form.Item>
          <Form.Item
            label={<Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detaylı İş Tanımı</Text>}
            name="description"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <Input.TextArea rows={8} placeholder="Beklentiler, yetkinlikler ve yan haklar..." className="bg-slate-50 dark:bg-zinc-800 border-none rounded p-4" />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)} className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-none bg-slate-100 dark:bg-zinc-800">İptal</Button>
            <Button type="primary" htmlType="submit" className="h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-indigo-600">Yayınla</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
