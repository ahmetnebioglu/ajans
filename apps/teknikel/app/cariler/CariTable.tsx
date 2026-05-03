'use client';

import React from 'react';
import { Table, Input, Tag, Card } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  totalCount: number;
  currentPage: number;
}

export default function CariTable({ initialData, totalCount, currentPage }: CariTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
      params.set('page', '1'); // Arama değişince 1. sayfaya dön
    } else {
      params.delete('q');
      params.set('page', '1');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleTableChange = (pagination: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pagination.current.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns: ColumnsType<BilsoftCari> = [
    {
      title: 'Ünvan / Cari Kod',
      dataIndex: 'faturaUnvan',
      key: 'faturaUnvan',
      render: (text, record) => (
        <a href={`/cariler/${record.id}`} className="flex flex-col hover:opacity-80 transition-opacity">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{text}</span>
          <span className="text-[10px] text-slate-400">{record.cariKod}</span>
        </a>
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
          placeholder="Bilsoft sisteminde ara..."
          onSearch={handleSearch}
          defaultValue={searchParams.get('q') || ''}
          allowClear
          enterButton
          className="max-w-md dark:bg-slate-800 dark:border-slate-700"
        />
      </div>

      <Table
        columns={columns}
        dataSource={initialData}
        rowKey="id"
        size="middle"
        pagination={{
          current: currentPage,
          pageSize: 50,
          total: totalCount,
          showSizeChanger: false,
          showTotal: (total) => `Toplam ${total} kayıt`,
        }}
        onChange={handleTableChange}
        className="cari-table"
      />
    </Card>
  );
}
