# Ajans Monorepo - AI Agent (AG) Anayasası ve Mimari Rehber

Bu dosya, projenin teknik standartlarını, güvenlik protokollerini ve AI Agent'ın (AG) uyması gereken katı kuralları tanımlar. Her prompt sonrası bu kurallara sadık kalındığı doğrulanmalıdır.

## 1. Proje Kimliği ve Teknoloji Yığını

- **Mimari:** Turborepo (Monorepo) - Pnpm Workspaces
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Veritabanı:** Prisma (PostgreSQL) + RLS (Row Level Security)
- **Auth:** NextAuth.js (Özelleştirilmiş @ajans/auth paketi)
- **UI/Styling:** Tailwind CSS + shadcn/ui + Lucide Icons

## 2. Çalışma Alanları (Workspace Mapping)

- **apps/mercan-website:** Kurumsal vitrin (Marketing).
- **apps/erp:** Ajans yönetim ve CRM paneli (Premium/Dark UI).
- **apps/saas-admin:** SaaS paket ve ödeme yönetimi paneli.
- **packages/db:** Prisma şeması ve `getSecuredPrisma` (Güvenlik Kapısı).
- **packages/core:** Paylaşılan Server Action'lar ve iş mantığı.
- **packages/ui:** Projeler arası ortak UI kütüphanesi.
- **packages/crm:** Ortak Kanban ve Lead yönetim motoru (Headless).

## 3. Veritabanı ve RLS (Dokunulmazlık Maddeleri)

### 3.1 Güvenli Erişim Kuralları

- **Güvenli Erişim:** Veritabanına ASLA doğrudan `prisma` objesiyle erişme. Daima `getSecuredPrisma()` fonksiyonunu kullan.
- **İzolasyon:** `getSecuredPrisma()`, session üzerinden `tenantId` süzgecini otomatik uygular. Sorgularda manuel `tenantId` filtresine gerek yoktur.
- **Yazma İşlemleri:** Yeni kayıt oluştururken (`create`), `tenantId` alanını session'dan gelen veriyle zorunlu olarak doldur.
- **Soft Delete:** Fiziksel silme (`delete()`) KESİNLİKLE yasaktır. Daima `deletedAt: new Date()` ile güncelleme yap.

### 3.2 RLS (Row Level Security) Kullanım Kılavuzu

**Ne zaman hangi fonksiyonu kullanmalı?**

| Senaryo                                                   | Fonksiyon                    | Açıklama                                                                    |
| --------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| **Tenant verisi oku/yaz** (Lead, Company, vb.)            | `getSecuredPrisma(tenantId)` | RLS policy'leri otomatik devreye girer. Tenant izolasyonu garantili.        |
| **Sistem servisleri** (Cron, Webhook, Background Job)     | `getServicePrisma()`         | Belirli bir tenant'a kilitli işlemler için. RLS policy'leri uygulanır.      |
| **Auth ve Dev araçları** (NextAuth callback, seed script) | `unsecured_prisma`           | User tablosu (cross-tenant) ve dev amaçlı işlemler için. RLS bypass edilir. |

**Örnek Kullanımlar:**

```typescript
// ✅ DOĞRU: Server Action'da tenant verisi işleme
import { getSecuredPrisma } from "@ajans/db";

export async function createLead(data: LeadInput) {
  const db = getSecuredPrisma("teknikel");
  return db.lead.create({
    data: {
      ...data,
      tenantId: "teknikel", // RLS policy'si bunu kontrol eder
    },
  });
}

// ✅ DOĞRU: API route'da tenant verisi sorgulama
export async function GET(req: Request) {
  const db = getSecuredPrisma("teknikel");
  const leads = await db.lead.findMany(); // RLS otomatik filtreler
  return NextResponse.json(leads);
}

// ✅ DOĞRU: Cron job'da sistem servisi
import { getServicePrisma } from "@ajans/db";

export async function GET(request: Request) {
  const db = getServicePrisma();
  const tokens = await db.apiToken.findMany(); // Cross-tenant sistem verisi
  return NextResponse.json({ status: "ok" });
}

// ❌ YANLIŞ: Doğrudan unsecured_prisma kullanımı (tenant verisi için)
import { unsecured_prisma } from "@ajans/db";

export async function GET() {
  const leads = await unsecured_prisma.lead.findMany(); // RLS bypass! Tüm tenant'lar görünür
  return NextResponse.json(leads);
}
```

**RLS Güvenlik Garantileri:**

- ✅ `getSecuredPrisma()` ile yapılan sorgular **otomatik olarak** `tenantId` filtresi alır
- ✅ Kod hatası (WHERE clause unutma) halinde bile RLS policy'leri devreye girer
- ✅ 15 tablo RLS ile korunuyor: Lead, LeadActivity, Company, Folder, Report, AuditLog, Classroom, Student, ParentStudent, PermissionRequest, JobPosting, Candidate, LeaveRequest, ServiceAccount, NewsletterSubscriber
- ✅ Production'da `app_user` (BYPASSRLS yok) ile bağlantı yapılır → RLS her zaman aktif

**RLS Test Etme:**

```bash
# RLS durumunu kontrol et
node scripts/check-rls.js

# Tenant izolasyonunu test et (app_user ile)
node scripts/test-rls-isolation-real.js
```

