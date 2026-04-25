
import { test as setup, expect } from '@playwright/test';

const MERCAN_ADMIN_STORAGE = 'storageState/mercan-admin.json';
const OKUL_ADMIN_STORAGE = 'storageState/okul-admin.json';

setup.beforeEach(({ page }) => {
  page.on('console', msg => console.log(`>>> [Browser] ${msg.text()}`));
});

setup('authenticate as mercan admin', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('http://localhost:3001/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[placeholder*="mercan.com"]', 'admin@mercan.com');
  const loginBtn = page.getByRole('button', { name: 'HIZLI GİRİŞ YAP' });
  await loginBtn.click();
  
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  
  // Verify cookie is set
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'mercan-erp.session-token');
  if (!sessionCookie) throw new Error("Mercan ERP session cookie not found!");

  await page.context().storageState({ path: MERCAN_ADMIN_STORAGE });
});

setup('authenticate as okul admin', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('http://127.0.0.1:3006/login');
  await page.waitForLoadState('networkidle');
  
  await page.click('button:has-text("İdareci")');
  await page.fill('input[type="email"]', 'admin@okul.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Devam Edelim")');

  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  
  // Verify cookie is set
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'okul-erp.session-token');
  if (!sessionCookie) throw new Error("Okul ERP session cookie not found!");

  await page.context().storageState({ path: OKUL_ADMIN_STORAGE });
});
