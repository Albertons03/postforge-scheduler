import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PostForge/);
});

test('displays welcome message', async ({ page }) => {
  await page.goto('/');

  // Expects page to have a heading with the name of Welcome to PostForge.
  await expect(page.locator('h1')).toContainText('Welcome to PostForge');
});
