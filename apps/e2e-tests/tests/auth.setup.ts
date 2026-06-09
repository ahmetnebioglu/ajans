import { test as setup, expect } from "@playwright/test";

const MERCAN_ADMIN_STORAGE = "storageState/mercan-admin.json";
const OKUL_ADMIN_STORAGE = "storageState/okul-admin.json";

setup.beforeEach(({ page }) => {
  page.on("console", (msg) => console.log(`>>> [Browser] ${msg.text()}`));
});

setup("authenticate as mercan admin", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("http://localhost:3001/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[placeholder*="mercan.com"]', "admin@mercan.com");
  const loginBtn = page.getByRole("button", { name: "HIZLI GİRİŞ YAP" });
  await loginBtn.click();

  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

  // Verify cookie is set
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(
    (c) => c.name === "erp.session-token",
  );
  if (!sessionCookie) throw new Error("ERP session cookie not found!");

  await page.context().storageState({ path: MERCAN_ADMIN_STORAGE });
});
