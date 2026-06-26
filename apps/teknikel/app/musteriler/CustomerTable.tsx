'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, Input, Tag, Card, Tooltip } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { revalidateMusteriler } from '@/app/actions/revalidate';
import { CacheRevalidateButton } from '@/app/components/CacheRevalidateButton';
import PageHeader from '@/components/layout/PageHeader';

interface IdeasoftCustomer {
  id: number;
  firstname: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  mobilePhoneNumber?: string;
  commercialName?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  location?: { name: string };
  district?: string;
  zipCode?: string;
  country?: { name: string };
  status?: string;
  createdAt?: string;
  lastLoginDate?: string;
  updatedAt?: string;
  memberGroup?: { name: string };
  pointAmount?: number;
  kvkkStatus?: number;
  allowedToPhone?: number;
  allowedToSms?: number;
  allowedToCampaigns?: number;
  deviceType?: string;
  lastIp?: string;
  gender?: string;
  birthDate?: string;
  tcId?: string;
}

interface CustomerTableProps {
  initialData: IdeasoftCustomer[];
  totalCount: number;
  currentPage: number;
  error?: string | null;
}

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

const getStatusColor = (status: string | undefined) => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s === 'active') return 'green';
  if (s === 'passive') return 'red';
  return 'default';
};

const getStatusLabel = (status: string | undefined) => {
  if (!status) return '-';
  const s = status.toLowerCase();
  if (s === 'active') return 'Aktif';
  if (s === 'passive') return 'Pasif';
  return status;
};

// Türkçe karakterleri normalize eden fonksiyon
const normalizeTurkish = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i');
};

export default function CustomerTable({
  initialData,
  totalCount,
  currentPage,
  error,
}: CustomerTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filteredData, setFilteredData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Client-side arama (legacy'deki gibi)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(initialData);
      return;
    }

    const searchNormalized = normalizeTurkish(searchTerm);
    const filtered = initialData.filter((customer) => {
      return (
        (customer.id && String(customer.id).includes(searchTerm)) ||
        (customer.firstname &&
          normalizeTurkish(customer.firstname).includes(searchNormalized)) ||
        (customer.surname &&
          normalizeTurkish(customer.surname).includes(searchNormalized)) ||
        (customer.email &&
          normalizeTurkish(customer.email).includes(searchNormalized)) ||
        (customer.phoneNumber &&
          normalizeTurkish(customer.phoneNumber).includes(searchNormalized)) ||
        (customer.mobilePhoneNumber &&
          normalizeTurkish(customer.mobilePhoneNumber).includes(searchNormalized)) ||
        (customer.taxNumber &&
          normalizeTurkish(customer.taxNumber).includes(searchNormalized)) ||
        (customer.commercialName &&
          normalizeTurkish(customer.commercialName).includes(searchNormalized)) ||
        (customer.location?.name &&
          normalizeTurkish(customer.location.name).includes(searchNormalized)) ||
        (customer.memberGroup?.name &&
          normalizeTurkish(customer.memberGroup.name).includes(searchNormalized))
      );
    });

    setFilteredData(filtered);
  }, [searchTerm, initialData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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

  const columns: ColumnsType<IdeasoftCustomer> = [
    {
      title: 'Ad / Soyad',
      key: 'name',
      render: (_, record) => (
        <Link
          href={`/musteriler/${record.id}`}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {record.firstname} {record.surname}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400">ID: {record.id}</span>
            {record.memberGroup && (
              <span className="text-[10px] text-slate-400">
                | {record.memberGroup.name}
              </span>
            )}
          </div>
        </Link>
      ),
      sorter: (a, b) =>
        `${a.firstname} ${a.surname}`.localeCompare(
          `${b.firstname} ${b.surname}`
        ),
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      render: (text) =>
        text ? (
          <div className="flex items-center gap-1">
            <MailOutlined className="text-slate-400" style={{ fontSize: 12 }} />
            <span className="text-slate-600 dark:text-slate-300 text-sm">
              {text}
            </span>
          </div>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
    {
      title: 'Telefon',
      dataIndex: 'mobilePhoneNumber',
      key: 'mobilePhoneNumber',
      render: (text, record) => {
        const phone = text || record.phoneNumber;
        return phone ? (
          <div className="flex items-center gap-1">
            <PhoneOutlined className="text-slate-400" style={{ fontSize: 12 }} />
            <span className="text-slate-600 dark:text-slate-300 text-sm">
              {phone}
            </span>
          </div>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        );
      },
    },
    {
      title: 'Şehir',
      dataIndex: 'location',
      key: 'location',
      render: (location) =>
        location?.name ? (
          <span className="text-slate-600 dark:text-slate-300 text-sm">
            {location.name}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">-</span>
        ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <div className="flex items-center gap-1">
          <CalendarOutlined className="text-slate-400" style={{ fontSize: 12 }} />
          <span className="text-slate-600 dark:text-slate-300 text-sm">
            {formatDate(text)}
          </span>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status ? (
          <Tag color={getStatusColor(status)} className="text-[10px] font-bold">
            {getStatusLabel(status)}
          </Tag>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
  ];

  return (
    <>
      {/* Hata Mesajı */}
      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: "600" }}>IdeaSoft Bağlantı Hatası</div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>{error}</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>
              Lütfen{" "}
              <button
                onClick={() => router.push("/settings")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Ayarlar
              </button>{" "}
              sayfasından IdeaSoft entegrasyonunu kontrol edin.
            </div>
          </div>
        </div>
      )}

      <PageHeader 
        title="Müşteriler"
        subtitle={
          <>
            Toplam <strong>{totalCount}</strong> müşteri
            {searchTerm && (
              <span className="ml-1">
                ({filteredData.length} sonuç bulundu)
              </span>
            )}
          </>
        }
      >
        <Input.Search
          placeholder="Ad, soyad, e-posta, telefon..."
          onSearch={handleSearch}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          className="w-[280px]"
        />
        <CacheRevalidateButton onRevalidate={revalidateMusteriler} label="Yenile" />
      </PageHeader>

      <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-6">

        <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="middle"
        pagination={{
          pageSize: 50,
          showSizeChanger: false,
          showTotal: (total) => `Toplam ${total} kayıt`,
        }}
        onRow={(record) => ({
          onClick: () => router.push(`/musteriler/${record.id}`),
          style: { cursor: 'pointer' },
        })}
          className="customer-table"
        />
      </Card>
    </>
  );
}
