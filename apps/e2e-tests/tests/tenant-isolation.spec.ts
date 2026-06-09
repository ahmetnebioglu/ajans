import { test, expect } from '@playwright/test';

test.describe('Tenant İzolasyon Testi', () => {

  test('Mercan Admin, Okul ERP rotalarına erişememeli veya veri görmemeli', async ({ browser }) => {
    // Mercan Admin oturumu ile bir context oluştur
    const mercanContext = await browser.newContext({ storageState: 'storageState/mercan-admin.json' });
    const page = await mercanContext.newPage();

    // Okul ERP URL'sine gitmeye çalış
    await page.goto('http://localhost:3006/dashboard');

    // Beklenti: Ya login sayfasına atılmalı, ya da "Yetkisiz Erişim" mesajı almalı
    // NextAuth middleware genellikle /login'e yönlendirir
    await expect(page).toHaveURL(/.*login/);
    
    // CRM verisi sızmadığını kontrol et (Okul ERP portunda Mercan verisi arıyoruz)
    await page.goto('http://localhost:3006/dashboard/crm');
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Gelen Talepler'); // Mercan başlığı görünmemeli
    
    await mercanContext.close();
  });

  test('Okul Admin, ERP verilerini görememeli', async ({ browser }) => {
    const okulContext = await browser.newContext({ storageState: 'storageState/okul-admin.json' });
    const page = await okulContext.newPage();

    await page.goto('http://localhost:3001/dashboard/crm');
    
    // Login'e yönlendirme beklenir
    await expect(page).toHaveURL(/.*login/);
    
    await okulContext.close();
  });
});
