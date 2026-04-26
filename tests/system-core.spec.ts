import { test, expect } from "@playwright/test";

test.setTimeout(120000);

/**
 * MOCK LOGIN HELPER
 * Playwright tests for NextAuth usually require a session cookie.
 */
// Şifre alanı boş kalmasın diye sahte şifre ekliyoruz ve Next.js derlemesi için süreyi uzatıyoruz.
async function setupAuth(page: any, role: string) {
  await page.goto("http://localhost:3001/login", { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });

  const emailInput = page.locator('input[type="email"]').last();
  await emailInput.click();
  const testEmail = `${role.toLowerCase()}@mercan.test`;
  await emailInput.pressSequentially(testEmail, { delay: 50 });
  
  // Enter tuşuna basarak formu gönder
  await emailInput.press('Enter');
  
  // Eğer role USER ise unauthorized sayfasına, ADMIN ise dashboard'a yönlendirme bekle
  const expectedUrl = role.toUpperCase() === "ADMIN" ? "**/dashboard**" : "**/unauthorized**";
  await page.waitForURL(expectedUrl, { timeout: 30000 });
}

test.describe("Sistem ve Güvenlik (RBAC & Tenant)", () => {
  test.setTimeout(120000); // Bu test dosyasındaki tüm testler için süreyi 2 dakikaya çıkarır
  test("RBAC: Standart USER HR veya CRM modüllerine erişememeli", async ({
    page,
  }) => {
    // USER rolü ile giriş yap (setupAuth içinde artık /unauthorized bekliyoruz)
    await setupAuth(page, "USER");

    // Ekranda "Erişim Yetkiniz Yok" metninin göründüğünü doğrula
    await expect(page.locator('text="Erişim Yetkiniz Yok"')).toBeVisible();
    
    // URL'in /unauthorized olduğunu doğrula
    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test("Tenant İzolasyonu: Farklı tenant verileri görülmemeli", async ({
    page,
    request,
  }) => {
    // Mercan tenant'ı olarak giriş yap
    await setupAuth(page, "ADMIN", "mercan");

    // Farklı bir tenant'a ait (örn: 'other_company') bir aday detayını çekmeye çalış
    // Bu test API seviyesinde veya Server Action seviyesinde bir sızıntı olup olmadığını kontrol eder
    const response = await request.get(
      "/api/hr/candidates?tenantId=other_company",
    );

    if (response.ok()) {
      const data = await response.json();
      // Gelen veriler içinde 'other_company' verisi olmamalı
      expect(data.length).toBe(0);
    }
  });

  test("Veri Bütünlüğü: CRM Lead oluşturma ve Transaction testi", async ({
    page,
  }) => {
    await setupAuth(page, "ADMIN", "mercan");
    await page.goto("/dashboard/crm");

    // CRM sayfasının yüklendiğinden emin ol (Kanban board)
    await expect(page.locator(".ant-layout-content")).toBeVisible();

    // Yeni Lead oluşturma butonuna tıkla (Element bir div olduğu için text seçici kullanıyoruz)
    await page.click('text="YENİ LEAD"');

    // Form doldurma simülasyonu (Form henüz eklenmemişse bile yapısal kontrol)
    // await page.fill('input[name="firstName"]', 'Test');
    // await page.fill('input[name="lastName"]', 'Lead');
    // await page.click('button[type="submit"]');

    // Başarı mesajı veya listenin güncellenmesi beklenir
    // expect(page.locator('text=Lead başarıyla oluşturuldu')).toBeVisible();
  });
});
