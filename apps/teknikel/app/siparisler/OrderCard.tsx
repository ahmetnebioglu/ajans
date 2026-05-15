"use client";

import React, { useState } from "react";
import { Button, Divider, Card, Tag } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import PrintButton from "./PrintButton";
import InvoiceCreatorButton from "./InvoiceCreatorButton";

interface Order {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerFirstname: string;
  customerSurname: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  finalAmount: number;
  paymentTypeName: string;
  paymentProviderName?: string;
  shippingCompanyName?: string;
  memberGroupName?: string;
  installment?: number;
  installmentRate?: number;
  amount: number;
  taxAmount: number;
  shippingAmount: number;
  couponDiscount?: number;
  promotionDiscount?: number;
  generalAmount?: number;
  orderItems?: any[];
  shippingAddress?: any;
  billingAddress?: any;
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const getStatusBgColor = (status: string | undefined): string => {
  if (!status) return "#6b7280";
  const s = status.toLowerCase();
  if (s === "new" || s === "waiting_for_approval") return "#3b82f6";
  if (s === "pending" || s === "waiting_for_payment") return "#f97316";
  if (s === "being_prepared" || s === "on_accumulation") return "#dc2626";
  if (s === "shipped" || s === "fulfilled") return "#8b5cf6";
  if (s === "delivered" || s === "approved") return "#16a34a";
  if (s === "cancelled" || s === "deleted") return "#6b7280";
  return "#6b7280";
};

const getStatusLabel = (status: string | undefined): string => {
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

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [showItems, setShowItems] = useState(false);

  const c = {
    cardBg: "transparent",
    cardBorder: "border-slate-100 dark:border-slate-800",
    divider: "border-slate-100 dark:border-slate-800",
    titleColor: "text-slate-800 dark:text-slate-100",
    bodyColor: "text-slate-700 dark:text-slate-300",
    mutedColor: "text-slate-500 dark:text-slate-400",
    iconColor: "text-slate-400 dark:text-slate-500",
    itemsBg: "bg-slate-50 dark:bg-slate-800/20",
    priceBadgeBg: "bg-emerald-50 dark:bg-emerald-900/20",
  };

  const statusBg = getStatusBgColor(order.status);
  const statusLabel = getStatusLabel(order.status);

  return (
    <Card
      size="small"
      className="border-slate-100 dark:border-slate-800 shadow-sm bg-transparent mb-3"
      styles={{
        body: { padding: "0" },
      }}
    >
      <div className="overflow-hidden">
        {/* Kart Üst Kısım */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${c.divider}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Sol: Sipariş No + Tarih */}
            <div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: c.titleColor,
                }}
              >
                Sipariş #{order.id}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "4px",
                  color: c.mutedColor,
                  fontSize: "13px",
                }}
              >
                <CalendarOutlined />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* Sağ: Butonlar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Durum Badge */}
              <span
                style={{
                  backgroundColor: statusBg,
                  color: "#fff",
                  padding: "5px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>🏷</span>
                {statusLabel}
              </span>

              {/* Fiyat Badge */}
              <span
                style={{
                  border: "1.5px solid #16a34a",
                  color: "#16a34a",
                  padding: "5px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: c.priceBadgeBg,
                }}
              >
                <span style={{ fontSize: "13px" }}>₺</span>
                {formatPrice(order.finalAmount)}
              </span>

              {/* Yazdır */}
              <PrintButton order={order as any} size="middle" />

              {/* Fatura Oluştur */}
              <InvoiceCreatorButton order={order as any} size="middle" />
            </div>
          </div>
        </div>

        {/* Kart Orta Kısım: Müşteri + Ödeme Bilgileri */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0",
          padding: "16px 20px",
        }}
        className="order-card-info-grid"
      >
        {/* Müşteri Bilgileri */}
        <div
          style={{
            paddingRight: "24px",
            borderRight: `1px solid ${c.divider}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
              color: c.bodyColor,
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <UserOutlined style={{ color: c.mutedColor }} />
            Müşteri Bilgileri
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              fontSize: "13px",
              color: c.bodyColor,
            }}
          >
            <div>
              <span style={{ fontWeight: 600 }}>Ad Soyad: </span>
              {order.customerFirstname} {order.customerSurname}
            </div>
            {order.customerEmail && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <MailOutlined
                  style={{ color: c.iconColor, fontSize: "12px" }}
                />
                <span>{order.customerEmail}</span>
              </div>
            )}
            {order.customerPhone && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <PhoneOutlined
                  style={{ color: c.iconColor, fontSize: "12px" }}
                />
                <span>{order.customerPhone}</span>
              </div>
            )}
            {order.memberGroupName && (
              <div>
                <span style={{ fontWeight: 600 }}>Müşteri Grubu: </span>
                {order.memberGroupName}
              </div>
            )}
          </div>
        </div>

        {/* Ödeme Bilgileri */}
        <div style={{ paddingLeft: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
              color: c.bodyColor,
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <CreditCardOutlined style={{ color: c.mutedColor }} />
            Ödeme Bilgileri
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              fontSize: "13px",
              color: c.bodyColor,
            }}
          >
            <div>
              <span style={{ fontWeight: 600 }}>Ödeme Türü: </span>
              {order.paymentTypeName}
              {order.paymentProviderName &&
              order.paymentProviderName !== order.paymentTypeName
                ? ` - ${order.paymentProviderName}`
                : ""}
            </div>
            {order.installment != null && order.installment > 0 && (
              <div>
                <span style={{ fontWeight: 600 }}>Ödeme Şekli: </span>
                <span style={{ color: "#dc2626" }}>
                  {order.installment === 1
                    ? "Tek Çekim"
                    : `${order.installment} Taksit`}
                </span>
              </div>
            )}
            {order.memberGroupName && (
              <div>
                <span style={{ fontWeight: 600 }}>Müşteri Grubu: </span>
                {order.memberGroupName}
              </div>
            )}
            {order.shippingCompanyName && (
              <div>
                <span style={{ fontWeight: 600 }}>Kargo: </span>
                {order.shippingCompanyName}
              </div>
            )}
            <div>
              <span style={{ fontWeight: 600 }}>Sipariş Tutarı: </span>₺
              {formatPrice(order.finalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Kart Alt Kısım: Action Bar */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: `1px solid ${c.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* Ürünleri Göster/Gizle */}
        <Button
          onClick={() => setShowItems(!showItems)}
          size="large"
          variant="text"
          color="primary"
        >
          {showItems ? <UpOutlined /> : <DownOutlined />}
          {showItems ? "Ürünleri Gizle" : "Ürünleri Göster"}
        </Button>

        {/* Sipariş Detayı */}
        <Link href={`/siparisler/${order.id}`}>
          <Button
            size="large"
            variant="filled"
            color="primary"
          >
            Sipariş Detayını Göster
          </Button>
        </Link>
      </div>

      {/* Genişletilmiş İçerik (Ürünler, Fiyat Özeti, Adresler) */}
      <div
        style={{
          borderTop: `1px solid ${c.divider}`,
          padding: "0 20px",
          background: c.itemsBg,
          maxHeight: showItems ? "1000px" : "0",
          opacity: showItems ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease-in-out, opacity 0.4s ease-in-out",
        }}
      >
        {/* Adres Bilgileri */}
        {(order.shippingAddress || order.billingAddress) && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              gap: "24px",
              paddingTop: "24px",
              borderTop: `1px solid ${c.divider}`,
            }}
          >
            {/* Teslimat Adresi */}
            {order.shippingAddress && (
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: c.bodyColor,
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📍 Teslimat Adresi
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: c.bodyColor,
                    lineHeight: "1.6",
                  }}
                >
                  {order.shippingAddress.name && (
                    <div style={{ fontWeight: 600 }}>
                      {order.shippingAddress.name}
                    </div>
                  )}
                  {order.shippingAddress.address && (
                    <div>{order.shippingAddress.address}</div>
                  )}
                  {order.shippingAddress.city && (
                    <div>{order.shippingAddress.city}</div>
                  )}
                  {order.shippingAddress.phone && (
                    <div style={{ marginTop: "4px" }}>
                      📞 {order.shippingAddress.phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Divider orientation="vertical" style={{ borderColor: c.divider }} />

            {/* Fatura Adresi */}
            {order.billingAddress && (
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: c.bodyColor,
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📋 Fatura Adresi
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: c.bodyColor,
                    lineHeight: "1.6",
                  }}
                >
                  {order.billingAddress.name && (
                    <div style={{ fontWeight: 600 }}>
                      {order.billingAddress.name}
                    </div>
                  )}
                  {order.billingAddress.address && (
                    <div>{order.billingAddress.address}</div>
                  )}
                  {order.billingAddress.city && (
                    <div>{order.billingAddress.city}</div>
                  )}
                  {order.billingAddress.phone && (
                    <div style={{ marginTop: "4px" }}>
                      📞 {order.billingAddress.phone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Divider />

        {/* Sipariş Ürünleri Başlığı */}
        {order.orderItems && order.orderItems.length > 0 && (
          <>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: c.titleColor,
                marginBottom: "12px",
              }}
            >
              Sipariş Ürünleri
            </div>

            {/* Ürünler Tablosu */}
            <div style={{ marginBottom: "16px" }}>
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: "12px",
                  paddingBottom: "12px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${c.divider}`,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: c.mutedColor,
                  }}
                >
                  Ürün
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: c.mutedColor,
                    textAlign: "center",
                  }}
                >
                  Adet
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: c.mutedColor,
                    textAlign: "right",
                  }}
                >
                  Birim Fiyat
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: c.mutedColor,
                    textAlign: "right",
                  }}
                >
                  Toplam
                </div>
              </div>

              {/* Items */}
              {order.orderItems.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom: `1px solid ${c.divider}`,
                  }}
                >
                  <div style={{ fontSize: "13px", color: c.bodyColor }}>
                    <div style={{ fontWeight: 600 }}>
                      {item.name || item.productName}
                    </div>
                    {item.sku && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: c.mutedColor,
                          marginTop: "2px",
                        }}
                      >
                        SKU: {item.sku}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: c.bodyColor,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {item.productQuantity || item.quantity}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: c.bodyColor,
                      textAlign: "right",
                    }}
                  >
                    ₺
                    {formatPrice(
                      item.productPrice || item.price || item.finalPrice,
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#16a34a",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    ₺
                    {formatPrice(
                      (item.productQuantity || item.quantity || 1) *
                        (item.productPrice ||
                          item.price ||
                          item.finalPrice ||
                          0),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Fiyat Özeti */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "16px",
          }}
        >
          {/* Sol: Boş */}
          <div></div>

          {/* Sağ: Fiyat Özeti */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: c.bodyColor,
              }}
            >
              <span>Ara Toplam:</span>
              <span>₺{formatPrice(order.amount)}</span>
            </div>
            {order.taxAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: c.bodyColor,
                }}
              >
                <span>KDV:</span>
                <span>₺{formatPrice(order.taxAmount)}</span>
              </div>
            )}
            {order.shippingAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: c.bodyColor,
                }}
              >
                <span>Kargo:</span>
                <span>₺{formatPrice(order.shippingAmount)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                fontWeight: 600,
                color: c.titleColor,
                paddingTop: "8px",
                borderTop: `1px solid ${c.divider}`,
              }}
            >
              <span>Genel Toplam:</span>
              <span style={{ color: "#16a34a" }}>
                ₺{formatPrice(order.finalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

        <style>{`
          @media (max-width: 640px) {
            .order-card-info-grid {
              grid-template-columns: 1fr !important;
            }
            .order-card-info-grid > div:first-child {
              padding-right: 0 !important;
              border-right: none !important;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .order-card-info-grid > div:last-child {
              padding-left: 0 !important;
            }
          }
        `}</style>
      </div>
    </Card>
  );
}
