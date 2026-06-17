"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Space,
  Card,
  Spin,
  Tooltip,
  message,
} from "antd";
import { Download, Search, RotateCcw, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";

interface SmsRecord {
  id: string;
  recipient: string;
  message: string;
  type: string;
  status: string;
  messageId?: string;
  responseCode?: string;
  responseMessage?: string;
  createdAt: string;
}

interface Filters {
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

const smsTypeLabels: Record<string, string> = {
  manual: "Manuel Gönderim",
  order: "Sipariş Bildirimi",
  notification: "Bildirim",
  reminder: "Hatırlatma",
  other: "Diğer",
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "warning", label: "Beklemede" },
  sent: { color: "success", label: "Gönderildi" },
  failed: { color: "error", label: "Başarısız" },
};

const formatPhoneNumber = (number: string) => {
  if (!number) return "";
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  return number;
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: tr });
  } catch {
    return "Geçersiz tarih";
  }
};

export default function SmsGecmisiClient() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SmsRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    type: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const fetchSmsRecords = useCallback(async (currentFilters?: Filters) => {
    setLoading(true);
    try {
      const f = currentFilters || filters;
      const params = new URLSearchParams();
      if (f.type) params.append("type", f.type);
      if (f.status) params.append("status", f.status);
      if (f.startDate) params.append("startDate", f.startDate);
      if (f.endDate) params.append("endDate", f.endDate);

      const response = await fetch(`/api/ideasoft/sms/records?${params.toString()}`);
      const data = await response.json();

      if (data && data.status === "success") {
        setRecords(data.data || []);
        setTotalCount(data.count || 0);
      } else {
        console.error("SMS kayıtları getirilemedi:", data);
      }
    } catch (error) {
      console.error("SMS kayıtları alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSmsRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchSmsRecords(filters);
  };

  const resetFilters = () => {
    const emptyFilters: Filters = { type: "", status: "", startDate: "", endDate: "" };
    setFilters(emptyFilters);
    fetchSmsRecords(emptyFilters);
  };

  const exportToCsv = () => {
    const BOM = "\uFEFF";
    const headers = ["ID", "Alıcı", "Mesaj", "Tür", "Durum", "Mesaj ID", "Yanıt Kodu", "Yanıt Mesajı", "Tarih"].join(",");

    const csvRows = records.map((record) => {
      const escape = (value: any) => {
        if (value === null || value === undefined) return "";
        return `"${String(value).replace(/"/g, '""')}"`;
      };

      return [
        record.id,
        escape(record.recipient),
        escape(record.message),
        escape(smsTypeLabels[record.type] || record.type),
        escape(record.status),
        escape(record.messageId),
        escape(record.responseCode),
        escape(record.responseMessage),
        escape(formatDate(record.createdAt)),
      ].join(",");
    });

    const csvContent = BOM + [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sms-raporu-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("CSV dosyası indirildi");
  };

  const columns: ColumnsType<SmsRecord> = [
    {
      title: "Alıcı",
      dataIndex: "recipient",
      key: "recipient",
      width: 160,
      render: (value: string) => (
        <span className="font-mono text-xs">{formatPhoneNumber(value)}</span>
      ),
    },
    {
      title: "Mesaj",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (value: string) => (
        <Tooltip title={value}>
          <span className="text-xs">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: "Tür",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (value: string) => (
        <span className="text-xs">{smsTypeLabels[value] || value}</span>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: string) => {
        const config = statusConfig[value] || { color: "default", label: value };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Mesaj ID",
      dataIndex: "messageId",
      key: "messageId",
      width: 120,
      render: (value: string) => (
        <span className="font-mono text-xs">{value || "-"}</span>
      ),
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (value: string) => (
        <span className="text-xs">{formatDate(value)}</span>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            SMS Geçmişi
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Toplam {totalCount} SMS kaydı bulundu
          </p>
        </div>
        <Button
          icon={<Download size={16} />}
          onClick={exportToCsv}
          disabled={records.length === 0}
        >
          CSV İndir
        </Button>
      </div>

      {/* Filtreler */}
      <Card
        size="small"
        className={`mb-4 ${isDark ? "bg-zinc-900 border-white/10" : ""}`}
      >
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className={`text-xs font-medium block mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              SMS Türü
            </label>
            <Select
              value={filters.type || undefined}
              onChange={(val) => handleFilterChange("type", val || "")}
              placeholder="Tümü"
              allowClear
              className="w-full"
              size="middle"
              options={[
                { value: "manual", label: "Manuel Gönderim" },
                { value: "order", label: "Sipariş Bildirimi" },
                { value: "notification", label: "Bildirim" },
                { value: "reminder", label: "Hatırlatma" },
                { value: "other", label: "Diğer" },
              ]}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className={`text-xs font-medium block mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Durum
            </label>
            <Select
              value={filters.status || undefined}
              onChange={(val) => handleFilterChange("status", val || "")}
              placeholder="Tümü"
              allowClear
              className="w-full"
              size="middle"
              options={[
                { value: "pending", label: "Beklemede" },
                { value: "sent", label: "Gönderildi" },
                { value: "failed", label: "Başarısız" },
              ]}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className={`text-xs font-medium block mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Başlangıç Tarihi
            </label>
            <DatePicker
              onChange={(_: Dayjs | null, dateString: string | string[]) =>
                handleFilterChange("startDate", Array.isArray(dateString) ? dateString[0] : dateString)
              }
              className="w-full"
              size="middle"
              placeholder="Seçiniz"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className={`text-xs font-medium block mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Bitiş Tarihi
            </label>
            <DatePicker
              onChange={(_: Dayjs | null, dateString: string | string[]) =>
                handleFilterChange("endDate", Array.isArray(dateString) ? dateString[0] : dateString)
              }
              className="w-full"
              size="middle"
              placeholder="Seçiniz"
            />
          </div>
          <Space>
            <Button
              type="primary"
              icon={<Search size={14} />}
              onClick={applyFilters}
            >
              Filtrele
            </Button>
            <Button
              icon={<RotateCcw size={14} />}
              onClick={resetFilters}
            >
              Temizle
            </Button>
          </Space>
        </div>
      </Card>

      {/* Tablo */}
      <Card
        className={isDark ? "bg-zinc-900 border-white/10" : ""}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            defaultPageSize: 100,
            pageSizeOptions: ["50", "100", "250", "500"],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  SMS kaydı bulunamadı
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
