"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Spin,
  Empty,
  Pagination,
  Tag,
  Space,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import Link from "next/link";

interface IyzicoPayment {
  _id: string;
  orderReferenceCode: string;
  customerReferenceCode: string;
  iyziEventType: string;
  status: string;
  eventDate: string;
  processed: boolean;
  error?: {
    hasError: boolean;
    errorMessage?: string;
  };
  createdAt: string;
}

const getStatusColor = (status: string) => {
  if (status === "success") return "green";
  if (status === "failure") return "red";
  if (status === "pending") return "orange";
  if (status === "refunded") return "blue";
  return "default";
};

const getEventTypeColor = (eventType: string) => {
  if (eventType.includes("success")) return "green";
  if (eventType.includes("failure")) return "red";
  if (eventType.includes("refund")) return "blue";
  return "default";
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

export default function OdemelerClient() {
  const [payments, setPayments] = useState<IyzicoPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  const limit = 20;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (eventTypeFilter !== "all") {
        params.eventType = eventTypeFilter;
      }

      const response = await axios.get("/api/iyzico/payments", { params });

      setPayments(response.data.payments);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(
        err.response?.data?.message || "Ödemeler yüklenirken hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, eventTypeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchPayments();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const columns = [
    {
      title: "Order Reference",
      dataIndex: "orderReferenceCode",
      key: "orderReferenceCode",
      render: (text: string) => (
        <span className="font-mono text-sm">{text}</span>
      ),
    },
    {
      title: "Customer Reference",
      dataIndex: "customerReferenceCode",
      key: "customerReferenceCode",
      render: (text: string) => (
        <span className="font-mono text-sm">{text}</span>
      ),
    },
    {
      title: "Event Type",
      dataIndex: "iyziEventType",
      key: "iyziEventType",
      render: (eventType: string) => (
        <Tag color={getEventTypeColor(eventType)}>{eventType}</Tag>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === "success"
            ? "Başarılı"
            : status === "failure"
              ? "Başarısız"
              : status === "pending"
                ? "Beklemede"
                : status === "refunded"
                  ? "İade Edildi"
                  : status}
        </Tag>
      ),
    },
    {
      title: "Event Zamanı",
      dataIndex: "eventDate",
      key: "eventDate",
      render: (date: string) => formatDate(date),
    },
    {
      title: "İşlenme",
      key: "processed",
      render: (_: any, record: IyzicoPayment) => {
        if (record.processed) {
          return <Tag color="green">İşlendi</Tag>;
        }
        if (record.error?.hasError) {
          return <Tag color="red">Hatalı</Tag>;
        }
        return <Tag>Beklemede</Tag>;
      },
    },
    {
      title: "İşlemler",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: IyzicoPayment) => (
        <Link href={`/odemeler/${record._id}`}>
          <Button type="link" size="small">
            Detay
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Iyzico Ödemeleri
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Webhook ile gelen tüm ödeme kayıtları
        </p>
      </div>

      {error && (
        <div
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
          style={{
            backgroundColor: "#fee2e2",
            borderColor: "#fecaca",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      <Card className="shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Arama</label>
            <Input
              placeholder="Order Reference, Customer Reference..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-2">Durum</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Tümü" },
                { value: "success", label: "Başarılı" },
                { value: "failure", label: "Başarısız" },
                { value: "pending", label: "Beklemede" },
                { value: "refunded", label: "İade Edildi" },
              ]}
            />
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Event Tipi</label>
            <Select
              value={eventTypeFilter}
              onChange={setEventTypeFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Tümü" },
                {
                  value: "subscription.order.success",
                  label: "Abonelik Başarılı",
                },
                {
                  value: "subscription.order.failure",
                  label: "Abonelik Başarısız",
                },
                { value: "payment.success", label: "Ödeme Başarılı" },
                { value: "payment.failure", label: "Ödeme Başarısız" },
                { value: "refund", label: "İade" },
              ]}
            />
          </div>

          <Space>
            <Button type="primary" onClick={handleSearch}>
              Ara
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPayments}
              loading={loading}
            />
          </Space>
        </div>
      </Card>

      <Card className="shadow-sm">
        <Spin spinning={loading}>
          {payments.length === 0 ? (
            <Empty description="Ödeme kaydı bulunamadı" />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={payments}
                rowKey="_id"
                pagination={false}
                size="small"
              />

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={page}
                    total={totalPages * limit}
                    pageSize={limit}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
}
