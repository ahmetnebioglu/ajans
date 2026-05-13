'use client';

import React, { useState } from 'react';
import { Card, Select, Button, Modal, Input, message, Spin } from 'antd';
import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface OrderStatusClientProps {
  orderId: number;
  currentStatus: string;
}

const statusOptions = [
  { value: 'waiting_for_approval', label: 'Onay Bekliyor' },
  { value: 'approved', label: 'Onaylandı' },
  { value: 'waiting_for_payment', label: 'Ödeme Bekleniyor' },
  { value: 'being_prepared', label: 'Hazırlanıyor' },
  { value: 'on_accumulation', label: 'Tedarik Sürecinde' },
  { value: 'fulfilled', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
];

export default function OrderStatusClient({
  orderId,
  currentStatus,
}: OrderStatusClientProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'fulfilled') {
      // Kargo takip numarası iste
      setSelectedStatus(newStatus);
      setShowTrackingModal(true);
    } else {
      // Direkt güncelle
      updateStatus(newStatus);
    }
  };

  const handleTrackingSubmit = () => {
    if (!trackingNumber.trim()) {
      message.error('Kargo takip numarası gereklidir');
      return;
    }
    updateStatus(selectedStatus, trackingNumber);
    setShowTrackingModal(false);
  };

  const updateStatus = async (newStatus: string, tracking?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideasoft/siparisler/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...(tracking && { trackingNumber: tracking }),
        }),
      });

      if (!response.ok) {
        throw new Error('Sipariş durumu güncellenemedi');
      }

      setStatus(newStatus);
      setTrackingNumber('');
      message.success('Sipariş durumu başarıyla güncellendi');
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title="Sipariş Durumunu Güncelle"
        className="shadow-sm border-slate-100 dark:border-slate-800"
      >
        <Spin spinning={loading}>
          <div className="space-y-3">
            <Select
              value={status}
              onChange={handleStatusChange}
              options={statusOptions}
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Mevcut Durum: <strong>{statusOptions.find(o => o.value === status)?.label || status}</strong>
            </p>
          </div>
        </Spin>
      </Card>

      <Modal
        title="Kargo Takip Numarası"
        open={showTrackingModal}
        onOk={handleTrackingSubmit}
        onCancel={() => setShowTrackingModal(false)}
        okText="Güncelle"
        cancelText="İptal"
        confirmLoading={loading}
      >
        <p className="mb-4 text-sm text-slate-600">
          Sipariş durumunu "Kargoya Verildi" olarak güncellemek için kargo takip numarasını girin.
        </p>
        <Input
          placeholder="Kargo takip numarası"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          disabled={loading}
        />
      </Modal>
    </>
  );
}
