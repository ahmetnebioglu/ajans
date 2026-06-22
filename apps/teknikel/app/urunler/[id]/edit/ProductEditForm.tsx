'use client';

import { useState } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Row, Col, Card, Divider, Modal } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, ShoppingCartOutlined, BarcodeOutlined, DollarOutlined, PercentageOutlined, NumberOutlined, TagOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { updateProductAction } from '@/app/actions/product-actions';
import { useRouter } from 'next/navigation';

interface ProductEditFormProps {
  product: any; // safeProduct from server
}

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const handleCancel = () => {
    if (isChanged) {
      Modal.confirm({
        title: 'Değişiklikleri İptal Et',
        content: 'Yaptığınız değişiklikler kaydedilmeyecek. Sayfadan ayrılmak istediğinize emin misiniz?',
        okText: 'Evet, Ayrıl',
        cancelText: 'Hayır, Devam Et',
        okButtonProps: { danger: true },
        onOk: () => router.push(`/urunler/${product.id}`)
      });
    } else {
      router.push(`/urunler/${product.id}`);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const dataToUpdate = {
        name: values.name,
        sku: values.sku,
        barcode: values.barcode,
        stockAmount: values.stockAmount,
        price1: values.price1,
        price2: values.price2,
        price3: values.price3,
        tax: values.tax,
        taxIncluded: values.taxIncluded ? true : false,
      };

      const result = await updateProductAction(product.id, dataToUpdate);

      if (result.success) {
        message.success('Ürün başarıyla güncellendi.');
        router.push(`/urunler/${product.id}`);
        router.refresh();
      } else {
        message.error(result.error || 'Güncelleme başarısız oldu.');
      }
    } catch (error) {
      message.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const price2Obj = product.prices?.find((p: any) => p.type === 2);
  const price3Obj = product.prices?.find((p: any) => p.type === 3);

  const initialValues = {
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    stockAmount: product.stockAmount,
    price1: product.price1,
    price2: product.price2 !== undefined ? product.price2 : price2Obj?.value,
    price3: product.price3 !== undefined ? product.price3 : price3Obj?.value,
    tax: product.tax,
    taxIncluded: product.taxIncluded === 1 || product.taxIncluded === true,
  };

  return (
    <>
      {/* Başlık ve Geri Butonu */}
      <div className="mb-6 flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0">
            Ürünü Düzenle: {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-400 text-sm font-mono">
              {product.sku}
            </span>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        onValuesChange={() => setIsChanged(true)}
        requiredMark="optional"
      >
      <Row gutter={[24, 24]}>
        {/* Sol Kolon */}
        <Col xs={24} lg={16}>
          <div className="flex flex-col gap-6">
            {/* Temel Bilgiler Kartı */}
            <Card 
              title={<span className="flex items-center gap-2 text-slate-800 dark:text-slate-100"><InfoCircleOutlined className="text-primary" /> Temel Bilgiler</span>} 
              className="shadow-sm border-slate-100 dark:border-slate-800"
              styles={{ header: { borderBottom: '1px solid #f1f5f9' } }}
            >
              <Form.Item
                name="name"
                label={<span className="font-medium">Ürün Adı</span>}
                rules={[{ required: true, message: 'Ürün adı zorunludur' }]}
              >
                <Input size="large" placeholder="Örn: Mavi Tişört" prefix={<TagOutlined className="text-slate-400" />} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="sku"
                    label={<span className="font-medium">Stok Kodu (SKU)</span>}
                    rules={[{ required: true, message: 'Stok kodu zorunludur' }]}
                  >
                    <Input size="large" placeholder="SKU-123" prefix={<NumberOutlined className="text-slate-400" />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="barcode"
                    label={<span className="font-medium">Barkod</span>}
                  >
                    <Input size="large" placeholder="8690000000000" prefix={<BarcodeOutlined className="text-slate-400" />} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Fiyatlandırma Kartı */}
            <Card 
              title={<span className="flex items-center gap-2 text-slate-800 dark:text-slate-100"><DollarOutlined className="text-emerald-500" /> Fiyatlandırma</span>} 
              className="shadow-sm border-slate-100 dark:border-slate-800"
              styles={{ header: { borderBottom: '1px solid #f1f5f9' } }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    name="price1"
                    label={<span className="font-medium">Fiyat 1</span>}
                    rules={[{ required: true, message: 'Fiyat 1 zorunludur' }]}
                    className="mb-0"
                  >
                    <InputNumber
                      size="large"
                      style={{ width: '100%' }}
                      className="w-full"
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="₺"
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="price2"
                    label={<span className="font-medium text-slate-500">Fiyat 2 (İsteğe Bağlı)</span>}
                    className="mb-0"
                  >
                    <InputNumber
                      size="large"
                      style={{ width: '100%' }}
                      className="w-full"
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="₺"
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="price3"
                    label={<span className="font-medium text-slate-500">Fiyat 3 (İsteğe Bağlı)</span>}
                    className="mb-0"
                  >
                    <InputNumber
                      size="large"
                      style={{ width: '100%' }}
                      className="w-full"
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="₺"
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="my-4" />

              <Row gutter={16} align="middle">
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="tax"
                    label={<span className="font-medium">KDV Oranı (%)</span>}
                    rules={[{ required: true, message: 'KDV oranı zorunludur' }]}
                    className="mb-0 sm:mb-6"
                  >
                    <InputNumber 
                      size="large" 
                      className="w-full" 
                      min={0} 
                      max={100} 
                      prefix={<PercentageOutlined className="text-slate-400" />} 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="taxIncluded"
                    valuePropName="checked"
                    className="mb-0 mt-2 sm:mt-7"
                  >
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Switch />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Fiyatlara KDV Dahil</span>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        </Col>

        {/* Sağ Kolon */}
        <Col xs={24} lg={8}>
          <div className="flex flex-col gap-6">
            
            {/* Stok Kartı */}
            <Card 
              title={<span className="flex items-center gap-2 text-slate-800 dark:text-slate-100"><ShoppingCartOutlined className="text-orange-500" /> Envanter</span>} 
              className="shadow-sm border-slate-100 dark:border-slate-800"
            >
              <Form.Item
                name="stockAmount"
                label={<span className="font-medium">Stok Miktarı</span>}
                rules={[{ required: true, message: 'Stok miktarı zorunludur' }]}
                className="mb-0"
              >
                <InputNumber 
                  size="large" 
                  className="w-full" 
                  min={0} 
                  addonAfter={product.stockTypeLabel || 'Adet'}
                />
              </Form.Item>
              <div className="mt-3 text-xs text-slate-400">
                Bu üründen deponuzda kaç adet bulunduğunu belirtin.
              </div>
            </Card>

            {/* Aksiyonlar Kartı */}
            <Card className="shadow-sm border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex flex-col gap-3">
                <Button 
                  type="primary" 
                  size="large"
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  disabled={!isChanged}
                  className="w-full shadow-md"
                >
                  Değişiklikleri Kaydet
                </Button>
                <Button 
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleCancel} 
                  disabled={loading}
                  className="w-full"
                >
                  Vazgeç ve Geri Dön
                </Button>
              </div>
            </Card>

          </div>
        </Col>
      </Row>
    </Form>
    </>
  );
}
