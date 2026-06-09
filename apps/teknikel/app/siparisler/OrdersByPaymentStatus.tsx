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
} from "antd";
import { ExpandOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

interface IdeasoftOrder {
  id: number;
  status: string;
  createdAt: string;
  customerFirstname: string;
  customerSurname: string;
  paymentStatus?: string;
  finalAmount: number;
  transactionId?: string;
  paymentProviderName?: string;
  [key: string]: any;
}

interface OrdersByPaymentStatusProps {
  title: string;
  params: {
    paymentProviderCode?: string;
    paymentStatus?: string;
    limit?: number;
  };
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

const normalizePaymentStatus = (status: string | undefined) => {
  if (!status) return "-";
  const s = String(status).toLowerCase();
  if (s === "failure" || s === "failed") return "Hatalı";
  if (s === "in_transaction") return "İşlemde";
  return status;
};

export default function OrdersByPaymentStatus({
  title,
  params,
}: OrdersByPaymentStatusProps) {
  const [orders, setOrders] = useState<IdeasoftOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [checks, setChecks] = useState<
    Record<number, { loading: boolean; data: any; error: any }>
  >({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const localLimit = params.limit || 100;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("/api/ideasoft/siparisler", {
        params: {
          sort: "-id",
          limit: localLimit,
          page,
          ...params,
        },
      });

      let dataArr: IdeasoftOrder[] = [];
      if (Array.isArray(res.data)) dataArr = res.data;
      else if (Array.isArray(res.data?.data)) dataArr = res.data.data;
      else if (Array.isArray(res.data?.orders)) dataArr = res.data.orders;
      else if (Array.isArray(res.data?.result)) dataArr = res.data.result;

      const filtered = dataArr.filter(
        (o) =>
          (o?.paymentProviderCode === "Iyzico" ||
            o?.paymentProviderName === "Iyzico") &&
          (params.paymentStatus ? o?.paymentStatus === params.paymentStatus : true)
      );

      setOrders(filtered);

      try {
        const src = res.data || {};
        const total =
          src.total ||
          src.totalCount ||
          src.count ||
          src.totalRecords ||
          src.meta?.total ||
          src.pagination?.total ||
          null;
        if (total != null)
          setTotalPages(Math.max(1, Math.ceil(total / localLimit)));
        else setTotalPages(1);
      } catch (e) {
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Orders fetch error:", err);
      setError(err.response?.data?.message || err.message || "Hata oluştu");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [params, page, localLimit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const checkIyzico = async (order: IdeasoftOrder) => {
    const id = order.id;
    setChecks((s) => ({
      ...s,
      [id]: { loading: true, data: null, error: null },
    }));
    try {
      const resp = await axios.post("/api/iyzico/payments/check-payment", {
        orderId: order.id,
        transactionId: order.transactionId || null,
      });
      setChecks((s) => ({
        ...s,
        [id]: { loading: false, data: resp.data, error: null },
      }));
    } catch (err: any) {
      setChecks((s) => ({
        ...s,
        [id]: {
          loading: false,
          data: null,
          error: err.response?.data || err.message,
        },
      }));
    }
  };

  const columns = [
    {
      title: "Sipariş #",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: number) => (
        <Button
          type="link"
          onClick={() => setExpandedId(expandedId === id ? null : id)}
          icon={<ExpandOutlined />}
        >
          #{id}
        </Button>
      ),
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Müşteri",
      key: "customer",
      render: (_: any, record: IdeasoftOrder) =>
        `${record.customerFirstname || ""} ${record.customerSurname || ""}`,
    },
    {
      title: "Ödeme Durumu",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => (
        <Tag color={status === "failed" ? "red" : "orange"}>
          {normalizePaymentStatus(status)}
        </Tag>
      ),
    },
    {
      title: "Tutar",
      dataIndex: "finalAmount",
      key: "finalAmount",
      align: "right" as const,
      render: (amount: number) => formatPrice(amount),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Iyzico ödeme sorunları olan siparişler
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
            <Empty description="Sipariş bulunamadı" />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                pagination={false}
                size="small"
              />

              {/* Expanded Details */}
              {expandedId && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {orders
                    .filter((o) => o.id === expandedId)
                    .map((order) => (
                      <div key={order.id}>
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">
                            Sipariş #{order.id} Detayları
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">
                                Ödeme Sağlayıcı:
                              </span>
                              <p className="font-medium">
                                {order.paymentProviderName ||
                                  order.paymentProviderCode ||
                                  "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">
                                Ödeme Durumu:
                              </span>
                              <p className="font-medium">
                                {normalizePaymentStatus(order.paymentStatus)}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">
                                Tutar:
                              </span>
                              <p className="font-medium">
                                {formatPrice(order.finalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="primary"
                            onClick={() => checkIyzico(order)}
                            loading={checks[order.id]?.loading}
                          >
                            Iyzico Ödeme Kontrolü
                          </Button>
                        </div>

                        {/* Check Result */}
                        {checks[order.id]?.data && (
                          <div className="mt-4 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                            <h4 className="font-semibold mb-2">
                              Iyzico Ödeme Bilgisi
                            </h4>
                            <div className="text-sm space-y-1">
                              {checks[order.id].data.data?.status && (
                                <p>
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Durum:
                                  </span>{" "}
                                  {checks[order.id].data.data.status}
                                </p>
                              )}
                              {checks[order.id].data.data?.paymentId && (
                                <p>
                                  <span className="text-slate-600 dark:text-slate-400">
                                    PaymentId:
                                  </span>{" "}
                                  {checks[order.id].data.data.paymentId}
                                </p>
                              )}
                              {checks[order.id].data.data?.price && (
                                <p>
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Tutar:
                                  </span>{" "}
                                  {formatPrice(checks[order.id].data.data.price)}
                                </p>
                              )}
                              {checks[order.id].data.data?.installment && (
                                <p>
                                  <span className="text-slate-600 dark:text-slate-400">
                                    Taksit:
                                  </span>{" "}
                                  {checks[order.id].data.data.installment}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {checks[order.id]?.error && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                            {typeof checks[order.id].error === "string"
                              ? checks[order.id].error
                              : JSON.stringify(checks[order.id].error)}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </Spin>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              total={totalPages * localLimit}
              pageSize={localLimit}
              onChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
