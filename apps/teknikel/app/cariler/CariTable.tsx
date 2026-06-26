'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Input, Tag, Card, Button, Space } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { revalidateCariler } from '@/app/actions/revalidate';
import { CacheRevalidateButton } from '@/app/components/CacheRevalidateButton';
import PageHeader from '@/components/layout/PageHeader';
import CariEkleDrawer from './CariEkleDrawer';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    <>
      <PageHeader
        title="Cariler (Bilsoft)"
        subtitle={
          <>Toplam <strong>{totalCount}</strong> cari</>
        }
      >
        <Input.Search
          placeholder="Ara..."
          onSearch={handleSearch}
          defaultValue={searchParams.get('q') || ''}
          allowClear
          size="large"
          className="w-[200px]"
        />
        <Link href="/cariler/rapor">
          <Button size="large" icon={<BarChartOutlined />}>
            Rapor
          </Button>
        </Link>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setDrawerOpen(true)}
          className="bg-primary"
        >
          Yeni Cari Ekle
        </Button>
        <CacheRevalidateButton onRevalidate={revalidateCariler} label="Yenile" />
      </PageHeader>

      <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-6">

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

      <CariEkleDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </Card>
    </>
  );
}
