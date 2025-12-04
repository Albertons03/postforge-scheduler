import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Settings & User Profile Page
 * Tests profile editing, billing section, credit history, and account actions
 */

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you would need to set up authentication
    // For now, we'll test the page structure assuming the user is logged in
    await page.goto('/dashboard/settings');
  });

  test('should display settings page structure', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Settings');

    // Check main sections exist
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Billing & Subscription')).toBeVisible();
    await expect(page.locator('text=Credit History')).toBeVisible();
    await expect(page.locator('text=Account Actions')).toBeVisible();
  });

  test('should display profile section with user data', async ({ page }) => {
    // Check profile avatar and information
    const profileSection = page.locator('text=Profile').locator('..');
    await expect(profileSection).toBeVisible();

    // Profile should show name, email, and member since date
    await expect(profileSection.locator('text=Name')).toBeVisible();
    await expect(profileSection.locator('text=Email')).toBeVisible();
    await expect(profileSection.locator('text=Member since')).toBeVisible();

    // Edit Profile button should be present
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
  });

  test('should open edit profile dialog', async ({ page }) => {
    // Click Edit Profile button
    await page.click('button:has-text("Edit Profile")');

    // Dialog should open
    await expect(page.locator('text=Edit Profile').first()).toBeVisible();

    // Form fields should be present
    await expect(page.locator('label:has-text("First Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Last Name")')).toBeVisible();

    // Action buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('should display billing section', async ({ page }) => {
    const billingSection = page.locator('text=Billing & Subscription').locator('..');
    await expect(billingSection).toBeVisible();

    // Should show current plan
    await expect(billingSection.locator('text=Current Plan')).toBeVisible();

    // Should have upgrade or manage subscription button
    const hasUpgrade = await page.locator('button:has-text("Upgrade Plan")').isVisible();
    const hasManage = await page.locator('button:has-text("Manage Subscription")').isVisible();

    expect(hasUpgrade || hasManage).toBeTruthy();
  });

  test('should display credit summary cards', async ({ page }) => {
    // Check for credit stat cards
    await expect(page.locator('text=Current Balance')).toBeVisible();
    await expect(page.locator('text=Total Purchased')).toBeVisible();
    await expect(page.locator('text=Total Spent')).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
  });

  test('should display credit history table', async ({ page }) => {
    // Check table headers
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('th:has-text("Balance After")')).toBeVisible();

    // Check filter dropdown exists
    await expect(page.locator('text=All Types')).toBeVisible();
  });

  test('should filter credit transactions', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000);

    // Click filter dropdown
    await page.click('text=All Types');

    // Select filter option
    await page.click('text=Purchase');

    // Filter should be applied
    await expect(page.locator('text=Purchase').first()).toBeVisible();
  });

  test('should display account actions', async ({ page }) => {
    const accountSection = page.locator('text=Account Actions').locator('..');
    await expect(accountSection).toBeVisible();

    // Logout button
    await expect(accountSection.locator('button:has-text("Logout")')).toBeVisible();

    // Delete Account button
    await expect(accountSection.locator('button:has-text("Delete Account")')).toBeVisible();
  });

  test('should open delete account confirmation dialog', async ({ page }) => {
    // Click Delete Account button
    const deleteButton = page.locator('button:has-text("Delete Account")').last();
    await deleteButton.click();

    // Dialog should open with warning
    await expect(page.locator('text=This action cannot be undone')).toBeVisible();

    // Confirmation input should be present
    await expect(page.locator('input[placeholder*="DELETE"]')).toBeVisible();

    // Confirm Delete button should be disabled initially
    const confirmButton = page.locator('button:has-text("Confirm Delete")');
    await expect(confirmButton).toBeDisabled();

    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('should validate delete confirmation input', async ({ page }) => {
    // Open delete dialog
    const deleteButton = page.locator('button:has-text("Delete Account")').last();
    await deleteButton.click();

    // Type incorrect confirmation
    await page.fill('input[placeholder*="DELETE"]', 'delete');

    // Confirm button should still be disabled
    const confirmButton = page.locator('button:has-text("Confirm Delete")');
    await expect(confirmButton).toBeDisabled();

    // Type correct confirmation
    await page.fill('input[placeholder*="DELETE"]', 'DELETE');

    // Confirm button should be enabled
    await expect(confirmButton).toBeEnabled();

    // Close dialog without confirming
    await page.click('button:has-text("Cancel")');
  });
});

test.describe('Settings Page - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/settings');

    // Page should still be visible and functional
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Cards should stack vertically
    const creditCards = page.locator('[class*="grid"]').first();
    await expect(creditCards).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard/settings');

    // Page should be visible
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // All sections should be accessible
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Billing & Subscription')).toBeVisible();
  });
});
