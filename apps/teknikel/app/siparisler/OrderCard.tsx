'use client';

import React from 'react';
import { Card, Tag, Button, Space, Row, Col, Divider, Typography } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import PrintButton from './PrintButton';
import InvoiceCreatorButton from './InvoiceCreatorButton';

interface Order {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerFirstname: string;
  customerSurname: string;
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

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
};

const getStatusColor = (status: string | undefined): string => {
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

const getStatusLabel = (status: string | undefined): string => {
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

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Card
      className="order-card"
      style={{
        marginBottom: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Row gutter={[24, 16]} align="middle">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Link href={`/siparisler/${order.id}`}>
              <Typography.Title
                level={4}
                style={{
                  margin: '0 0 8px 0',
                  color: '#1890ff',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#40a9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1890ff';
                }}
              >
                Sipariş #{order.id}
              </Typography.Title>
            </Link>

            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              <CalendarOutlined style={{ marginRight: '4px' }} />
              {formatDate(order.createdAt)}
            </div>

            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              <UserOutlined style={{ marginRight: '4px' }} />
              {order.customerFirstname} {order.customerSurname}
            </div>

            {order.customerPhone && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <PhoneOutlined style={{ marginRight: '4px' }} />
                {order.customerPhone}
              </div>
            )}
          </div>
        </Col>

        {/* Orta Kolon - Durum ve Ödeme */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <div style={{ marginBottom: '8px' }}>
              <Tag color={getStatusColor(order.status)} style={{ fontSize: '12px' }}>
                {getStatusLabel(order.status)}
              </Tag>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              <strong>Ödeme:</strong> {order.paymentTypeName}
            </div>

            {order.memberGroupName && (
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <strong>Müşteri Grubu:</strong> {order.memberGroupName}
              </div>
            )}

            {order.shippingCompanyName && (
              <div style={{ fontSize: '12px' }}>
                <strong>Kargo:</strong> {order.shippingCompanyName}
              </div>
            )}
          </div>
        </Col>

        {/* Sağ Kolon - Tutar ve Aksiyonlar */}
        <Col xs={24} sm={24} md={8}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#52c41a',
                marginBottom: '12px',
              }}
            >
              {formatPrice(order.finalAmount)}
            </div>

            <Space wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
              <PrintButton order={order as any} size="small" />
              <InvoiceCreatorButton order={order as any} size="small" />
              <Link href={`/siparisler/${order.id}`}>
                <Button
                  type="primary"
                  size="small"
                  icon={<ArrowRightOutlined />}
                >
                  Detay
                </Button>
              </Link>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
