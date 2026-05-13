'use client';

import React, { useState } from 'react';
import { Button, Modal, Radio } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { printOrder } from './utils/printOrder';

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

interface PrintButtonProps {
  order: Order;
  size?: 'large' | 'middle' | 'small';
  variant?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
}

export default function PrintButton({
  order,
  size = 'middle',
  variant = 'default',
}: PrintButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pageFormat, setPageFormat] = useState<'A4' | 'A5'>('A5');
  const [printing, setPrinting] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePrint = () => {
    setPrinting(true);
    setModalOpen(false);
    
    // Yazdırma işlemi için kısa bir bekleme
    setTimeout(() => {
      printOrder(order as any, pageFormat);
      setPrinting(false);
    }, 300);
  };

  return (
    <>
      <Button
        icon={<PrinterOutlined />}
        onClick={handleOpenModal}
        size={size}
        type={variant === 'primary' ? 'primary' : 'default'}
        loading={printing}
      >
        Yazdır
      </Button>

      <Modal
        title="Yazdırma Formatını Seçin"
        open={modalOpen}
        onCancel={handleCloseModal}
        okText="Yazdır"
        cancelText="İptal"
        onOk={handlePrint}
        okButtonProps={{ loading: printing, icon: <PrinterOutlined /> }}
      >
        <div style={{ padding: '16px 0' }}>
          <p>Siparişi hangi kağıt boyutunda yazdırmak istiyorsunuz?</p>
          <Radio.Group
            value={pageFormat}
            onChange={(e) => setPageFormat(e.target.value as 'A4' | 'A5')}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Radio value="A4">
              <span style={{ marginLeft: '8px' }}>
                A4 (210 × 297 mm) - Standart kağıt boyutu
              </span>
            </Radio>
            <Radio value="A5">
              <span style={{ marginLeft: '8px' }}>
                A5 (148 × 210 mm) - Kompakt boyut
              </span>
            </Radio>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
}
