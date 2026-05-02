'use client';

import React, { useState } from 'react';
import { Table, Input, Tag, Card } from 'antd';
import { SearchOutlined, UserOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface BilsoftCari {
  id: number;
  cariKod: string;
  faturaUnvan: string;
  yetkili: string;
  cep: string;
  tel: string;
  mail: string;
  grup: string;
  faturaIl?: string;
  faturaIlce?: string;
}

interface CariTableProps {
  initialData: BilsoftCari[];
}

export default function CariTable({ initialData }: CariTableProps) {
  const [searchText, setSearchText] = useState('');
  const [data] = useState<BilsoftCari[]>(initialData);

  // Arama filtresi
  const filteredData = data.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.faturaUnvan?.toLowerCase().includes(searchLower) ||
      item.yetkili?.toLowerCase().includes(searchLower) ||
      item.cariKod?.toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<BilsoftCari> = [
    {
      title: 'Ünvan / Cari Kod',
      dataIndex: 'faturaUnvan',
      key: 'faturaUnvan',
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{text}</span>
          <span className="text-[10px] text-slate-400">{record.cariKod}</span>
        </div>
      ),
      sorter: (a, b) => a.faturaUnvan.localeCompare(b.faturaUnvan),
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
            <PhoneOutlined className="text-slate-400" size={12} />
            <span>{record.cep || record.tel || '-'}</span>
          </div>
          <span className="text-[11px] text-slate-400">{record.mail}</span>
        </div>
      ),
    },
    {
      title: 'Adres',
      key: 'address',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-xs">
          <HomeOutlined className="text-slate-400" />
          <span>{record.faturaIlce}{record.faturaIl ? ` / ${record.faturaIl}` : ''}</span>
        </div>
      ),
    },
    {
      title: 'Grup',
      dataIndex: 'grup',
      key: 'grup',
      render: (tag) => (
        <Tag color={tag === 'VIP' ? 'gold' : 'blue'} className="text-[10px] uppercase font-bold">
          {tag || 'GENEL'}
        </Tag>
      ),
    },
  ];

  return (
    <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="mb-4">
        <Input.Search
          placeholder="Ünvan veya yetkili ismine göre ara..."
          onSearch={value => setSearchText(value)}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          className="max-w-md dark:bg-slate-800 dark:border-slate-700"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Toplam ${total} kayıt`,
        }}
        className="cari-table"
      />
    </Card>
  );
}
