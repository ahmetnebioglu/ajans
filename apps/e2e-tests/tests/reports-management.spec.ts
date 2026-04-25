import { test, expect } from '@playwright/test';

test.describe('Rapor Yönetimi ve Taşıma Testi', () => {
  const STORAGE_STATE = 'storageState/mercan-admin.json';

  test.use({ storageState: STORAGE_STATE });

  test('Bir raporu yeni oluşturulan bir klasöre taşıyabilmeli ve audit log doğrulanmalı', async ({ page }) => {
    // Dialogları (alert, confirm) otomatik kabul et
    page.on('dialog', async dialog => {
      console.log(`>>> [Browser:Dialog] ${dialog.message()}`);
      await dialog.accept();
    });

    // 1. Şirketler Sayfasına Git ve İlk Firmayı Seç
    console.log('>>> [Report Management] Şirketler listesine gidiliyor...');
    await page.goto('http://localhost:3001/dashboard/companies', { waitUntil: 'networkidle' });
    
    const firstCompanyLink = page.locator('table tbody tr td').first();
    await firstCompanyLink.click();
    await page.waitForLoadState('networkidle');

    // 2. Yeni Klasör Oluştur
    const TEST_FOLDER_NAME = `E2E_Test_Folder_${Date.now()}`;
    console.log(`>>> [Report Management] Yeni klasör oluşturuluyor: ${TEST_FOLDER_NAME}`);
    await page.getByRole('button', { name: /Yeni Klasör/i }).click();
    
    const folderInput = page.getByPlaceholder('KLASÖR ADI...');
    await folderInput.fill(TEST_FOLDER_NAME);
    
    console.log('>>> [Report Management] Klasör oluşturma formu gönderiliyor...');
    await page.getByRole('button', { name: 'KLASÖRÜ OLUŞTUR', exact: true }).click({ force: true });
    
    await page.waitForTimeout(2000);
    await expect(page.getByText(new RegExp(TEST_FOLDER_NAME, 'i'))).toBeVisible({ timeout: 15000 });

    // 3. Gerçek Bir Rapor Yükle (Garanti olması için)
    const UNIQUE_FILE_NAME = `test-report-${Date.now()}.txt`;
    console.log(`>>> [Report Management] Test raporu hazırlanıyor: ${UNIQUE_FILE_NAME}`);
    
    const fs = require('fs');
    const path = require('path');
    const sourcePath = path.join(__dirname, '..', 'test-report.txt');
    const destPath = path.join(__dirname, '..', UNIQUE_FILE_NAME);
    fs.copyFileSync(sourcePath, destPath);

    console.log(`>>> [Report Management] Rapor yükleniyor: ${UNIQUE_FILE_NAME}`);
    await page.getByRole('button', { name: /Rapor Yükle/i }).click();
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(destPath);

    await page.getByRole('button', { name: 'ARŞİVE GÖNDER', exact: true }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // 4. Raporu Taşı
    console.log(`>>> [Report Management] Rapor taşınmaya başlanıyor: ${UNIQUE_FILE_NAME}`);
    
    const reportRow = page.locator('tr').filter({ hasText: UNIQUE_FILE_NAME }).first();
    await reportRow.getByTitle('Taşı').click();

    // Taşıma modalı
    await expect(page.getByText('TAŞIMA SİHİRBAZI')).toBeVisible();
    
    // Klasör ismine tıkla - Modal sonradan açıldığı için 'last' olan modal içindekidir
    const targetFolderBtn = page.locator('button').filter({ hasText: TEST_FOLDER_NAME }).last();
    await targetFolderBtn.click({ force: true });
    
    await expect(page.getByText('TAŞIMA SİHİRBAZI')).toBeHidden({ timeout: 10000 });

    // 5. Klasörün İçine Gir ve Raporu Orada Gör
    console.log('>>> [Report Management] Klasör içine giriliyor...');
    await page.getByText(TEST_FOLDER_NAME).first().click();
    await expect(page.locator('tr').filter({ hasText: UNIQUE_FILE_NAME })).toBeVisible({ timeout: 10000 });

    // 6. Sistem Günlüğünü Kontrol Et
    console.log('>>> [Report Management] Sistem günlüğü kontrol ediliyor...');
    await page.goto('http://localhost:3001/dashboard/logs', { waitUntil: 'networkidle' });

    const firstLog = page.locator('tr').filter({ hasText: 'MOVED' }).first();
    await expect(firstLog).toBeVisible({ timeout: 10000 });
    
    console.log('>>> [Report Management] Test başarıyla tamamlandı!');
    fs.unlinkSync(destPath);
  });
});
