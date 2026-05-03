"use client";

import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  App,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { createCariAction } from "../actions/bilsoft-actions";
import { useRouter } from "next/navigation";

interface CariEkleDrawerProps {
  open: boolean;
  onClose: () => void;
}

const { Text } = Typography;

export default function CariEkleDrawer({ open, onClose }: CariEkleDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // API'nin beklediği payload yapısına dönüştür
      const payload = {
        cariAd: values.faturaUnvan,
        yetkili: values.yetkili,
        vergiDairesi: values.vergiDairesi,
        vergiNo: values.vergiNo,
        telefon: values.tel,
        yetkiliTelefon: values.cep,
        email: values.mail,
        il: values.faturaIl,
        ilce: values.faturaIlce,
        adres: values.faturaAdres,
      };

      const result = await createCariAction(payload as any);

      if (result.success) {
        message.success(result.message);
        form.resetFields();
        onClose();
        router.refresh();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Yeni Cari Ekle (Bilsoft)"
      width={500}
      onClose={onClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      extra={
        <Space>
          <Button onClick={onClose}>İptal</Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={loading}
          >
            Kaydet
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark="optional"
        className="cari-ekle-form"
      >
        <div className="mt-0 mb-4">
          <Text
            strong
            className="text-[11px] text-slate-400 uppercase tracking-wider"
          >
            Temel Bilgiler
          </Text>
          <Divider className="my-1" />
        </div>

        <Form.Item
          name="faturaUnvan"
          label="Cari Adı / Ünvan"
          rules={[{ required: true, message: "Lütfen cari adını girin" }]}
        >
          <Input
            placeholder="Örn: ABC Ticaret Ltd. Şti."
            prefix={<BankOutlined className="text-slate-300" />}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="yetkili" label="Yetkili">
              <Input
                placeholder="Ad Soyad"
                prefix={<UserOutlined className="text-slate-300" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="vergiDairesi" label="Vergi Dairesi">
              <Input placeholder="Daire Adı" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="vergiNo" label="Vergi Numarası">
          <Input placeholder="10 Haneli Vergi No" />
        </Form.Item>

        <div className="mt-6 mb-4">
          <Text
            strong
            className="text-[11px] text-slate-400 uppercase tracking-wider"
          >
            İletişim & Adres
          </Text>
          <Divider className="my-1" />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tel" label="Telefon">
              <Input
                placeholder="Sabit Hat"
                prefix={<PhoneOutlined className="text-slate-300" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cep" label="Cep Telefonu">
              <Input
                placeholder="Gsm No"
                prefix={<PhoneOutlined className="text-slate-300" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="mail" label="E-posta Adresi">
          <Input
            placeholder="info@company.com"
            prefix={<MailOutlined className="text-slate-300" />}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="faturaIl" label="İl">
              <Input placeholder="Şehir" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="faturaIlce" label="İlçe">
              <Input placeholder="İlçe" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="faturaAdres" label="Adres Detayı">
          <Input.TextArea rows={3} placeholder="Mahalle, Sokak, No..." />
        </Form.Item>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mt-6">
          <Text className="text-[11px] text-slate-500">
            * Kayıt işlemi tamamlandığında veriler doğrudan Bilsoft Ön Muhasebe
            sistemine aktarılır ve otomatik bir cari kodu (CXXXXXX) atanır.
          </Text>
        </div>
      </Form>
    </Drawer>
  );
}
