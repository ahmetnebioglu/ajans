# ERP Multi-Tenant & Custom RBAC Master Plan

Bu doküman, ERP sisteminin kullanıcı kayıt, çoklu çalışma alanı (workspace) yönetimi, modül abonelikleri (Drive, CMS, HR, CRM) ve gelişmiş Özel Rol Tabanlı Erişim Kontrolü (Custom RBAC) mimarisinin nasıl inşa edileceğini detaylandırır. Yeni yapı ile `saas-admin` ihtiyacı yerine, `erp` projesi kendi public sayfalarından kayıt alacak ve on-boarding süreçlerini kendisi yönetecektir.

## Karara Bağlanan Konular (Kullanıcı Geri Bildirimi)

1. **Global Rol Yönetimi:** Sistemin sahiplerine ait global roller (`SUPER_ADMIN`, `SYSTEM_SUPPORT`) var olmaya devam edecek. Bu roller sistem geneli paket yönetimi ve destek talepleri için esnek tutulacak.
2. **Kavramsal İsimlendirme:** CRM sisteminde müşterilerin eklendiği varlıkların (`Company`) karışmaması için, hesap oluşturulan ana varlık (Tenant) veritabanı dahil tüm katmanlarda **Workspace** olarak adlandırılacaktır.
3. **Workspace Değiştirici:** Bir kullanıcı birden fazla Workspace'e ait olabileceği için, profil menüsünün bulunduğu alana aktif çalışılan çalışma alanını değiştirecek (Switch) bir **Workspace Switcher** eklenecektir.

---

## Proposed Changes

### 1. Database Schema (Prisma) Güncellemeleri

Kullanıcı geri bildirimi doğrultusunda, Prisma şemasında varlık kargaşasını önlemek adına `Company` tablosunun adı **`Workspace`** olarak değiştirilecek ve ilişkili yapı (örneğin `CompanyAccess`) **`WorkspaceUser`** olarak güncellenecektir.

#### [MODIFY] packages/db/prisma/schema.prisma

- **Global Roller:**
  ```prisma
  enum Role {
    USER
    SUPER_ADMIN      // Sistemin teknik ve paket yöneticisi
    SYSTEM_SUPPORT   // Sistem destek uzmanı
  }
  ```

- **Workspace ve Modül Yönetimi:**
  ```prisma
  enum AppModule {
    DRIVE
    CMS
    HR
    CRM
  }
  
  model Workspace {
    id            String   @id @default(cuid())
    name          String
    tenantId      String   @unique // RLS için aynı zamanda benzersiz kimlik
    activeModules AppModule[] @default([DRIVE, CMS, HR, CRM])
    // Diğer firma/adres bilgileri...
    
    users         WorkspaceUser[]
    roles         WorkspaceRole[]
  }
  ```

- **Dinamik Roller ve İzinler:**
  Kullanıcıların Workspace bazında roller oluşturabilmesi için aşağıdaki yapı kurulacaktır.
  ```prisma
  model WorkspaceRole {
    id          String   @id @default(cuid())
    name        String   // Örn: "İK Yöneticisi", "Sadece Okur"
    workspaceId String
    permissions String[] // Örn: ["HR_READ", "HR_WRITE", "CRM_READ"]
    isDefault   Boolean  @default(false) 
    
    workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
    users       WorkspaceUser[]
    
    @@unique([workspaceId, name])
  }
  ```

- **WorkspaceUser (Eski CompanyAccess):**
  Kullanıcının o workspace'teki rolünü dinamik alır.
  ```prisma
  model WorkspaceUser {
    id          String   @id @default(cuid())
    userId      String
    workspaceId String
    roleId      String?  
    
    workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
    user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
    role        WorkspaceRole? @relation(fields: [roleId], references: [id])
    
    @@unique([userId, workspaceId])
  }
  ```

---

### 2. ERP Public Pages & Onboarding Flow

`erp` projesinin public (`/`) dizini ürün tanıtım sayfaları (Landing Page, Fiyatlandırma, Özellikler) için kullanılacaktır.

#### [NEW] apps/erp/app/(public)/*
- `/` - Landing page (ERP Modülleri Tanıtımı)
- `/register` - Yeni kullanıcı kayıt sayfası.
- `/onboarding` - Kayıt sonrası kullanıcının ilk "Workspace" oluşturduğu adım.

**Onboarding Akışı:**
1. Kullanıcı kayıt olur ve `/onboarding` sayfasına yönlendirilir.
2. Workspace adını girer.
3. `Workspace` oluşturulur, `WorkspaceRole` olarak "Admin" rolü tanımlanır ve kullanıcı `WorkspaceUser` üzerinden atanır.
4. `tenantId` session'a kaydedilir ve kullanıcı `/dashboard`'a geçer.

---

### 3. Settings & Workspace Management

Kullanıcılar ERP dashboard içinde kendi çalışma alanlarını yönetebilir ve kolayca başka çalışma alanlarına geçiş (Switch) yapabilirler.

#### [NEW] apps/erp/app/dashboard/settings/workspace/page.tsx
- Çalışma alanı genel ayarları.
- Modül listesi ve faturalandırma (şimdilik tümü ücretsiz).

#### [NEW] apps/erp/app/dashboard/settings/roles/page.tsx
- Dinamik rol oluşturma ekranı. Kullanıcılar izinleri (Permissions) Checkbox ile seçebilir.

#### [NEW] apps/erp/app/dashboard/settings/users/page.tsx
- Çalışma alanına (Workspace) kullanıcı davet etme ekranı. Yeni eklenen kullanıcıya dinamik rol atanır.

#### [MODIFY] apps/erp/app/components/dashboard/WorkspaceSwitcher.tsx
- Profil menüsünün yanına entegre edilecek.
- Session içerisinde tutulan `availableWorkspaces` üzerinden hızlı geçiş sağlar ve seçilen `workspaceId`'yi session update metodu ile yeniler.

---

### 4. Auth & Session Güncellemesi

`packages/auth/src/options.ts` dosyası, kullanıcının o an aktif olduğu Workspace'i ve sahip olduğu izinleri bilecek şekilde güncellenecektir.

- Session içerisine `currentWorkspaceId` ve o workspace'te sahip olduğu `permissions: string[]` eklenecek.
- Kullanıcı firmalar arası geçiş yaptığında (Switch Workspace), auth session `update()` metodu ile yenilenip yeni firmanın yetkileri session'a yüklenecek.

---

## Verification Plan

### Automated Tests
- Playwright E2E Test: Yeni kullanıcının kayıt olması, onboarding ile Workspace kurması ve dashboard'a yönlendirilmesi test edilecek.
- Playwright E2E Test: Dinamik rol oluşturup (Sadece CRM_READ), davet edilen kullanıcının başka modüllere (Örn: CMS) erişemediği doğrulanacak.

### Manual Verification
- Veritabanı (Prisma Studio) üzerinden `WorkspaceRole` ve `WorkspaceUser` bağlantılarının doğruluğu incelenecek.
- Workspace Switcher kullanarak çalışma alanları arasında geçerken verilerin (örn: Lead listesi) doğru RLS (Row Level Security) bağlamında yüklendiği doğrulanacak.
