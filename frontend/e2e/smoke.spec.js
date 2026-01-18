import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

test("landing page renders", async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  await expect(page).toHaveTitle(/Data Structures Studio/i);
});

test("playground basic render and insert", async ({ page }) => {
  await page.goto(`${BASE_URL}/views/playground.html`);
  const input = page.locator("#dataInput");
  const insertBtn = page.locator("#insertBtn");
  const svg = page.locator("svg#vis");

  await expect(input).toBeVisible();
  await expect(svg).toBeVisible();

  await input.fill("5");
  await insertBtn.click();

  // Expect at least one rect node added after insert (stack/queue render as rects)
  await expect(svg.locator("rect")).toHaveCount(1, { timeout: 3000 });
});
