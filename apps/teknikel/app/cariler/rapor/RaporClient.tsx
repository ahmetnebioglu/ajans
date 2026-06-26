'use client';

import React, { useState, useMemo } from 'react';
import { Table, Card, Button, Select, Space, Tag, Typography, Tooltip } from 'antd';
import { ArrowLeftOutlined, MailOutlined, MessageOutlined, CalendarOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

interface RaporCari {
  id: string;
  cariKod: string;
  faturaUnvan: string;
  yetkili: string;
  cep: string;
  tel: string;
  mail: string;
  lastInvoiceDate: string | null;
  monthsSinceLastInvoice: number | null;
}

interface RaporClientProps {
  initialData: RaporCari[];
}

const { Title, Text } = Typography;
const { Option } = Select;

export default function RaporClient({ initialData }: RaporClientProps) {
  const [filterMonth, setFilterMonth] = useState<number>(3); // Default 3 months

  const filteredData = useMemo(() => {
    return initialData.filter(cari => {
      // If never shopped, they count as haven't shopped in the period
      if (cari.monthsSinceLastInvoice === null) return true;
      return cari.monthsSinceLastInvoice >= filterMonth;
    });
  }, [initialData, filterMonth]);

  const handleSendEmail = (record?: RaporCari) => {
    // Action to send email
    console.log("Send email to", record ? record.mail : "selected");
  };

  const handleSendSms = (record?: RaporCari) => {
    // Action to send sms
    console.log("Send sms to", record ? record.cep || record.tel : "selected");
  };

  const columns: ColumnsType<RaporCari> = [
    {
      title: 'Ünvan / Cari Kod',
      dataIndex: 'faturaUnvan',
      key: 'faturaUnvan',
      render: (text, record) => (
        <Link href={`/cariler/${record.id}`} className="flex flex-col hover:opacity-80 transition-opacity">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{text}</span>
          <span className="text-[10px] text-slate-400">{record.cariKod}</span>
        </Link>
      ),
      sorter: (a, b) => (a.faturaUnvan || "").localeCompare(b.faturaUnvan || ""),
    },
    {
      title: 'Yetkili',
      dataIndex: 'yetkili',
      key: 'yetkili',
      render: (text) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">{text || '-'}</span>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <PhoneOutlined className="text-slate-400" style={{ fontSize: 12 }} />
            <span>{record.cep || record.tel || '-'}</span>
          </div>
          <span className="text-[11px] text-slate-400">{record.mail}</span>
        </div>
      ),
    },
    {
      title: 'Son Alışveriş',
      key: 'lastInvoice',
      sorter: (a, b) => {
        const valA = a.monthsSinceLastInvoice ?? 9999;
        const valB = b.monthsSinceLastInvoice ?? 9999;
        return valA - valB;
      },
      render: (_, record) => {
        if (record.lastInvoiceDate) {
          const date = new Date(record.lastInvoiceDate);
          const formattedDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {formattedDate}
              </span>
              <Tag color="volcano" className="w-fit m-0 text-[10px]">
                {record.monthsSinceLastInvoice} ay önce
              </Tag>
            </div>
          );
        }
        return <Tag color="default">Alışveriş Yok</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Mail Gönder">
            <Button 
              type="text" 
              icon={<MailOutlined />} 
              onClick={() => handleSendEmail(record)} 
              className="text-blue-500 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="SMS Gönder">
            <Button 
              type="text" 
              icon={<MessageOutlined />} 
              onClick={() => handleSendSms(record)} 
              className="text-green-500 hover:bg-green-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Link href="/cariler">
          <Button type="link" icon={<ArrowLeftOutlined />} className="p-0 text-slate-500 hover:text-slate-800">
            Carilere Dön
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Alışveriş Yapmayan Cariler Raporu"
        subtitle={
          <>Belirtilen süre zarfında alışveriş yapmayan toplam <strong>{filteredData.length}</strong> cari bulundu.</>
        }
      >
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <CalendarOutlined className="text-slate-400" />
          <Text className="text-slate-600 dark:text-slate-300 font-medium">Süre Seçiniz:</Text>
          <Select 
            value={filterMonth} 
            onChange={(val) => setFilterMonth(val)}
            className="w-[120px]"
            popupMatchSelectWidth={false}
          >
            <Option value={1}>Son 1 Ay</Option>
            <Option value={3}>Son 3 Ay</Option>
            <Option value={6}>Son 6 Ay</Option>
            <Option value={12}>Son 1 Yıl</Option>
          </Select>
        </div>
      </PageHeader>

      <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-6">
        <div className="mb-4 flex justify-end gap-3">
            <Button icon={<MailOutlined />} onClick={() => handleSendEmail()}>
                Toplu Mail Gönder
            </Button>
            <Button icon={<MessageOutlined />} onClick={() => handleSendSms()}>
                Toplu SMS Gönder
            </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
          }}
          className="cari-report-table"
        />
      </Card>
    </>
  );
}
