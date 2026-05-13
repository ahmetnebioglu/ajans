'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Input, Tag, Card, Badge, Tooltip } from 'antd';
import {
  FileTextOutlined,
  BankOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface BilsoftFatura {
  id: number;
  unvan: string;
  cariKod: string;
  cariId?: number;
  fatTarih: string;
  toplam: number;
  kdv: number;
  gtoplam: number;
  odemeSekli?: string;
  faturaTuru?: string;
  fisno?: string;
  eFaturaNo?: string;
  eFaturaDurum?: string;
  adres?: string;
  vd?: string;
  vn?: string;
  cariGrup?: string;
  odenen?: number;
  iskonto?: number;
}

interface FaturaTableProps {
  initialData: BilsoftFatura[];
  totalCount: number;
  currentPage: number;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getFaturaTuruColor = (tur: string | undefined) => {
  if (!tur) return 'default';
  const t = tur.toUpperCase();
  if (t.includes('SATIŞ')) return 'green';
  if (t.includes('ALIM') || t.includes('ALIŞ')) return 'blue';
  if (t.includes('İADE') || t.includes('IADE')) return 'orange';
  return 'default';
};

const getOdemeSekliColor = (sekil: string | undefined) => {
  if (!sekil) return 'default';
  const s = sekil.toLowerCase();
  if (s.includes('kredi') || s.includes('kart')) return 'purple';
  if (s.includes('havale') || s.includes('eft') || s.includes('nakit')) return 'cyan';
  return 'default';
};

export default function FaturaTable({ initialData, totalCount, currentPage }: FaturaTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
      params.set('page', '1');
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

  const columns: ColumnsType<BilsoftFatura> = [
    {
      title: 'Fatura No / Ünvan',
      key: 'unvan',
      render: (_, record) => (
        <Link
          href={`/faturalar/${record.id}`}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {record.unvan || '-'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400">{record.cariKod}</span>
            {record.fisno && (
              <span className="text-[10px] text-slate-400">| Fiş: {record.fisno}</span>
            )}
          </div>
        </Link>
      ),
      sorter: (a, b) => (a.unvan || '').localeCompare(b.unvan || ''),
    },
    {
      title: 'Tarih',
      dataIndex: 'fatTarih',
      key: 'fatTarih',
      render: (text) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-slate-400" style={{ fontSize: 12 }} />
          <span className="text-slate-600 dark:text-slate-300 text-sm">
            {formatDate(text)}
          </span>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.fatTarih || 0).getTime() - new Date(b.fatTarih || 0).getTime(),
    },
    {
      title: 'Fatura Türü',
      dataIndex: 'faturaTuru',
      key: 'faturaTuru',
      render: (tur) =>
        tur ? (
          <Tag color={getFaturaTuruColor(tur)} className="text-[10px] font-bold uppercase">
            {tur}
          </Tag>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      title: 'Ödeme Şekli',
      dataIndex: 'odemeSekli',
      key: 'odemeSekli',
      render: (sekil) =>
        sekil ? (
          <Tag color={getOdemeSekliColor(sekil)} className="text-[10px]">
            {sekil}
          </Tag>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      title: 'Tutar (KDV Hariç)',
      dataIndex: 'toplam',
      key: 'toplam',
      align: 'right',
      render: (val) => (
        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
          {formatCurrency(val)}
        </span>
      ),
      sorter: (a, b) => (a.toplam || 0) - (b.toplam || 0),
    },
    {
      title: 'KDV',
      dataIndex: 'kdv',
      key: 'kdv',
      align: 'right',
      render: (val) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Genel Toplam',
      dataIndex: 'gtoplam',
      key: 'gtoplam',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          {formatCurrency(val)}
        </span>
      ),
      sorter: (a, b) => (a.gtoplam || 0) - (b.gtoplam || 0),
    },
    {
      title: 'E-Fatura',
      dataIndex: 'eFaturaNo',
      key: 'eFaturaNo',
      align: 'center',
      render: (eFaturaNo) =>
        eFaturaNo ? (
          <Tooltip title={eFaturaNo}>
            <Badge status="success" text={<span className="text-[10px] text-emerald-600 font-bold">E-Fatura</span>} />
          </Tooltip>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
  ];

  return (
    <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Input.Search
          placeholder="Ünvan, cari kodu veya fiş no ile ara..."
          onSearch={handleSearch}
          defaultValue={searchParams.get('q') || ''}
          allowClear
          enterButton
          className="max-w-md"
        />
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Toplam <strong>{totalCount}</strong> fatura
        </div>
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
        onRow={(record) => ({
          onClick: () => router.push(`/faturalar/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        className="fatura-table"
      />
    </Card>
  );
}
