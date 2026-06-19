'use client';

import React, { useState, useMemo } from 'react';
import { Button, Modal, Spin, Alert, List, Progress, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import CariSelectionDialog from './CariSelectionDialog';

interface Order {
  id: number;
  createdAt: string;
  customerFirstname: string;
  customerSurname: string;
  memberGroupName?: string;
  paymentTypeName: string;
  finalAmount: number;
  orderItems?: any[];
  [key: string]: any;
}

interface Cari {
  id: number;
  faturaUnvan: string;
  yetkili?: string;
  cep?: string;
  tel?: string;
  mail?: string;
  grup?: string;
}

interface InvoiceCreatorButtonProps {
  order: Order;
  size?: 'large' | 'middle' | 'small';
  variant?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
}

export default function InvoiceCreatorButton({
  order,
  size = 'middle',
  variant = 'default',
}: InvoiceCreatorButtonProps) {
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [cariSelectionOpen, setCariSelectionOpen] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState<any>(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [checkingStocks, setCheckingStocks] = useState(false);
  const [preMissingItems, setPreMissingItems] = useState<any[]>([]);
  const [searchingCari, setSearchingCari] = useState(false);
  const [foundCaris, setFoundCaris] = useState<Cari[]>([]);
  const [selectedCari, setSelectedCari] = useState<Cari | null>(null);
  const [currentlyChecking, setCurrentlyChecking] = useState<string | null>(null);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const getMemberGroupInfo = () => {
    const normalizedGroupName =
      order.memberGroupName?.toLocaleLowerCase('tr-TR').trim() || '';
    const isService = normalizedGroupName === 'servis';

    return {
      isService,
      cariName: isService
        ? selectedCari
          ? selectedCari.faturaUnvan
          : '#11 GENEL MÜŞTERİ'
        : '#62 PERAKENDE',
      cariId: isService ? (selectedCari ? selectedCari.id : 11) : 62,
    };
  };

  const memberGroupInfo = useMemo(getMemberGroupInfo, [
    order.memberGroupName,
    selectedCari,
  ]);

  const checkMissingStocks = async () => {
    setCheckingStocks(true);
    setPreMissingItems([]);
    setCurrentlyChecking(null);
    setCheckedCount(0);
    setTotalItems(0);

    try {
      const listResp = await fetch('/api/bilsoft/invoice-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          onlyItems: true,
        }),
      });

      const listData = await listResp.json();
      if (!listData.success || !listData.items) {
        throw new Error('Ürün listesi alınamadı');
      }

      const items = listData.items;
      setTotalItems(items.length);

      const missing = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setCurrentlyChecking(item.sku);

        try {
          const itemResp = await fetch('/api/bilsoft/invoice-check-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku: item.sku }),
          });

          const itemData = await itemResp.json();
          const result = {
            sku: item.sku,
            name: item.name,
            exists: !!(itemData.success && itemData.data),
            error: itemData.success ? null : itemData.message,
          };

          if (!result.exists) {
            missing.push(result);
            setPreMissingItems([...missing]);
          }
        } catch (itemErr: any) {
          const result = {
            sku: item.sku,
            name: item.name,
            exists: false,
            error: itemErr.message || 'Hata',
          };
          missing.push(result);
          setPreMissingItems([...missing]);
        }

        setCheckedCount(i + 1);
      }
    } catch (err: any) {
      setInvoiceError('Stok kontrolü sırasında bir hata oluştu: ' + err.message);
    } finally {
      setCheckingStocks(false);
      setCurrentlyChecking(null);
    }
  };

  const checkExistingInvoice = async () => {
    setCheckingInvoice(true);
    try {
      const response = await fetch('/api/bilsoft/bills/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aranacakKelime: '',
          searchType: ['Contains'],
          subeAdi: 'Merkez',
          veri: { siparisNo: order.id.toString() },
          pagingOptions: { pageSize: 1500, pageNumber: 0 },
        }),
      });

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setExistingInvoice(data.data[0]);
      }
    } catch (error) {
      console.error('Fatura kontrolü hatası:', error);
    } finally {
      setCheckingInvoice(false);
    }
  };

   const openHandler = async () => {
     setInvoiceError(null);

     // Önce mevcut faturayı kontrol et
     await checkExistingInvoice();

     // Eğer fatura zaten kesilmişse, stok kontrolü yapma
     if (existingInvoice) {
       setInvoiceModalOpen(true);
       return;
     }

     const normalizedGroupName =
       order.memberGroupName?.toLocaleLowerCase('tr-TR').trim() || '';
     if (normalizedGroupName === 'servis') {
       setSearchingCari(true);
       try {
         const customerName =
           `${order.customerFirstname || ''} ${order.customerSurname || ''}`.trim();
           
         const companyName =
           order.billingAddress?.company ||
           order.billingAddress?.companyName ||
           order.billingAddress?.invoiceTitle ||
           order.company ||
           '';
         const identityNumber =
           order.billingAddress?.identityRegistrationNumber ||
           order.tcKimlikNo ||
           order.customerIdentityNumber ||
           order.identityNumber ||
           order.customerTc ||
           '';
         const taxNumber = order.billingAddress?.taxNo || order.taxNumber || '';

         const resp = await fetch('/api/bilsoft/cari-search', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             orderId: order.id, 
             customerName, 
             companyName, 
             identityNumber, 
             taxNumber 
           }),
         });

         const data = await resp.json();
         if (data.success && data.caris) {
           setFoundCaris(data.caris);
           if (data.caris.length === 1) {
             setSelectedCari(data.caris[0]);
             setInvoiceModalOpen(true);
             await checkMissingStocks();
           } else if (data.caris.length > 1) {
             setCariSelectionOpen(true);
           } else {
             setInvoiceModalOpen(true);
             await checkMissingStocks();
           }
         } else {
           setInvoiceModalOpen(true);
           await checkMissingStocks();
         }
       } catch (err: any) {
         setInvoiceError('Cari araması sırasında hata oluştu: ' + err.message);
         setInvoiceModalOpen(true);
         await checkMissingStocks();
       } finally {
         setSearchingCari(false);
       }
     } else {
       setInvoiceModalOpen(true);
       await checkMissingStocks();
     }
   };

  const handleCariSelect = async (cari: Cari) => {
    setSelectedCari(cari);
    setCariSelectionOpen(false);
    setInvoiceModalOpen(true);
    await Promise.all([checkExistingInvoice(), checkMissingStocks()]);
  };

  const handleCreateInvoice = async () => {
    setCreatingInvoice(true);
    setInvoiceError(null);
    setInvoiceSuccess(false);

    try {
      const requestBody: any = { orderId: order.id };
      if (selectedCari) requestBody.selectedCari = selectedCari;

      const endpoint =
        order.paymentTypeName === 'Kredi Kartı' ||
        order.paymentTypeName === 'Kredi Karti'
          ? '/api/bilsoft/invoice-credit-card'
          : '/api/bilsoft/invoice';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setInvoiceSuccess(true);
        const newInvoiceId =
          data.detailedInvoice?.id || data.invoice?.data?.id;
        if (newInvoiceId) {
          setCreatedInvoiceId(newInvoiceId);
        }
        message.success('Fatura başarıyla oluşturuldu!');
      } else {
        throw new Error(data.error || 'Fatura oluşturulamadı');
      }
    } catch (error: any) {
      const message_text =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message ||
        'Fatura oluşturulurken bir hata oluştu';
      setInvoiceError(message_text);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleCloseModal = () => {
    setInvoiceModalOpen(false);
    setInvoiceError(null);
    setInvoiceSuccess(false);
    setExistingInvoice(null);
    setCreatedInvoiceId(null);
    setSelectedCari(null);
    setPreMissingItems([]);
    setCheckingStocks(false);
  };

  return (
    <>
      <Button
        icon={<FileTextOutlined />}
        onClick={openHandler}
        size={size}
        type={variant === 'primary' ? 'primary' : 'default'}
        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
      >
        Fatura Oluştur
      </Button>

      <CariSelectionDialog
        open={cariSelectionOpen}
        onClose={() => setCariSelectionOpen(false)}
        caris={foundCaris}
        onSelectCari={handleCariSelect}
        customerName={`${order.customerFirstname} ${order.customerSurname}`}
        loading={searchingCari}
      />

      <Modal
        title="Fatura Oluştur"
        open={invoiceModalOpen}
        onCancel={handleCloseModal}
        okText="Fatura Oluştur"
        cancelText="İptal"
        onOk={handleCreateInvoice}
        okButtonProps={{ loading: creatingInvoice, disabled: checkingStocks }}
        width={600}
      >
        {checkingInvoice && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" tip="Fatura kontrol ediliyor..." />
          </div>
        )}

        {!checkingInvoice && existingInvoice && !invoiceSuccess && (
          <Alert
            message="⚠️ Dikkat! Bu sipariş için zaten fatura mevcut"
            description={`Fatura No: ${existingInvoice.fisno} - Müşteri: ${existingInvoice.unvan}`}
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {!checkingInvoice && !invoiceSuccess && !invoiceError && (
          <>
            {preMissingItems.some(
              (item) =>
                item.error &&
                (item.error.includes('429') || item.error.includes('Hız'))
            ) && (
              <Alert
                message="⚠️ Bilsoft API Hız Limitine Takıldı"
                description="Bazı ürünler limitler nedeniyle kontrol edilemedi. Tekrar denemeniz durumunda önbellekten hızlıca tamamlanacaktır."
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

             <div className="mb-4">
               <p>
                 Bu sipariş için <strong>{memberGroupInfo.cariName}</strong> carisine
                 fatura oluşturulacak.
               </p>
               <div className="bg-slate-100 dark:bg-slate-700/60 rounded p-3 mb-4">
                 <div>
                   <strong>Sipariş No:</strong> #{order.id}
                 </div>
                 <div>
                   <strong>Müşteri:</strong> {order.customerFirstname}{' '}
                   {order.customerSurname}
                 </div>
                 <div>
                   <strong>Müşteri Grubu:</strong> {order.memberGroupName || 'Üyeliksiz'}
                 </div>
                 <div>
                   <strong>Cari:</strong> {memberGroupInfo.cariName} (ID:{' '}
                   {memberGroupInfo.cariId})
                 </div>
                 <div>
                   <strong>Tutar:</strong>{' '}
                   {new Intl.NumberFormat('tr-TR', {
                     style: 'currency',
                     currency: 'TRY',
                   }).format(order.finalAmount)}
                 </div>
               </div>
             </div>

            {checkingStocks && (
              <div className="mb-4">
                <div className="mb-2">
                  <strong>
                    Stok Kartları Kontrol Ediliyor ({checkedCount}/{totalItems})
                  </strong>
                </div>
                <Progress percent={Math.round((checkedCount / totalItems) * 100)} />
                {currentlyChecking && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Şu an sorgulanan: <strong>{currentlyChecking}</strong>
                  </div>
                )}
              </div>
            )}

            {!checkingStocks && preMissingItems.length > 0 && (
              <Alert
                message={`⚠️ ${preMissingItems.length} Ürün İçin Stok Kartı Eksik`}
                description="Bu ürünler faturaya kalem olarak eklenemeyecektir."
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
          </>
        )}

        {creatingInvoice && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" tip="Fatura oluşturuluyor..." />
          </div>
        )}

        {invoiceSuccess && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircleOutlined
              style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#52c41a' }}>
              Fatura başarıyla oluşturuldu!
            </div>
            {createdInvoiceId && (
              <Button
                type="primary"
                href={`/faturalar/${createdInvoiceId}`}
                target="_blank"
                style={{ marginTop: '16px' }}
              >
                Faturayı Görüntüle
              </Button>
            )}
          </div>
        )}

        {invoiceError && (
          <Alert
            message="Hata"
            description={invoiceError}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
      </Modal>
    </>
  );
}
