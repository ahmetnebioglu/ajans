import { defineConfig, devices } from "@playwright/test";

/**
 * Ajans Monorepo Playwright Yapılandırması.
 * Mercan ERP, Okul ERP ve Mercan Website testlerini kapsar.
 */
export default defineConfig({
  timeout: 120 * 1000,

  expect: {
    timeout: 10000, // Bekleme (expect) sürelerini de biraz esnetebilirsin
  },
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: "http://localhost:3001", // Varsayılan Mercan ERP
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "mercan-erp",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
        storageState: "storageState/mercan-admin.json",
      },
    },
    {
      name: "okul-erp",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3006",
        storageState: "storageState/okul-admin.json",
      },
    },
    {
      name: "mercan-website",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3005",
      },
    },
    /* Auth Setup Project */
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
  ],
});
