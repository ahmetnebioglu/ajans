"use client";

import React from "react";
import { Input, Select, Button, Dropdown, Modal, Radio } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  DownOutlined,
  FileAddOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { printEmptyOrder } from "./utils/printOrder";
import OrderCard from "./OrderCard";

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

const getStatusLabel = (status: string | undefined) => {
  if (!status) return "-";
  const s = status.toLowerCase();
  const labels: { [key: string]: string } = {
    new: "Yeni Sipariş",
    waiting_for_approval: "Onay Bekliyor",
    pending: "Beklemede",
    waiting_for_payment: "Ödeme Bekleniyor",
    being_prepared: "Hazırlanıyor",
    on_accumulation: "Tedarik Sürecinde",
    shipped: "Kargoda",
    fulfilled: "Kargoya Verildi",
    approved: "Onaylandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    deleted: "Silinmiş",
  };
  return labels[s] || status;
};

const statusOptions = [
  { value: "", label: "Tüm Durumlar" },
  { value: "new", label: "Yeni Sipariş" },
  { value: "waiting_for_approval", label: "Onay Bekliyor" },
  { value: "pending", label: "Beklemede" },
  { value: "waiting_for_payment", label: "Ödeme Bekleniyor" },
  { value: "being_prepared", label: "Hazırlanıyor" },
  { value: "on_accumulation", label: "Tedarik Sürecinde" },
  { value: "shipped", label: "Kargoda" },
  { value: "fulfilled", label: "Kargoya Verildi" },
  { value: "approved", label: "Onaylandı" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal Edildi" },
];

const sortOptions = [
  { value: "-id", label: "En Yeniden ..." },
  { value: "id", label: "En Eskiden ..." },
  { value: "-finalAmount", label: "Tutar (Yüksek-Düşük)" },
  { value: "finalAmount", label: "Tutar (Düşük-Yüksek)" },
  { value: "-createdAt", label: "Tarih (Yeni-Eski)" },
  { value: "createdAt", label: "Tarih (Eski-Yeni)" },
];

const pageSizeOptions = [
  { value: "20", label: "20 Sipariş" },
  { value: "50", label: "50 Sipariş" },
  { value: "100", label: "100 Sipariş" },
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
  const [searchText, setSearchText] = React.useState("");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Boş şablon yazdırma state
  const [emptyPrintOpen, setEmptyPrintOpen] = React.useState(false);
  const [emptyPageFormat, setEmptyPageFormat] = React.useState<"A4" | "A5">(
    "A5",
  );

  const c = {
    mutedText: isDark ? "#94a3b8" : "#6b7280",
    strongText: isDark ? "#f8fafc" : "#374151",
    emptyBg: isDark ? "#0f172a" : "#ffffff",
    emptyBorder: isDark ? "#1e293b" : "#e5e7eb",
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleEmptyPrint = () => {
    printEmptyOrder(emptyPageFormat);
    setEmptyPrintOpen(false);
  };

  // "Diğer sayfalar" dropdown menüsü
  const otherPagesMenu: MenuProps = {
    items: [
      {
        key: "musteriler",
        label: "Müşteriler",
        onClick: () => router.push("/musteriler"),
      },
      {
        key: "urunler",
        label: "Ürünler",
        onClick: () => router.push("/urunler"),
      },
      {
        key: "sepet-ara",
        label: "Sepet Ara",
        onClick: () => router.push("/sepet-ara"),
      },
    ],
  };

  // Sayfa numaralarını oluştur
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Müşteri arama filtresi (client-side)
  const filteredOrders = searchText.trim()
    ? initialData.filter((o) => {
        const fullName =
          `${o.customerFirstname} ${o.customerSurname}`.toLowerCase();
        const email = (o.customerEmail || "").toLowerCase();
        const phone = (o.customerPhone || "").toLowerCase();
        const q = searchText.toLowerCase();
        return fullName.includes(q) || email.includes(q) || phone.includes(q);
      })
    : initialData;

  // Mevcut page size
  const currentLimit = searchParams.get("limit") || "50";

  return (
    <>
      {/* Üst Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
        className="mx-2 sticky top-2 z-10 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-sm"
      >
        {/* Başlık */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Sipariş Listesi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Toplam {totalCount} adet siparişinizi burada yönetebilirsiniz
          </p>
        </div>

        {/* Sol: Arama */}
        <Input
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          placeholder="Müşteri Ara"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "240px", marginInlineStart: "auto" }}
          allowClear
          size="large"
        />

        {/* Sağ: Durum filtresi + Diğer sayfalar + Boş Şablon + Yenile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            options={statusOptions}
            style={{ width: "180px" }}
            placeholder="Durum Filtresi"
            size="large"
          />

          <Dropdown menu={otherPagesMenu} trigger={["click"]}>
            <Button size="large">
              Diğer sayfalar <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            icon={<FileAddOutlined />}
            onClick={() => setEmptyPrintOpen(true)}
            size="large"
          >
            Boş Şablon
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            size="large"
          >
            Yenile
          </Button>
        </div>
      </div>

      <div className="w-full max-w-5xl mt-4 mx-auto">
        {/* Sayfalama + Sıralama + Gösterim Satırı */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            {/* Sayfa Numaraları */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={paginationBtnStyle(false, currentPage === 1, isDark)}
              >
                <DoubleLeftOutlined />
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={paginationBtnStyle(false, currentPage === 1, isDark)}
              >
                <LeftOutlined />
              </Button>

              {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{ padding: "0 4px", color: c.mutedText }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    style={paginationBtnStyle(p === currentPage, false, isDark)}
                  >
                    {p}
                  </button>
                ),
              )}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={paginationBtnStyle(
                  false,
                  currentPage === totalPages,
                  isDark,
                )}
              >
                <RightOutlined />
              </Button>
              <Button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={paginationBtnStyle(
                  false,
                  currentPage === totalPages,
                  isDark,
                )}
              >
                <DoubleRightOutlined />
              </Button>
            </div>

            {/* Sıralama + Gösterim */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: c.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  Sıralama
                </span>
                <Select
                  value={sort}
                  onChange={handleSortChange}
                  options={sortOptions}
                  style={{ width: "160px" }}
                  size="large"
                />
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: c.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  Gösterim
                </span>
                <Select
                  value={currentLimit}
                  onChange={handlePageSizeChange}
                  options={pageSizeOptions}
                  style={{ width: "120px" }}
                  size="large"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sipariş Kartları */}
        <div>
          {filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: c.mutedText,
                background: c.emptyBg,
                border: `1px solid ${c.emptyBorder}`,
                borderRadius: "8px",
              }}
            >
              Sipariş bulunamadı.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>

        {/* Alt Sayfalama */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px",
              paddingTop: "24px",
              paddingBottom: "8px",
            }}
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              style={paginationBtnStyle(false, currentPage === 1, isDark)}
            >
              <DoubleLeftOutlined />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={paginationBtnStyle(false, currentPage === 1, isDark)}
            >
              <LeftOutlined />
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span
                  key={`ellipsis2-${idx}`}
                  style={{ padding: "0 4px", color: c.mutedText }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  style={paginationBtnStyle(p === currentPage, false, isDark)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={paginationBtnStyle(
                false,
                currentPage === totalPages,
                isDark,
              )}
            >
              <RightOutlined />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              style={paginationBtnStyle(
                false,
                currentPage === totalPages,
                isDark,
              )}
            >
              <DoubleRightOutlined />
            </button>
          </div>
        )}
      </div>

      {/* Boş Şablon Yazdırma Modal */}
      <Modal
        title="Boş Şablon Yazdır"
        open={emptyPrintOpen}
        onCancel={() => setEmptyPrintOpen(false)}
        okText="Yazdır"
        cancelText="İptal"
        onOk={handleEmptyPrint}
        okButtonProps={{ icon: <PrinterOutlined /> }}
      >
        <div style={{ padding: "16px 0" }}>
          <p>Boş şablonu hangi kağıt boyutunda yazdırmak istiyorsunuz?</p>
          <Radio.Group
            value={emptyPageFormat}
            onChange={(e) => setEmptyPageFormat(e.target.value as "A4" | "A5")}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <Radio value="A4">
              <span style={{ marginLeft: "8px" }}>
                A4 (210 × 297 mm) - Standart kağıt boyutu
              </span>
            </Radio>
            <Radio value="A5">
              <span style={{ marginLeft: "8px" }}>
                A5 (148 × 210 mm) - Kompakt boyut
              </span>
            </Radio>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
}

function paginationBtnStyle(
  active: boolean,
  disabled: boolean,
  isDark?: boolean,
): React.CSSProperties {
  return {
    minWidth: "32px",
    height: "32px",
    padding: "0 8px",
    border: active ? "none" : `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
    borderRadius: "6px",
    background: active
      ? "#dc2626"
      : disabled
        ? isDark
          ? "#0f172a"
          : "#f9fafb"
        : isDark
          ? "#1e293b"
          : "#fff",
    color: active
      ? "#fff"
      : disabled
        ? isDark
          ? "#475569"
          : "#d1d5db"
        : isDark
          ? "#e2e8f0"
          : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px",
    fontWeight: active ? 700 : 400,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  };
}
