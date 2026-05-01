import React from "react";
import { Table, Tag, Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;

interface UserType {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string | null;
}

export default function UserTable({ data }: { data: UserType[] }) {
  const columns: ColumnsType<UserType> = [
    {
      title: "Ad / Soyad",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-bold">{text || "Belirtilmemiş"}</span>,
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "blue";
        if (role === "ADMIN") color = "gold";
        if (role === "CUSTOMER") color = "green";
        return (
          <Tag color={color} className="font-bold">
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Kayıt Tarihi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    },
  ];

  return (
    <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
      <div className="mb-6">
        <Title level={4} className="m-0 font-black tracking-tight uppercase italic">
          Kullanıcı <span className="text-primary">Yönetimi</span>
        </Title>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
}
