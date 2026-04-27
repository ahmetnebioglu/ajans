"use client";

import React from "react";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import { 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function CustomerDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 italic font-medium">
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
          HOŞ GELDİNİZ, <span className="text-indigo-600">MERCAN GRUP</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Müşteri Portalı Özet ve Hızlı İşlem Panosu</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700">
             <Statistic 
               title={<span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Aktif Firmalar</span>}
               value={2} 
               valueStyle={{ color: 'white', fontWeight: 900, fontSize: '32px' }}
               prefix={<Building2 className="text-white/50 mr-2" />}
             />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
             <Statistic 
               title={<span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Toplam Raporlar</span>}
               value={48} 
               valueStyle={{ color: '#4f46e5', fontWeight: 900, fontSize: '32px' }}
               prefix={<FileText className="text-slate-200 mr-2" />}
             />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
             <Statistic 
               title={<span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Bekleyen İşlemler</span>}
               value={3} 
               valueStyle={{ color: '#f59e0b', fontWeight: 900, fontSize: '32px' }}
               prefix={<Clock className="text-slate-200 mr-2" />}
             />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
             <Statistic 
               title={<span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sistem Durumu</span>}
               value="Aktif" 
               valueStyle={{ color: '#10b981', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase' }}
               prefix={<CheckCircle2 className="text-slate-200 mr-2" size={24} />}
             />
          </Card>
        </Col>
      </Row>

      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
             <Clock className="text-indigo-600" size={14} /> Son İşlemler
           </h3>
        </div>
        <Table 
          columns={[
            { title: 'Tarih', dataIndex: 'date', key: 'date', render: (t) => <span className="text-[10px] font-bold text-slate-500">{t}</span> },
            { title: 'İşlem', dataIndex: 'action', key: 'action', render: (t) => <Tag color="blue" className="font-black text-[9px] uppercase tracking-widest">{t}</Tag> },
            { title: 'Firma', dataIndex: 'company', key: 'company', render: (t) => <span className="text-[10px] font-black uppercase text-indigo-500">{t}</span> },
            { title: 'Durum', dataIndex: 'status', key: 'status', render: (t) => <Tag color="green" className="font-bold text-[9px] uppercase">{t}</Tag> },
          ]}
          dataSource={[
            { key: '1', date: '27.04.2026 10:30', action: 'Rapor Görüntüleme', company: 'Mercan Grup Lojistik', status: 'Tamamlandı' },
            { key: '2', date: '26.04.2026 15:45', action: 'Profil Güncelleme', company: 'Genel', status: 'Başarılı' },
            { key: '3', date: '25.04.2026 09:12', action: 'Firma Bilgi Güncelleme', company: 'Tekno Lojistik Ltd.', status: 'Onaylandı' },
          ]}
          pagination={false}
          className="ant-table-custom"
        />
      </div>
    </div>
  );
}
