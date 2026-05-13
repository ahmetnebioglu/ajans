"use client";

import { Table } from "antd";

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

interface OrderItem {
  id?: string | number;
  productName: string;
  productSku: string;
  productQuantity: number;
  productPrice: number;
}

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  amount: number;
  finalAmount: number;
}

export default function OrderItemsTable({
  orderItems,
  amount,
  finalAmount,
}: OrderItemsTableProps) {
  const kalemColumns = [
    {
      title: "Ürün Adı",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: any) => (
        <div className="flex flex-col">
          <span className="font-semibold">{text}</span>
          <span className="text-xs text-slate-400 font-mono">
            SKU: {record.productSku}
          </span>
        </div>
      ),
    },
    {
      title: "Adet",
      dataIndex: "productQuantity",
      key: "productQuantity",
      align: "right" as const,
      render: (val: number) => val || 0,
    },
    {
      title: "Birim Fiyat",
      dataIndex: "productPrice",
      key: "productPrice",
      align: "right" as const,
      render: (val: number) => formatPrice(val),
    },
    {
      title: "Toplam",
      key: "total",
      align: "right" as const,
      render: (_: any, record: any) =>
        formatPrice((record.productPrice || 0) * (record.productQuantity || 0)),
    },
  ];

  return (
    <Table
      columns={kalemColumns}
      dataSource={orderItems}
      rowKey={(r: any, i: any) => r.id ?? i}
      size="small"
      pagination={false}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row className="bg-slate-50">
            <Table.Summary.Cell index={0} colSpan={3} align="right">
              <span className="font-semibold">Ara Toplam:</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <span className="font-semibold">{formatPrice(amount)}</span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
          <Table.Summary.Row className="bg-blue-50">
            <Table.Summary.Cell index={0} colSpan={3} align="right">
              <span className="font-bold text-blue-700">Genel Toplam:</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <span className="font-bold text-blue-700">
                {formatPrice(finalAmount)}
              </span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
}
