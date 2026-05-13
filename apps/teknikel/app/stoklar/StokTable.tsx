'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Input, Tag, Card, Tooltip, Progress, Button, Modal, Alert, Spin, message, InputNumber } from 'antd';
import {
  BarcodeOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSyncContext } from '@/src/context/SyncContext';
import SingleSyncModal from './SingleSyncModal';

interface BilsoftStokKarti {
  id?: number;
  kod: string;
  ad: string;
  barkod?: string;
  birim?: string;
  grup?: string;
  sFiyat?: number;
  aFiyat?: number;
  kdvOran?: number;
  kdvDahil?: string;
  bakiye?: number;
  giris?: number;
  cikis?: number;
  stokRafi?: string;
  stokMarka?: string;
  stokOzelKod1?: string;
  stokOzelKod2?: string;
  subeAdi?: string;
  kullaniciAdi?: string;
  otvOran?: string;
  oivOran?: string;
  resimYolu?: string;
  aliciUrunKodu?: string;
  saticiUrunKodu?: string;
}

interface StokTableProps {
  initialData: BilsoftStokKarti[];
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

const parseNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  try {
    const cleaned = String(v).replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
};

const getStockStatus = (bakiye: number) => {
  if (bakiye <= 0) return { color: 'error', label: 'Tükendi', icon: <CloseCircleOutlined /> };
  if (bakiye <= 5) return { color: 'warning', label: 'Kritik', icon: <WarningOutlined /> };
  return { color: 'success', label: 'Stokta', icon: <CheckCircleOutlined /> };
};

export default function StokTable({ initialData, totalCount, currentPage }: StokTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Global sync context
  const {
    openSyncModal,
    closeSyncModal,
  } = useSyncContext();

  // Local state for single sync modal
  const [singleSyncModalOpen, setSingleSyncModalOpen] = useState(false);
  const [selectedStok, setSelectedStok] = useState<BilsoftStokKarti | null>(null);

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

  const columns: ColumnsType<BilsoftStokKarti> = [
    {
      title: 'Stok Kodu / Adı',
      key: 'ad',
      render: (_, record) => (
        <Link
          href={`/stoklar/${encodeURIComponent(record.kod)}`}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {record.ad || '-'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
              {record.kod}
            </span>
            {record.stokMarka && (
              <span className="text-[10px] text-slate-400">{record.stokMarka}</span>
            )}
          </div>
        </Link>
      ),
      sorter: (a, b) => (a.ad || '').localeCompare(b.ad || ''),
    },
    {
      title: 'Barkod',
      dataIndex: 'barkod',
      key: 'barkod',
      render: (text) =>
        text ? (
          <div className="flex items-center gap-1">
            <BarcodeOutlined className="text-slate-400" style={{ fontSize: 12 }} />
            <span className="font-mono text-xs text-slate-500">{text}</span>
          </div>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
    {
      title: 'Grup',
      dataIndex: 'grup',
      key: 'grup',
      render: (tag) =>
        tag ? (
          <Tag color="blue" className="text-[10px] uppercase font-bold">
            {tag}
          </Tag>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
    {
      title: 'Birim',
      dataIndex: 'birim',
      key: 'birim',
      render: (val) => (
        <span className="text-slate-500 text-sm">{val || '-'}</span>
      ),
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'aFiyat',
      key: 'aFiyat',
      align: 'right',
      render: (val) => (
        <span className="text-emerald-600 font-medium text-sm">
          {formatCurrency(val)}
        </span>
      ),
      sorter: (a, b) => (a.aFiyat || 0) - (b.aFiyat || 0),
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'sFiyat',
      key: 'sFiyat',
      align: 'right',
      render: (val) => (
        <span className="text-rose-600 font-medium text-sm">
          {formatCurrency(val)}
        </span>
      ),
      sorter: (a, b) => (a.sFiyat || 0) - (b.sFiyat || 0),
    },
    {
      title: 'KDV %',
      dataIndex: 'kdvOran',
      key: 'kdvOran',
      align: 'center',
      render: (val) =>
        val != null ? (
          <Tag color="geekblue" className="text-[10px]">
            %{val}
          </Tag>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
    {
      title: 'Stok',
      dataIndex: 'bakiye',
      key: 'bakiye',
      align: 'right',
      render: (val) => {
        const amount = parseNumber(val);
        const status = getStockStatus(amount);
        return (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`font-bold text-sm ${
                status.color === 'error'
                  ? 'text-rose-500'
                  : status.color === 'warning'
                  ? 'text-amber-500'
                  : 'text-emerald-600'
              }`}
            >
              {amount}
            </span>
            <Tag
              icon={status.icon}
              color={status.color}
              className="text-[9px] m-0 leading-none"
            >
              {status.label}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => parseNumber(a.bakiye) - parseNumber(b.bakiye),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<LinkOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStok(record);
            setSingleSyncModalOpen(true);
          }}
        >
          Eşle
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Input.Search
              placeholder="Stok kodu, adı veya barkod ile ara..."
              onSearch={handleSearch}
              defaultValue={searchParams.get('q') || ''}
              allowClear
              enterButton
              className="max-w-md"
            />
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Toplam <strong>{totalCount}</strong> stok kartı
            </div>
          </div>
          <Button
            icon={<SyncOutlined />}
            onClick={openSyncModal}
            type="primary"
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Stok & Fiyat Senkronizasyonu
          </Button>
        </div>
      </Card>

      <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Table
          columns={columns}
          dataSource={initialData}
          rowKey="kod"
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
            onClick: () => router.push(`/stoklar/${encodeURIComponent(record.kod)}`),
            style: { cursor: 'pointer' },
          })}
          className="stok-table"
        />
      </Card>

      {/* Modal artık FloatingSyncWidget tarafından yönetiliyor */}

      {/* Single Sync Modal */}
      {selectedStok && (
        <SingleSyncModal
          open={singleSyncModalOpen}
          onClose={() => {
            setSingleSyncModalOpen(false);
            setSelectedStok(null);
          }}
          bilsoftKod={selectedStok.kod}
          bilsoftAd={selectedStok.ad}
        />
      )}
    </>
  );
}
