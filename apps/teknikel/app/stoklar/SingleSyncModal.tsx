'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Alert,
  Spin,
  message,
  Descriptions,
  Tag,
  Divider,
  Card,
  Row,
  Col,
  Badge,
} from 'antd';
import { previewSingleSync, executeSingleSync, findIdeasoftMatchForStok } from '@/app/actions/stok-sync-actions';

interface SingleSyncModalProps {
  open: boolean;
  onClose: () => void;
  bilsoftKod: string;
  bilsoftAd: string;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function SingleSyncModal({
  open,
  onClose,
  bilsoftKod,
  bilsoftAd,
}: SingleSyncModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [matchStatus, setMatchStatus] = useState<{
    found: boolean;
    isExactMatch?: boolean;
    ideasoftId?: number;
    ideasoftName?: string;
    similarityScore?: number;
    message: string;
  } | null>(null);

  // Modal açılınca otomatik eşleştirme yap
  useEffect(() => {
    if (open) {
      // Durumu sıfırla
      setMatchStatus(null);
      setPreview(null);
      setSyncResult(null);
      form.resetFields();

      // Otomatik eşleştirme başlat
      const autoMatch = async () => {
        setLoading(true);
        try {
          const result = await findIdeasoftMatchForStok(bilsoftKod);
          setMatchStatus(result);

          // Eşleşme bulunduysa form'u doldur ve önizleme yap
          if (result.found && result.ideasoftId) {
            form.setFieldValue('ideasoftId', result.ideasoftId);
            
            // Otomatik önizleme yap
            try {
              const previewResult = await previewSingleSync(
                bilsoftKod,
                result.ideasoftId,
                5 // Default havale indirimi
              );
              if (previewResult.success) {
                setPreview(previewResult);
              }
            } catch (previewError) {
              console.error('Önizleme hatası:', previewError);
            }
          }
        } catch (error) {
          console.error('Eşleştirme hatası:', error);
          setMatchStatus({
            found: false,
            message: 'Eşleştirme sırasında hata oluştu',
          });
        } finally {
          setLoading(false);
        }
      };

      autoMatch();
    }
  }, [open, bilsoftKod, form]);


  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setPreviewing(true);

      const result = await previewSingleSync(
        bilsoftKod,
        values.ideasoftId,
        values.havaleIndirimi || 0
      );

      if (result.success) {
        setPreview(result);
        message.success('Önizleme başarılı');
      } else {
        message.error(result.message);
        setPreview(null);
      }
    } catch (error: any) {
      message.error('Doğrulama hatası: ' + error.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSync = async () => {
    try {
      const values = await form.validateFields();
      setSyncing(true);

      const result = await executeSingleSync(
        bilsoftKod,
        values.ideasoftId,
        values.havaleIndirimi || 0
      );

      setSyncResult(result);
      if (result.success) {
        message.success('Senkronizasyon başarılı!');
      } else {
        message.error(result.message);
      }
    } catch (error: any) {
      message.error('Senkronizasyon hatası: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPreview(null);
    setSyncResult(null);
    onClose();
  };

  return (
    <Modal
      title={`Tekli Senkronizasyon: ${bilsoftKod} - ${bilsoftAd}`}
      open={open}
      onCancel={handleClose}
      width={900}
      footer={null}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {!syncResult ? (
        <Form form={form} layout="vertical" className="space-y-4">
          {/* Bilsoft Stok Kodu */}
          <Form.Item label="Bilsoft Stok Kodu" required>
            <Input value={bilsoftKod} disabled />
          </Form.Item>

          {/* Ideasoft Ürün ID - Otomatik Eşleştirme */}
          {loading ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <Spin size="small" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Ideasoft eşleşmesi aranıyor...</span>
            </div>
          ) : matchStatus ? (
            <>
              <Form.Item
                label="Ideasoft Ürün ID"
                name="ideasoftId"
                rules={[{ required: true, message: 'Ideasoft Ürün ID gerekli' }]}
              >
                <InputNumber placeholder="Örn: 519" min={1} style={{ width: '100%' }} />
              </Form.Item>

              {matchStatus.found ? (
                matchStatus.isExactMatch ? (
                  <Alert
                    message="✅ Otomatik Eşleşme Bulundu"
                    description={`${matchStatus.ideasoftName} (ID: ${matchStatus.ideasoftId})`}
                    type="success"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                ) : (
                  <Alert
                    message="⚠️ Yakın Eşleşme Bulundu (Bunu mu demek istediniz?)"
                    description={`${matchStatus.ideasoftName} (ID: ${matchStatus.ideasoftId}) - Benzerlik: %${Math.round((matchStatus.similarityScore || 0) * 100)}`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                )
              ) : (
                <Alert
                  message="❌ Eşleşme Bulunamadı"
                  description="SKU ile tam veya yakın eşleşme bulunamadı. Ideasoft Ürün ID'sini manuel girin."
                  type="error"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
            </>
          ) : (
            <Form.Item
              label="Ideasoft Ürün ID"
              name="ideasoftId"
              rules={[{ required: true, message: 'Ideasoft Ürün ID gerekli' }]}
            >
              <InputNumber placeholder="Örn: 519" min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}

          {/* Havale İndirimi */}
          <Form.Item
            label="Havale İndirimi (%)"
            name="havaleIndirimi"
            initialValue={5}
            rules={[{ required: true, message: 'Havale indirimi gerekli' }]}
          >
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          {/* Senkronizasyon Kuralları */}
          <Card
            title="📋 Senkronizasyon Kuralları"
            size="small"
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Bilsoft Özel Kod 1</strong> → <strong>Ideasoft price1</strong> (Kredi kartı perakende fiyatı)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Bilsoft Satış Fiyatı</strong> → <strong>Ideasoft price2</strong> (Kredi kartı servis fiyatı)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Bilsoft Özel Kod 2</strong> → <strong>Ideasoft price3</strong> (Kredi kartı özel fiyat)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Bilsoft Bakiye</strong> → <strong>Ideasoft stockAmount</strong> (Stok miktarı)
                </span>
              </div>
              <Divider className="my-2" />
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                <strong>Fiyat Hesaplama Formülü:</strong>
                <br />
                Komisyon Faktörü = 1 - (Havale İndirimi / 100)
                <br />
                Kredi Kartı Fiyatı = Havale Fiyatı / Komisyon Faktörü
              </div>
            </div>
          </Card>

          {/* Önizleme Butonu */}
          <Button
            type="primary"
            onClick={handlePreview}
            loading={previewing}
            disabled={previewing || syncing}
            block
          >
            Önizle
          </Button>

          {/* Önizleme Sonuçları */}
          {preview && preview.success && (
            <Card title="📊 Hesaplama Önizlemesi" size="small">
              <Row gutter={[16, 16]}>
                {/* Bilsoft Verileri */}
                <Col xs={24} md={12}>
                  <Card
                    title="Bilsoft Verileri"
                    size="small"
                    className="bg-slate-50 dark:bg-slate-800"
                  >
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Stok Kodu">
                        <span className="font-mono font-bold">{preview.bilsoftData?.kod}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Stok Adı">
                        {preview.bilsoftData?.ad}
                      </Descriptions.Item>
                      <Descriptions.Item label="Satış Fiyatı (sFiyat)">
                        <span className="text-rose-600 font-bold">
                          {formatCurrency(preview.bilsoftData?.sFiyat)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Özel Kod 1">
                        <span className="text-blue-600 font-bold">
                          {formatCurrency(preview.bilsoftData?.stokOzelKod1)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Özel Kod 2">
                        <span className="text-purple-600 font-bold">
                          {formatCurrency(preview.bilsoftData?.stokOzelKod2)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Bakiye (Stok)">
                        <span className="text-emerald-600 font-bold">
                          {preview.bilsoftData?.bakiye}
                        </span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                {/* Hesaplanan Değerler */}
                <Col xs={24} md={12}>
                  <Card
                    title="Hesaplanan Ideasoft Değerleri"
                    size="small"
                    className="bg-green-50 dark:bg-green-900/20"
                  >
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="price1 (Kredi Kartı)">
                        <span className="text-blue-600 font-bold">
                          {formatCurrency(preview.calculatedValues?.price1)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="price2 (Kredi Kartı)">
                        <span className="text-rose-600 font-bold">
                          {formatCurrency(preview.calculatedValues?.price2)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="price3 (Kredi Kartı)">
                        <span className="text-purple-600 font-bold">
                          {formatCurrency(preview.calculatedValues?.price3)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="stockAmount">
                        <span className="text-emerald-600 font-bold">
                          {preview.calculatedValues?.stockAmount}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="moneyOrderDiscount">
                        <Tag color="orange">%{preview.calculatedValues?.moneyOrderDiscount}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              {/* Komisyon Hesaplaması */}
              <Card
                title="🧮 Kredi Kartı Komisyon Hesaplaması"
                size="small"
                className="mt-4 bg-amber-50 dark:bg-amber-900/20"
              >
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Havale İndirimi:</strong> %
                    {preview.commissionCalculation?.commissionFactor
                      ? ((1 - preview.commissionCalculation.commissionFactor) * 100).toFixed(1)
                      : 0}
                  </div>
                  <div>
                    <strong>Komisyon Faktörü:</strong>{' '}
                    {preview.commissionCalculation?.commissionFactor?.toFixed(4)}
                  </div>
                  <Divider className="my-2" />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      price1 = {formatCurrency(preview.commissionCalculation?.basePrice1)} ÷{' '}
                      {preview.commissionCalculation?.commissionFactor?.toFixed(4)} ={' '}
                      <strong>{formatCurrency(preview.calculatedValues?.price1)}</strong>
                    </div>
                    <div>
                      price2 = {formatCurrency(preview.commissionCalculation?.basePrice2)} ÷{' '}
                      {preview.commissionCalculation?.commissionFactor?.toFixed(4)} ={' '}
                      <strong>{formatCurrency(preview.calculatedValues?.price2)}</strong>
                    </div>
                    <div>
                      price3 = {formatCurrency(preview.commissionCalculation?.basePrice3)} ÷{' '}
                      {preview.commissionCalculation?.commissionFactor?.toFixed(4)} ={' '}
                      <strong>{formatCurrency(preview.calculatedValues?.price3)}</strong>
                    </div>
                  </div>
                </div>
              </Card>
            </Card>
          )}

          {/* Senkronizasyon Butonları */}
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} disabled={syncing}>
              Kapat
            </Button>
            <Button
              type="primary"
              onClick={handleSync}
              loading={syncing}
              disabled={!preview || syncing}
              danger
            >
              Senkronize Et
            </Button>
          </div>
        </Form>
      ) : (
        <div>
          {syncResult.success ? (
            <Alert
              message="✅ Senkronizasyon Başarılı"
              description={syncResult.message}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          ) : (
            <Alert
              message="❌ Senkronizasyon Başarısız"
              description={syncResult.message}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {syncResult.errors && syncResult.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                Hata Detayları:
              </p>
              <div className="text-xs text-red-600 dark:text-red-300 space-y-1">
                {syncResult.errors.map((err: any, idx: number) => (
                  <div key={idx}>
                    <strong>{err.sku}:</strong> {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button type="primary" onClick={handleClose}>
              Kapat
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
