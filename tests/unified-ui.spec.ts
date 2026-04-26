import { test, expect } from "@playwright/test";

test.setTimeout(120000);

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
  
  // Dashboard yönlendirmesini bekle
  await page.waitForURL("**/dashboard**", { timeout: 60000 });
}

test.describe("Unified OS: Arayüz ve Navigasyon", () => {
  test.setTimeout(120000); // Bu test dosyasındaki tüm testler için süreyi 2 dakikaya çıkarır
  test.beforeEach(async ({ page }) => {
    // Admin olarak giriş yap (VIP Pass)
    await setupAuth(page, "ADMIN");
  });

  test("Modül Switcher: Profil kartı üzerinden CRM modülüne geçiş", async ({
    page,
  }) => {
    // Profil kartının (Dropdown tetikleyici) görünür olduğunu kontrol et
    const profileCard = page.locator(".ant-dropdown-trigger").first();
    await expect(profileCard).toBeVisible();

    // Profil kartına tıkla
    await profileCard.click();

    // Dropdown menüde modüllerin listelendiğini doğrula
    const switcher = page.locator(".ant-dropdown-menu");
    await expect(switcher).toBeVisible();
    await expect(switcher).toContainText("MERCAN ERP");
    await expect(switcher).toContainText("MERCAN CMS");
    await expect(switcher).toContainText("MERCAN HR");
    await expect(switcher).toContainText("MERCAN CRM");

    // CRM butonunu bul ve görünür olmasını bekle
    const crmButton = page.locator(
      '.ant-dropdown-menu-item:has-text("MERCAN CRM")',
    );
    await expect(crmButton).toBeVisible();

    // CRM butonuna tıkla
    await crmButton.click();

    // CRM rotasına geçildiğini doğrula (Timeout'u artırarak)
    await expect(page).toHaveURL(/\/dashboard\/crm/, { timeout: 15000 });
  });

  test("Ant Design UI: HR modülünde karanlık tema ve tablo kontrolü", async ({
    page,
  }) => {
    // HR modülüne git
    await page.goto("/dashboard/hr");

    // Sider'ın (Yan Menü) varlığını kontrol et
    const sider = page.locator(".ant-layout-sider");
    await expect(sider).toBeVisible();

    // UnifiedSidebar'da background: transparent vermiştik
    const siderStyle = await sider.getAttribute("style");
    expect(siderStyle).toContain("background: transparent");

    // Sayfa içinde bir Ant Design tablosu olduğunu doğrula
    // HR Özet sayfasında veya alt sayfalarda tablo olması bekleniyor
    await page.goto("/dashboard/hr/leaves");
    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });

  test("CRM Görsel Kimlik: Kırmızı vurgu rengi kontrolü", async ({ page }) => {
    await page.goto("/dashboard/crm");

    // Aktif menü öğesinin kırmızı (#dc2626) olduğunu doğrula
    const activeMenuItem = page.locator(".ant-menu-item-selected");
    await expect(activeMenuItem).toBeVisible();

    const computedStyle = await activeMenuItem.evaluate((el) => {
      // Aktif öğenin solundaki vurgu çizgisi ::after pseudo-elementi ile yapılıyor
      const afterStyle = window.getComputedStyle(el, "::after");
      return afterStyle.backgroundColor;
    });

    // #dc2626 => rgb(220, 38, 38)
    expect(computedStyle).toBe("rgb(220, 38, 38)");
  });
});