**Dikkat Edilecekler:**

1. **Tenant Context Zorunlu:** `getSecuredPrisma()` çağrısında `tenantId` parametresi zorunludur. Dinamik tenant'lar için session'dan alın.
2. **User Tablosu:** NextAuth uyumluluğu için User tablosu RLS'siz bırakılmıştır (cross-tenant).
3. **Performance:** RLS her sorguya WHERE eklediği için index'lerin `(tenantId, ...)` şeklinde olması kritiktir.
4. **Rollback:** Migration geri alınması gerekirse: `DROP POLICY tenant_isolation ON "TableName"; ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;`

## 4. Next.js 16 ve Geliştirme Standartları

- **Proxy Katmanı:** Middleware yerine Next.js 16 standardı olan `proxy.ts` yapısını kullan.
- **Server/Client Boundary:** İş mantığını `@ajans/core` altındaki "use server" aksiyonlarında tut. İstemci tarafında sadece arayüz etkileşimlerini yönet.
- **Turbopack Uyumu:** `ReferenceError: _server is not defined` hatalarını önlemek için sunucu kodlarını istemciye sızdırma.
- **Önbellek:** Veri güncellemelerinden sonra `revalidateTenantCache(tenantId, tag)` veya `revalidatePath` kullan.

## 5. UI/UX ve Tasarım Dili (Universal Angular Style - UAS)

- **Felsefe:** "Serious Tools for Serious Work". Bubbly ve aşırı yuvarlak hatlardan kaçınılmalıdır.
- **Radius:** Proje fark etmeksizin tüm bileşenlerde (Buton, Kart, Input, Modal) sabit `rounded-[2px]` kullanılmalıdır. (Gözle görülür ama bıçak gibi keskin olmayan o sihirli dokunuş).
- **Padding & Spacing:** "High Density" (Yüksek Yoğunluk) yerleşim esastır. `p-6` yerine `p-4`, `p-4` yerine `p-3` kullanarak ekranda %30 daha fazla veri gösterimi hedeflenir.
- **Okul ERP Özel:** Keskin hatlar korunurken, renk paletinde güven veren pastel tonlar kullanılabilir; ancak form yapısı asla "soft" olmamalıdır.
- **Mercan ERP Özel:** Keskin hatlar + yüksek kontrastlı koyu tema (`bg-zinc-950`).

## 6. Token Tasarrufu ve Agent Davranışı

- **Nokta Atışı Tarama:** `.next`, `.turbo`, `node_modules` ve `dist` klasörlerini KESİNLİKLE tarama.
- **Context Limit:** Sadece ilgili workspace içindeki dosyalara odaklan. `erp` düzenlerken `okul-erp` dosyalarını bağlam içine alma.
- **Kod Yazımı:** Gereksiz yorum satırlarından kaçın, sadece `agent.md` kurallarına uymayan durumları açıkla.
- **`getServerSession` Çağrısı:** Layout'larda `getServerSession` çağrısı yapılır ve sonuç page/component'lere **prop olarak** geçilir. Aynı session'ı birden fazla kez çekmek yasaktır (her çağrı ~50-100ms + token maliyeti).
- **Debug Console Satırları:** `console.log`, `console.warn`, `console.error` satırları sadece geliştirme aşamasında kullanılır. Production'da bu satırlar **kaldırılmalı** veya `process.env.NODE_ENV === "development"` koşuluyla sarılmalıdır.
- **`any` Tipi Yasağı:** Bölüm 7'de belirtildiği gibi `any` tipi kesinlikle yasaktır. Fonksiyon parametreleri ve veri yapıları için açık Interface/Type tanımlanmalıdır.
- **`force-dynamic` Yerine `revalidate`:** Mümkün olduğunca `export const dynamic = "force-dynamic"` yerine `export const revalidate = 60` (veya uygun TTL) kullanılmalıdır. `force-dynamic` her request'te yeniden render eder ve token maliyeti yüksektir.

## 7. Yazım Konvansiyonları

- **TypeScript:** `any` kullanımı yasaktır, daima Interface/Type tanımla.
- **Dosya İsimleri:** `kebab-case.tsx`
- **Tailwind:** Karmaşık class listeleri için `cn()` utility fonksiyonunu kullan.

## 8. Prisma 7 ve ORM Performansı

- **Edge Compatibility:** Sorguları yazarken Edge Runtime uyumluluğunu gözet (directUrl vs transactionUrl).
- **Migration:** Şema değişikliği sonrası her zaman `npx prisma generate` komutunu çalıştırarak Prisma Client'ı güncelle.
- **Transaction:** Çoklu işlemlerde (Örn: Lead + Activity kaydı) veri bütünlüğü için Prisma `$transaction` yapısını kullan.

## 9. Test Otomasyon Kuralları

- **E2E Test:** Yeni bir kritik özellik (CRM, Auth vb.) eklendiğinde, en az bir "Happy Path" (başarılı senaryo) testi yazılmalıdır.
- **Framework:** Testlerde `@playwright/test` kullanılmalı ve tenant izolasyonu `test.describe` blokları ile ayrılmalıdır.
- **Data:** Mock veri yerine `packages/db` içindeki test veritabanı (seeding) yapılandırması tercih edilmelidir.
