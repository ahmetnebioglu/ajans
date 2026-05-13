'use client';

import React from 'react';
import { Modal, List, Button, Empty, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

interface Cari {
  id: number;
  faturaUnvan: string;
  yetkili?: string;
  cep?: string;
  tel?: string;
  mail?: string;
  grup?: string;
}

interface CariSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  caris: Cari[];
  onSelectCari: (cari: Cari) => void;
  customerName: string;
  loading?: boolean;
}

export default function CariSelectionDialog({
  open,
  onClose,
  caris,
  onSelectCari,
  customerName,
  loading = false,
}: CariSelectionDialogProps) {
  return (
    <Modal
      title={`Cari Seçimi - ${customerName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Cariler aranıyor..." />
        </div>
      ) : caris.length === 0 ? (
        <Empty
          description="Cari bulunamadı"
          style={{ marginTop: '40px', marginBottom: '40px' }}
        />
      ) : (
        <List
          dataSource={caris}
          renderItem={(cari) => (
            <List.Item
              key={cari.id}
              style={{
                padding: '12px',
                border: '1px solid #f0f0f0',
                marginBottom: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.borderColor = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
            >
              <List.Item.Meta
                title={
                  <div style={{ fontWeight: 600, color: '#000' }}>
                    {cari.faturaUnvan}
                  </div>
                }
                description={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {cari.yetkili && <div>Yetkili: {cari.yetkili}</div>}
                    {cari.tel && <div>Tel: {cari.tel}</div>}
                    {cari.mail && <div>Mail: {cari.mail}</div>}
                    {cari.grup && <div>Grup: {cari.grup}</div>}
                  </div>
                }
              />
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => onSelectCari(cari)}
              >
                Seç
              </Button>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
