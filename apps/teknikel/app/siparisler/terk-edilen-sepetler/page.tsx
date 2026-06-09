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
  Collapse,
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

interface AbandonedCart {
  cart?: { id: number };
  member?: { id: number; firstname: string; surname: string; email: string };
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

export default function TerkEdilenSepetlerPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const limit = 50;

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("/api/ideasoft/terk-edilen-sepetler", {
        params: {
          sort: "-id",
          limit,
          page,
        },
      });

      const data = res.data;
      setCarts(Array.isArray(data.data) ? data.data : []);

      if (data.totalCount) {
        setTotalPages(Math.ceil(data.totalCount / limit));
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Carts fetch error:", err);
      setError(err.response?.data?.message || err.message || "Hata oluştu");
      setCarts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const columns = [
    {
      title: "Sepet #",
      dataIndex: ["cart", "id"],
      key: "cartId",
      width: 100,
      render: (id: number) => (
        <Button
          type="link"
          onClick={() => {
            const cart = carts.find((c) => c.cart?.id === id);
            if (cart) {
              setSelectedCart(cart);
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
      render: (_: any, record: AbandonedCart) =>
        `${record.member?.firstname || ""} ${record.member?.surname || ""}`,
    },
    {
      title: "E-posta",
      dataIndex: ["member", "email"],
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
          Terk Edilmiş Sepetler
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          IdeaSoft'ta terk edilmiş alışveriş sepetlerini yönetin
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
            Toplam {carts.length} sepet
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCarts}
            loading={loading}
          >
            Yenile
          </Button>
        </div>

        <Spin spinning={loading}>
          {carts.length === 0 ? (
            <Empty description="Terk edilmiş sepet bulunamadı" />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={carts}
                rowKey={(record) => record.cart?.id || Math.random()}
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
        title={`Sepet #${selectedCart?.cart?.id} Detayları`}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={500}
      >
        {selectedCart && (
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
                  <p className="font-medium">#{selectedCart.member?.id || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Ad Soyad:
                  </span>
                  <p className="font-medium">
                    {selectedCart.member?.firstname}{" "}
                    {selectedCart.member?.surname}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    E-posta:
                  </span>
                  <p className="font-medium">
                    {selectedCart.member?.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sepet Bilgileri */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarOutlined /> Sepet Bilgileri
              </h3>
              <Divider />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Sepet ID:
                  </span>
                  <p className="font-medium">#{selectedCart.cart?.id}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Session ID:
                  </span>
                  <p className="font-mono text-xs break-all">
                    {selectedCart.sessionId || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Mail Durumu:
                  </span>
                  <p className="mt-1">
                    <Tag color={getMailStatusColor(selectedCart.mailStatus)}>
                      {getMailStatusLabel(selectedCart.mailStatus)}
                    </Tag>
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Toplam Tutar (KDV Dahil):
                  </span>
                  <p className="font-semibold text-lg text-blue-600">
                    {formatPrice(selectedCart.priceWithTax)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Oluşturulma:
                  </span>
                  <p className="font-medium">
                    {formatDate(selectedCart.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Son Güncelleme:
                  </span>
                  <p className="font-medium">
                    {formatDate(selectedCart.updatedAt)}
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
