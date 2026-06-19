/**
 * ERP Modül Bazlı İzin Tanımları
 * 
 * Her modül (DRIVE, CMS, HR, CRM) için READ ve WRITE izinleri tanımlanır.
 * WorkspaceRole oluşturulurken bu listeden seçim yapılır.
 */

// İzin kategorileri ve etiketleri
export const PERMISSION_MODULES = [
  {
    module: "DRIVE",
    label: "Drive (Dosya Yönetimi)",
    permissions: [
      { key: "DRIVE_READ", label: "Dosyaları Görüntüle" },
      { key: "DRIVE_WRITE", label: "Dosya Yükle / Düzenle" },
      { key: "DRIVE_DELETE", label: "Dosya Sil" },
    ],
  },
  {
    module: "CMS",
    label: "CMS (İçerik Yönetimi)",
    permissions: [
      { key: "CMS_READ", label: "İçerikleri Görüntüle" },
      { key: "CMS_WRITE", label: "İçerik Oluştur / Düzenle" },
      { key: "CMS_DELETE", label: "İçerik Sil" },
    ],
  },
  {
    module: "HR",
    label: "HR (İnsan Kaynakları)",
    permissions: [
      { key: "HR_READ", label: "İK Verilerini Görüntüle" },
      { key: "HR_WRITE", label: "İK Verisi Oluştur / Düzenle" },
      { key: "HR_DELETE", label: "İK Verisi Sil" },
    ],
  },
  {
    module: "CRM",
    label: "CRM (Müşteri İlişkileri)",
    permissions: [
      { key: "CRM_READ", label: "Müşterileri Görüntüle" },
      { key: "CRM_WRITE", label: "Müşteri Oluştur / Düzenle" },
      { key: "CRM_DELETE", label: "Müşteri Sil" },
    ],
  },
  {
    module: "SETTINGS",
    label: "Ayarlar (Workspace Yönetimi)",
    permissions: [
      { key: "SETTINGS_ROLES", label: "Rol Yönetimi" },
      { key: "SETTINGS_USERS", label: "Kullanıcı Yönetimi" },
      { key: "SETTINGS_WORKSPACE", label: "Workspace Ayarları" },
    ],
  },
] as const;

// Tüm izin key'lerinin düz listesi
export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key)
);

// Admin rolü için tüm izinler (Workspace oluşturulurken varsayılan Admin rolüne atanır)
export const ADMIN_PERMISSIONS = [...ALL_PERMISSIONS];

// Tip tanımı
export type PermissionKey = (typeof ALL_PERMISSIONS)[number];
