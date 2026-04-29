"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Badge, 
  Progress, 
  Typography,
  Avatar,
  App,
  Card,
  Statistic,
  Popconfirm
} from "antd";
import { 
  PhoneOutlined, 
  FireOutlined,
  SendOutlined,
  StarOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  StarFilled
} from "@ant-design/icons";
import { Trash2 } from "lucide-react";
import { deleteLead, toggleVipStatus } from "../leads/actions";

const { Text } = Typography;

export default function VipLeadsPage() {
  const { message: antdMessage } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadVipLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads?vip=true', { cache: 'no-store' });
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
      } else {
        antdMessage.error("Veriler getirilirken bir sorun çıktı.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      antdMessage.error("Sunucuya ulaşılamadı, lütfen internetinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVipLeads();
  }, []);

  const handleDelete = async (id: string) => {
    const hide = antdMessage.loading('Siliniyor...', 0);
    try {
      const res = await deleteLead(id);
      hide();
      if (res.success) {
        antdMessage.success('Kayıt başarıyla silindi.');
        loadVipLeads();
      } else {
        antdMessage.error('Silme işlemi başarısız: ' + res.error);
      }
    } catch (err) {
      hide();
      antdMessage.error('Beklenmedik bir sorun oluştu, lütfen tekrar deneyin.');
    }
  };

  const handleToggleVip = async (id: string, currentStatus: string) => {
    const hide = antdMessage.loading('Güncelleniyor...', 0);
    const res = await toggleVipStatus(id, currentStatus);
    hide();
    if (res.success) {
      antdMessage.success(`Kayıt ${res.newStatus === 'VIP' ? 'Özel listeye alındı' : 'Normal listeye alındı'}.`);
      loadVipLeads();
    } else {
      antdMessage.error('Bir sorun çıktı: ' + res.error);
    }
  };

  const handleBulkSms = () => {
    antdMessage.success("Seçili özel müşterilere toplu mesaj kampanyası başlatıldı.");
  };

  const columns = [
    {
      title: "Dükkan & Usta Adı",
      dataIndex: "companyName",
      key: "companyName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar size={32} className="bg-red-50 dark:bg-red-900/20 text-primary font-bold rounded">
            {text ? text[0] : 'V'}
          </Avatar>
          <div className="flex flex-col">
            <Text className="text-[13px] font-semibold text-slate-800 dark:text-white">{text || 'İsimsiz Firma'}</Text>
            <Text className="text-[11px] text-slate-400 dark:text-slate-500">{record.name || 'Bilinmiyor'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Güven Puanı",
      dataIndex: "score",
      key: "score",
      sorter: (a: any, b: any) => a.score - b.score,
      render: (score: number) => (
        <div className="w-24">
          <Progress 
            percent={score} 
            size="small" 
            strokeColor="hsl(var(--primary))" 
            showInfo={false}
          />
          <span className="text-[10px] font-bold text-primary">{score}%</span>
        </div>
      ),
    },
    {
      title: "Nereden Geldi",
      dataIndex: "source",
      key: "source",
      render: (source: string) => (
        <Tag color="error" className="text-[10px] uppercase font-bold">{source}</Tag>
      ),
    },
    {
      title: "Mevcut Durum",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        const displayStatus = status || 'VIP';
        return (
          <div className="flex flex-col gap-1">
            <Tag color="blue" className="text-[10px] font-bold uppercase rounded m-0 w-fit">
              {displayStatus === 'VIP' ? 'Özel Müşteri' : displayStatus}
            </Tag>
            {record.communicationOptIn === false && (
              <Tag color="default" className="text-[9px] font-bold uppercase rounded m-0 w-fit opacity-60">
                MESAJ İSTEMİYOR
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Son İşlem",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => (
        <span className="text-[11px] text-slate-500">{new Date(date).toLocaleDateString('tr-TR')}</span>
      ),
    },
    {
      title: "İşlem",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            size="small"
            type="text" 
            icon={record.status === 'VIP' ? <StarFilled className="text-amber-500" /> : <StarOutlined className="text-slate-400" />} 
            onClick={() => handleToggleVip(record.id, record.status)}
          />
          <Button size="small" icon={<PhoneOutlined />} type="primary" className="bg-primary">Ara</Button>
          <Button size="small" icon={<ArrowRightOutlined />} />
          <Popconfirm
            title="Kaydı Sil"
            description="Bu özel müşteriyi silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet, Sil"
            cancelText="Hayır"
            okButtonProps={{ danger: true, size: 'small' }}
            cancelButtonProps={{ size: 'small' }}
          >
            <Button 
              size="small" 
              danger 
              type="text"
              icon={<Trash2 size={14} />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Özel Müşteriler (VIP)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">En güvenilir usta ve dükkanların listesi</p>
        </div>
        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-2 rounded-md flex items-center gap-3">
          <span className="text-[11px] font-bold text-primary uppercase">Hızlı İşlem Menüsü:</span>
          <Button 
            size="small" 
            type="primary" 
            danger 
            icon={<SendOutlined />}
            onClick={handleBulkSms}
            className="bg-primary border-none hover:bg-primary/90 shadow-sm"
          >
            Toplu Mesaj Gönder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card size="small" className="border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
          <Statistic
            title={<span className="text-[11px] uppercase font-bold text-slate-400">Özel Müşteri Sayısı</span>}
            value={data.length}
            prefix={<StarOutlined className="text-primary" />}
          />
        </Card>
        <Card size="small" className="border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
          <Statistic
            title={<span className="text-[11px] uppercase font-bold text-slate-400">Ortalama Güven</span>}
            value={data.length > 0 ? Math.round(data.reduce((acc: number, curr: any) => acc + curr.score, 0) / data.length) : 0}
            suffix="%"
            prefix={<FireOutlined className="text-rose-500" />}
          />
        </Card>
        <Card size="small" className="border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
          <Statistic
            title={<span className="text-[11px] uppercase font-bold text-slate-400">Bugünkü Hareketler</span>}
            value={12}
            prefix={<ArrowRightOutlined className="text-blue-500" />}
          />
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table 
          size="small"
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
