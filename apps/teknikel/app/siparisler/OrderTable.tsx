'use client';

import React from 'react';
import { Input, Select, Pagination, Button, Card, Space } from 'antd';
import {
  ShoppingOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import OrderCard from './OrderCard';

interface IdeasoftOrder {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerFirstname: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  memberGroupName?: string;
  paymentTypeName: string;
  paymentProviderName: string;
  paymentStatus?: string;
  shippingCompanyName: string;
  finalAmount: number;
  generalAmount?: number;
  amount: number;
  taxAmount: number;
  shippingAmount: number;
  couponDiscount?: number;
  promotionDiscount?: number;
  installment?: number;
  installmentRate?: number;
  orderItems?: Array<any>;
  shippingAddress?: any;
  billingAddress?: any;
  clientIp?: string;
  transactionId?: string;
  orderDetails?: Array<any>;
  [key: string]: any;
}

interface OrderTableProps {
  initialData: IdeasoftOrder[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  statusFilter: string;
  sort: string;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
};

const getStatusColor = (status: string | undefined) => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s === 'new' || s === 'waiting_for_approval') return 'blue';
  if (s === 'pending' || s === 'waiting_for_payment') return 'orange';
  if (s === 'being_prepared' || s === 'on_accumulation') return 'cyan';
  if (s === 'shipped' || s === 'fulfilled') return 'purple';
  if (s === 'delivered' || s === 'approved') return 'green';
  if (s === 'cancelled' || s === 'deleted') return 'red';
  return 'default';
};

const getStatusLabel = (status: string | undefined) => {
  if (!status) return '-';
  const s = status.toLowerCase();
  const labels: { [key: string]: string } = {
    new: 'Yeni Sipariş',
    waiting_for_approval: 'Onay Bekliyor',
    pending: 'Beklemede',
    waiting_for_payment: 'Ödeme Bekleniyor',
    being_prepared: 'Hazırlanıyor',
    on_accumulation: 'Tedarik Sürecinde',
    shipped: 'Kargoda',
    fulfilled: 'Kargoya Verildi',
    approved: 'Onaylandı',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
    deleted: 'Silinmiş',
  };
  return labels[s] || status;
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'new', label: 'Yeni Sipariş' },
  { value: 'waiting_for_approval', label: 'Onay Bekliyor' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'waiting_for_payment', label: 'Ödeme Bekleniyor' },
  { value: 'being_prepared', label: 'Hazırlanıyor' },
  { value: 'on_accumulation', label: 'Tedarik Sürecinde' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'fulfilled', label: 'Kargoya Verildi' },
  { value: 'approved', label: 'Onaylandı' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
];

const sortOptions = [
  { value: '-id', label: 'En Yeniler' },
  { value: 'id', label: 'En Eskiler' },
  { value: '-finalAmount', label: 'Tutar (Yüksek-Düşük)' },
  { value: 'finalAmount', label: 'Tutar (Düşük-Yüksek)' },
  { value: '-createdAt', label: 'Tarih (Yeni-Eski)' },
  { value: 'createdAt', label: 'Tarih (Eski-Yeni)' },
];

export default function OrderTable({
  initialData,
  totalCount,
  currentPage,
  totalPages,
  statusFilter,
  sort,
}: OrderTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <Card className="shadow-sm border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              className="w-[200px]"
              placeholder="Durum Filtresi"
            />
            <Select
              value={sort}
              onChange={handleSortChange}
              options={sortOptions}
              className="w-[200px]"
              prefix={<SortAscendingOutlined />}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Yenile
            </Button>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam <strong>{totalCount}</strong> sipariş
            {statusFilter && (
              <span> • {getStatusLabel(statusFilter)} filtrelendi</span>
            )}
          </div>
        </div>
      </Card>

      {/* Sipariş Kartları */}
      <div className="space-y-3">
        {initialData.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center py-6">
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={50}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `Toplam ${total} sipariş`}
          />
        </div>
      )}
    </div>
  );
}
