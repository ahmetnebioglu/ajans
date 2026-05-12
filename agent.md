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
- **apps/mercan-erp:** Ajans yönetim ve CRM paneli (Premium/Dark UI).
- **apps/okul-erp:** EdTech SaaS çözümü (Pastel/Soft UI).
- **packages/db:** Prisma şeması ve `getSecuredPrisma` (Güvenlik Kapısı).
- **packages/core:** Paylaşılan Server Action'lar ve iş mantığı.
- **packages/ui:** Projeler arası ortak UI kütüphanesi.
- **packages/crm:** Ortak Kanban ve Lead yönetim motoru (Headless).

## 3. Veritabanı ve RLS (Dokunulmazlık Maddeleri)

- **Güvenli Erişim:** Veritabanına ASLA doğrudan `prisma` objesiyle erişme. Daima `getSecuredPrisma()` fonksiyonunu kullan.
- **İzolasyon:** `getSecuredPrisma()`, session üzerinden `tenantId` süzgecini otomatik uygular. Sorgularda manuel `tenantId` filtresine gerek yoktur.
- **Yazma İşlemleri:** Yeni kayıt oluştururken (`create`), `tenantId` alanını session'dan gelen veriyle zorunlu olarak doldur.
- **Soft Delete:** Fiziksel silme (`delete()`) KESİNLİKLE yasaktır. Daima `deletedAt: new Date()` ile güncelleme yap.

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
- **Context Limit:** Sadece ilgili workspace içindeki dosyalara odaklan. `mercan-erp` düzenlerken `okul-erp` dosyalarını bağlam içine alma.
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
