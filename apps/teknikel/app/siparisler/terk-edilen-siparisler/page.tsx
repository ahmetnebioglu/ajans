"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Spin,
  Empty,
  Pagination,
  Card,
  Tag,
  Drawer,
  Divider,
  Space,
} from "antd";
import {
  ExpandOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axios from "axios";

interface AbandonedOrder {
  cart?: { id: number };
  preOrderInfo?: { id: number };
  member?: { id: number };
  customerFirstname?: string;
  customerSurname?: string;
  customerEmail?: string;
  sessionId?: string;
  mailStatus?: number;
  priceWithTax?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

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

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const getMailStatusLabel = (status: number | undefined) => {
  switch (status) {
    case 0:
      return "Mail Gönderilmedi";
    case 1:
      return "Mail Gönderildi";
    default:
      return "Bilinmiyor";
  }
};

const getMailStatusColor = (status: number | undefined) => {
  switch (status) {
    case 0:
      return "warning";
    case 1:
      return "success";
    default:
      return "default";
  }
};

export default function TerkEdilenSiparislerPage() {
  const [orders, setOrders] = useState<AbandonedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AbandonedOrder | null>(
    null
  );
  const limit = 50;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("/api/ideasoft/terk-edilen-siparisler", {
        params: {
          sort: "-id",
          limit,
          page,
        },
      });

      const data = res.data;
      setOrders(Array.isArray(data.data) ? data.data : []);

      if (data.totalCount) {
        setTotalPages(Math.ceil(data.totalCount / limit));
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Orders fetch error:", err);
      setError(err.response?.data?.message || err.message || "Hata oluştu");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      title: "Sepet #",
      dataIndex: ["cart", "id"],
      key: "cartId",
      width: 100,
      render: (id: number) => <span>#{id}</span>,
    },
    {
      title: "Ön Sipariş #",
      dataIndex: ["preOrderInfo", "id"],
      key: "preOrderId",
      width: 120,
      render: (id: number) => (
        <Button
          type="link"
          onClick={() => {
            const order = orders.find((o) => o.preOrderInfo?.id === id);
            if (order) {
              setSelectedOrder(order);
              setDrawerOpen(true);
            }
          }}
          icon={<ExpandOutlined />}
        >
          #{id}
        </Button>
      ),
    },
    {
      title: "Müşteri",
      key: "customer",
      render: (_: any, record: AbandonedOrder) =>
        `${record.customerFirstname || ""} ${record.customerSurname || ""}`,
    },
    {
      title: "E-posta",
      dataIndex: "customerEmail",
      key: "email",
      render: (email: string) => email || "-",
    },
    {
      title: "Mail Durumu",
      dataIndex: "mailStatus",
      key: "mailStatus",
      render: (status: number) => (
        <Tag color={getMailStatusColor(status)}>
          {getMailStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Tutar",
      dataIndex: "priceWithTax",
      key: "priceWithTax",
      align: "right" as const,
      render: (amount: number) => formatPrice(amount),
    },
    {
      title: "Oluşturulma",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Terk Edilmiş Siparişler
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          IdeaSoft'ta terk edilmiş ön siparişleri yönetin
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

      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Toplam {orders.length} sipariş
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Yenile
          </Button>
        </div>

        <Spin spinning={loading}>
          {orders.length === 0 ? (
            <Empty description="Terk edilmiş sipariş bulunamadı" />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={orders}
                rowKey={(record) => record.preOrderInfo?.id || Math.random()}
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

      {/* Detay Drawer */}
      <Drawer
        title={`Ön Sipariş #${selectedOrder?.preOrderInfo?.id} Detayları`}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={500}
      >
        {selectedOrder && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Müşteri Bilgileri */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserOutlined /> Müşteri Bilgileri
              </h3>
              <Divider />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Müşteri ID:
                  </span>
                  <p className="font-medium">#{selectedOrder.member?.id || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Ad Soyad:
                  </span>
                  <p className="font-medium">
                    {selectedOrder.customerFirstname}{" "}
                    {selectedOrder.customerSurname}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    E-posta:
                  </span>
                  <p className="font-medium">
                    {selectedOrder.customerEmail || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sipariş Bilgileri */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarOutlined /> Sipariş Bilgileri
              </h3>
              <Divider />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sepet ID:
                  </span>
                  <p className="font-medium">#{selectedOrder.cart?.id}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Ön Sipariş ID:
                  </span>
                  <p className="font-medium">#{selectedOrder.preOrderInfo?.id}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Session ID:
                  </span>
                  <p className="font-mono text-xs break-all">
                    {selectedOrder.sessionId || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Mail Durumu:
                  </span>
                  <p className="mt-1">
                    <Tag color={getMailStatusColor(selectedOrder.mailStatus)}>
                      {getMailStatusLabel(selectedOrder.mailStatus)}
                    </Tag>
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Toplam Tutar (KDV Dahil):
                  </span>
                  <p className="font-semibold text-lg text-blue-600">
                    {formatPrice(selectedOrder.priceWithTax)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Oluşturulma:
                  </span>
                  <p className="font-medium">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Son Güncelleme:
                  </span>
                  <p className="font-medium">
                    {formatDate(selectedOrder.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
