# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lead-flow.spec.ts >> CRM Lead Akış Testi >> Yeni bir lead oluşturulmalı ve ERP panelinde görünmeli
- Location: tests\lead-flow.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3005/iletisim
Call log:
  - navigating to "http://localhost:3005/iletisim", waiting until "networkidle"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('CRM Lead Akış Testi', () => {
  4  |   test('Yeni bir lead oluşturulmalı ve ERP panelinde görünmeli', async ({ page, browser }) => {
  5  |     console.log('>>> [Lead Flow] Website /iletisim sayfasına gidiliyor...');
> 6  |     await page.goto('http://localhost:3005/iletisim', { waitUntil: 'networkidle' });
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3005/iletisim
  7  |     
  8  |     console.log('>>> [Lead Flow] Form dolduruluyor...');
  9  |     const testEmail = `test-${Date.now()}@example.com`;
  10 |     await page.fill('input[name="name"]', 'Playwright Test User', { timeout: 10000 });
  11 |     await page.fill('input[name="email"]', testEmail, { timeout: 10000 });
  12 |     await page.fill('input[name="subject"]', 'E2E Test Mesajı', { timeout: 10000 });
  13 |     await page.fill('textarea[name="message"]', 'Bu bir Playwright otomasyon testidir.', { timeout: 10000 });
  14 |     
  15 |     console.log('>>> [Lead Flow] Form gönderiliyor...');
  16 |     await page.click('button[type="submit"]');
  17 |     
  18 |     console.log('>>> [Lead Flow] Başarı mesajı bekleniyor...');
  19 |     await expect(page.getByText('BAŞARIYLA ALINDI', { exact: false })).toBeVisible({ timeout: 15000 });
  20 | 
  21 |     // 2. ADIM: Mercan ERP'de doğrula
  22 |     console.log(`>>> [Lead Flow] Mercan ERP kontrolü başlıyor... Aranan E-posta: ${testEmail}`);
  23 |     const adminContext = await browser.newContext({ storageState: 'storageState/mercan-admin.json' });
  24 |     const adminPage = await adminContext.newPage();
  25 |     
  26 |     // Veritabanı yansıması için kısa bir süre bekle ve gerekirse yenile
  27 |     await adminPage.goto('http://localhost:3001/dashboard/crm', { waitUntil: 'networkidle' });
  28 |     
  29 |     // 3 kez deneme yap (Eventually consistent veritabanı veya yavaş revalidate durumları için)
  30 |     let found = false;
  31 |     for (let i = 0; i < 3; i++) {
  32 |       if (i > 0) {
  33 |         console.log(`>>> [Lead Flow] Yeniden deneniyor... (${i+1}/3)`);
  34 |         await adminPage.reload({ waitUntil: 'networkidle' });
  35 |       }
  36 |       
  37 |       try {
  38 |         await expect(adminPage.getByText(testEmail).first()).toBeVisible({ timeout: 5000 });
  39 |         found = true;
  40 |         break;
  41 |       } catch (e) {
  42 |         await adminPage.waitForTimeout(2000);
  43 |       }
  44 |     }
  45 | 
  46 |     if (!found) {
  47 |       console.log(`>>> [Lead Flow] HATA: Lead bulunamadı. Mevcut URL: ${adminPage.url()}`);
  48 |       const body = await adminPage.textContent('body');
  49 |       console.log(`>>> [Lead Flow] Sayfa İçeriği (İlk 200 karakter): ${body?.slice(0, 200)}`);
  50 |       throw new Error(`Lead bulunamadı: ${testEmail}`);
  51 |     }
  52 |     
  53 |     // İsmin de orada olduğunu doğrula
  54 |     await expect(adminPage.getByText('Playwright Test User').first()).toBeVisible();
  55 |     
  56 |     // Statüsünün "Yeni" (NEW) olduğunu doğrula
  57 |     await expect(adminPage.locator('#NEW').getByText(testEmail).first()).toBeVisible();
  58 | 
  59 |     await adminContext.close();
  60 |   });
  61 | });
  62 | 
```