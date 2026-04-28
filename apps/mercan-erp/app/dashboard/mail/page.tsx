"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Space, 
  Tag, 
  message, 
  Tooltip,
  Card,
  Typography,
  Empty
} from "antd";
import { 
  Mail, 
  UserPlus, 
  Key, 
  Search, 
  ShieldCheck, 
  RefreshCw,
  User,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";
import { useSession } from "next-auth/react";
import { 
  listWorkspaceUsersAction, 
  createWorkspaceUserAction, 
  toggleUserStatusAction, 
  resetUserPasswordAction 
} from "../../mail/actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const { Title, Text } = Typography;

export default function MailManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  // Modallar
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  
  const [createForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const userRole = (session?.user as any)?.role;
  const isAuthorized = userRole === "ADMIN" || userRole === "HR_MANAGER";

  const loadUsers = async () => {
    setLoading(true);
    const res = await listWorkspaceUsersAction();
    if (res.success) {
      setUsers(res.data || []);
    } else {
      message.error(res.error || "Kullanıcılar yüklenirken bir hata oluştu.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      loadUsers();
    }
  }, [isAuthorized]);

  const handleCreateUser = async (values: any) => {
    setLoading(true);
    const res = await createWorkspaceUserAction(values);
    if (res.success) {
      message.success("Yeni çalışan hesabı başarıyla oluşturuldu.");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      await loadUsers();
    } else {
      message.error(res.error);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (email: string, currentSuspended: boolean) => {
    const res = await toggleUserStatusAction(email, !currentSuspended);
    if (res.success) {
      message.success(`Kullanıcı durumu başarıyla ${!currentSuspended ? "askıya alındı" : "aktif edildi"}.`);
      await loadUsers();
    } else {
      message.error(res.error);
    }
  };

  const handleResetPassword = async (values: any) => {
    if (!selectedUserEmail) return;
    setLoading(true);
    const res = await resetUserPasswordAction(selectedUserEmail, values.password);
    if (res.success) {
      message.success("Şifre başarıyla sıfırlandı.");
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } else {
      message.error(res.error);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.primaryEmail.toLowerCase().includes(searchText.toLowerCase()) ||
    u.name?.fullName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Personel',
      dataIndex: 'name',
      key: 'name',
      render: (name: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-[4px] flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">
              {name?.fullName || record.primaryEmail.split('@')[0]}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Mail size={10} /> {record.primaryEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      render: (lastLogin: string) => {
        if (!lastLogin || lastLogin === "1970-01-01T00:00:00.000Z") return <span className="text-slate-300 text-[10px] font-black uppercase">Hiç Girilmedi</span>;
        return (
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter italic">
              {format(new Date(lastLogin), "d MMMM yyyy", { locale: tr })}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Clock size={8} /> {format(new Date(lastLogin), "HH:mm")}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Durum',
      dataIndex: 'suspended',
      key: 'suspended',
      render: (suspended: boolean, record: any) => (
        <Space>
          <Switch 
            checked={!suspended} 
            onChange={() => handleToggleStatus(record.primaryEmail, suspended)}
            size="small"
            className={!suspended ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"}
          />
          <Tag color={suspended ? "error" : "success"} className="text-[9px] font-black uppercase border-none rounded-[2px] px-2">
            {suspended ? "ASKIDA" : "AKTİF"}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Şifre Sıfırla">
            <Button 
              type="text" 
              icon={<Key size={14} />} 
              onClick={() => {
                setSelectedUserEmail(record.primaryEmail);
                setIsPasswordModalOpen(true);
              }}
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            />
          </Tooltip>
          <Tooltip title="Google Admin Panelde Gör">
            <Button 
              type="text" 
              icon={<ExternalLink size={14} />} 
              href={`https://admin.google.com/ac/users/${record.id}`}
              target="_blank"
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <Card className="max-w-md w-full border-none shadow-2xl dark:bg-zinc-900">
           <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-[4px] flex items-center justify-center rotate-3">
                 <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">YETKİSİZ ERİŞİM</h2>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest leading-relaxed italic">
                Bu sayfaya erişim sadece Mercan OSGB Yöneticileri ve İK Müdürleri ile sınırlandırılmıştır.
              </p>
              <Button href="/dashboard" type="primary" className="bg-zinc-900 h-10 px-8 font-black uppercase tracking-widest rounded-[4px]">PANELE DÖN</Button>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 font-medium italic">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-[4px] flex items-center justify-center shadow-xl rotate-2">
              <Mail size={24} />
            </div>
            <Title level={2} className="m-0 !text-slate-900 dark:!text-white !font-black !tracking-tighter !uppercase !italic !leading-none">
              MAIL / WORKSPACE <span className="text-blue-600">YÖNETİMİ</span>
            </Title>
          </div>
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">
            Google Workspace hesap yönetimi ve personel mail güvenliği.
          </Text>
        </div>

        <Space>
           <Button 
            onClick={loadUsers} 
            icon={loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            className="h-10 px-4 font-black uppercase tracking-widest rounded-[4px] border-slate-200 shadow-sm flex items-center gap-2"
           >
             YENİLE
           </Button>
           <Button 
            type="primary" 
            icon={<UserPlus size={16} />} 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-zinc-900 h-10 px-6 font-black uppercase tracking-widest rounded-[4px] shadow-xl flex items-center gap-2"
           >
            YENİ ÇALIŞAN EKLE
           </Button>
        </Space>
      </div>

      {/* Main Table Section */}
      <Card className="border-none shadow-2xl dark:bg-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="ÇALIŞAN ARA (İSİM VEYA MAİL)..." 
              className="pl-10 h-10 bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-[4px]"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <Table 
          columns={columns as any} 
          dataSource={filteredUsers} 
          loading={loading}
          rowKey="primaryEmail"
          pagination={{ pageSize: 10, position: ['bottomRight'] }}
          className="mercan-table"
          locale={{ emptyText: <Empty description="Kullanıcı bulunamadı" /> }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-tighter italic">
            <UserPlus size={20} className="text-blue-600" />
            YENİ ÇALIŞAN HESABI AÇ
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        className="dark:bg-zinc-900"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateUser} className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="givenName" label="AD" rules={[{ required: true, message: 'Ad gerekli' }]}>
              <Input placeholder="AD" className="h-10 rounded-[4px] uppercase font-black tracking-tight" />
            </Form.Item>
            <Form.Item name="familyName" label="SOYAD" rules={[{ required: true, message: 'Soyad gerekli' }]}>
              <Input placeholder="SOYAD" className="h-10 rounded-[4px] uppercase font-black tracking-tight" />
            </Form.Item>
          </div>
          <Form.Item name="emailPrefix" label="E-POSTA KULLANICI ADI" rules={[{ required: true, message: 'Email kullanıcı adı gerekli' }]}>
            <Input placeholder="ahmet.yilmaz" addonAfter={`@${session?.user?.tenantId === 'mercan' ? 'mercanosgb.com.tr' : '...'}`} className="h-10 rounded-[4px] font-black tracking-tight" />
          </Form.Item>
          <div className="mt-6 flex gap-3">
             <Button onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-10 font-black uppercase tracking-widest rounded-[4px]">İPTAL</Button>
             <Button type="primary" htmlType="submit" className="flex-1 bg-blue-600 h-10 font-black uppercase tracking-widest rounded-[4px]" loading={loading}>HESAP OLUŞTUR</Button>
          </div>
        </Form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-tighter italic">
            <Key size={20} className="text-amber-600" />
            ŞİFRE SIFIRLA
          </div>
        }
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleResetPassword} className="pt-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-[4px] border border-blue-100 dark:border-blue-800">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ŞİFRESİ SIFIRLANACAK HESAP</p>
             <p className="text-xs font-black text-blue-600 dark:text-blue-400">{selectedUserEmail}</p>
          </div>
          <Form.Item name="password" label="YENİ ŞİFRE" rules={[{ required: true, min: 8, message: 'Şifre en az 8 karakter olmalıdır' }]}>
            <Input.Password placeholder="YENİ ŞİFRE" className="h-10 rounded-[4px]" />
          </Form.Item>
          <div className="mt-6 flex gap-3">
             <Button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 h-10 font-black uppercase tracking-widest rounded-[4px]">İPTAL</Button>
             <Button type="primary" htmlType="submit" className="flex-1 bg-amber-600 h-10 font-black uppercase tracking-widest rounded-[4px]" loading={loading}>ŞİFREYİ GÜNCELLE</Button>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .mercan-table .ant-table {
          background: transparent !important;
        }
        .mercan-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .dark .mercan-table .ant-table-thead > tr > th {
          background: #18181b !important;
          color: #71717a !important;
          border-bottom: 1px solid #27272a !important;
        }
        .mercan-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          transition: all 0.3s;
        }
        .dark .mercan-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #27272a !important;
        }
        .mercan-table .ant-table-row:hover > td {
          background: #f8fafc !important;
        }
        .dark .mercan-table .ant-table-row:hover > td {
          background: #18181b !important;
        }
      `}</style>
    </div>
  );
}
