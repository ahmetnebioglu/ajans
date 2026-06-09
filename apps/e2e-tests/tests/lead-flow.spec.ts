import { test, expect } from "@playwright/test";

test.describe("CRM Lead Akış Testi", () => {
  test("Yeni bir lead oluşturulmalı ve ERP panelinde görünmeli", async ({
    page,
    browser,
  }) => {
    console.log(">>> [Lead Flow] Website /iletisim sayfasına gidiliyor...");
    await page.goto("http://localhost:3002/iletisim", {
      waitUntil: "networkidle",
    });

    console.log(">>> [Lead Flow] Form dolduruluyor...");
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', "Playwright Test User", {
      timeout: 10000,
    });
    await page.fill('input[name="email"]', testEmail, { timeout: 10000 });
    await page.fill('input[name="subject"]', "E2E Test Mesajı", {
      timeout: 10000,
    });
    await page.fill(
      'textarea[name="message"]',
      "Bu bir Playwright otomasyon testidir.",
      { timeout: 10000 },
    );

    console.log(">>> [Lead Flow] Form gönderiliyor...");
    await page.click('button[type="submit"]');

    console.log(">>> [Lead Flow] Başarı mesajı bekleniyor...");
    await expect(
      page.getByText("BAŞARIYLA ALINDI", { exact: false }),
    ).toBeVisible({ timeout: 15000 });

    // 2. ADIM: ERP'de doğrula
    console.log(
      `>>> [Lead Flow] ERP kontrolü başlıyor... Aranan E-posta: ${testEmail}`,
    );
    const adminContext = await browser.newContext({
      storageState: "storageState/mercan-admin.json",
    });
    const adminPage = await adminContext.newPage();

    // Veritabanı yansıması için kısa bir süre bekle ve gerekirse yenile
    await adminPage.goto("http://localhost:3001/dashboard/crm", {
      waitUntil: "networkidle",
    });

    // 3 kez deneme yap (Eventually consistent veritabanı veya yavaş revalidate durumları için)
    let found = false;
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        console.log(`>>> [Lead Flow] Yeniden deneniyor... (${i + 1}/3)`);
        await adminPage.reload({ waitUntil: "networkidle" });
      }

      try {
        await expect(adminPage.getByText(testEmail).first()).toBeVisible({
          timeout: 5000,
        });
        found = true;
        break;
      } catch (e) {
        await adminPage.waitForTimeout(2000);
      }
    }

    if (!found) {
      console.log(
        `>>> [Lead Flow] HATA: Lead bulunamadı. Mevcut URL: ${adminPage.url()}`,
      );
      const body = await adminPage.textContent("body");
      console.log(
        `>>> [Lead Flow] Sayfa İçeriği (İlk 200 karakter): ${body?.slice(0, 200)}`,
      );
      throw new Error(`Lead bulunamadı: ${testEmail}`);
    }

    // İsmin de orada olduğunu doğrula
    await expect(
      adminPage.getByText("Playwright Test User").first(),
    ).toBeVisible();

    // Statüsünün "Yeni" (NEW) olduğunu doğrula
    await expect(
      adminPage.locator("#NEW").getByText(testEmail).first(),
    ).toBeVisible();

    await adminContext.close();
  });
});
