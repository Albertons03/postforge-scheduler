import { test, expect } from '@playwright/test';

test.describe('Dashboard Page E2E Tests - Unauthenticated', () => {
  test('should redirect to sign-in when accessing dashboard without authentication', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });

  test('should redirect to sign-in when accessing dashboard/generate without authentication', async ({ page }) => {
    // Try to access protected generate page
    await page.goto('/dashboard/generate');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });

  test('should redirect to sign-in when accessing dashboard/history without authentication', async ({ page }) => {
    // Try to access protected history page
    await page.goto('/dashboard/history');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });

  test('should redirect to sign-in when accessing dashboard/analytics without authentication', async ({ page }) => {
    // Try to access protected analytics page
    await page.goto('/dashboard/analytics');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });

  test('should redirect to sign-in when accessing dashboard/settings without authentication', async ({ page }) => {
    // Try to access protected settings page
    await page.goto('/dashboard/settings');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });
});

test.describe('Dashboard Page E2E Tests - UI Elements (requires auth bypass for testing)', () => {
  // Note: These tests would normally require authentication
  // They test the UI structure assuming the user could access the page

  test.skip('should display "Welcome back!" heading when authenticated', async ({ page }) => {
    // This test requires authentication setup
    // Skipping for now - would need Clerk test tokens or mock auth

    await page.goto('/dashboard');

    const heading = page.locator('h1:has-text("Welcome back!")');
    await expect(heading).toBeVisible();
  });

  test.skip('should display quick stats grid with 4 cards', async ({ page }) => {
    // This test requires authentication
    await page.goto('/dashboard');

    // Check for stats cards
    const statsGrid = page.locator('div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();

    // Should have 4 stat cards
    const statCards = page.locator('div[class*="bg-gradient-to-br"]').filter({
      has: page.locator('p.text-5xl')
    });
    await expect(statCards).toHaveCount(4);
  });

  test.skip('should display "Credits" stat card', async ({ page }) => {
    await page.goto('/dashboard');

    const creditsCard = page.locator('p:has-text("Credits")');
    await expect(creditsCard).toBeVisible();
  });

  test.skip('should display "Posts Created" stat card', async ({ page }) => {
    await page.goto('/dashboard');

    const postsCard = page.locator('p:has-text("Posts Created")');
    await expect(postsCard).toBeVisible();
  });

  test.skip('should display "This Month" stat card', async ({ page }) => {
    await page.goto('/dashboard');

    const monthCard = page.locator('p:has-text("This Month")');
    await expect(monthCard).toBeVisible();
  });

  test.skip('should display "Achievements" stat card', async ({ page }) => {
    await page.goto('/dashboard');

    const achievementsCard = page.locator('p:has-text("Achievements")');
    await expect(achievementsCard).toBeVisible();
  });

  test.skip('should have "Generate Content" CTA card', async ({ page }) => {
    await page.goto('/dashboard');

    const generateCard = page.locator('h3:has-text("Generate Content")');
    await expect(generateCard).toBeVisible();

    // Check for the link
    const generateLink = page.locator('a[href="/dashboard/generate"]');
    await expect(generateLink).toBeVisible();
  });

  test.skip('should have "View History" CTA card', async ({ page }) => {
    await page.goto('/dashboard');

    const historyCard = page.locator('h3:has-text("View History")');
    await expect(historyCard).toBeVisible();

    // Check for the link
    const historyLink = page.locator('a[href="/dashboard/history"]');
    await expect(historyLink).toBeVisible();
  });

  test.skip('should have "Analytics" CTA card', async ({ page }) => {
    await page.goto('/dashboard');

    const analyticsCard = page.locator('h3:has-text("Analytics")');
    await expect(analyticsCard).toBeVisible();

    // Check for the link
    const analyticsLink = page.locator('a[href="/dashboard/analytics"]');
    await expect(analyticsLink).toBeVisible();
  });

  test.skip('should display "Getting Started" section', async ({ page }) => {
    await page.goto('/dashboard');

    const gettingStarted = page.locator('h2:has-text("Getting Started")');
    await expect(gettingStarted).toBeVisible();

    // Should have 4 steps
    const steps = page.locator('div.flex.items-start.space-x-4');
    await expect(steps).toHaveCount(4);
  });

  test.skip('should have step 1: "Choose Your Topic"', async ({ page }) => {
    await page.goto('/dashboard');

    const step1 = page.locator('h3:has-text("Choose Your Topic")');
    await expect(step1).toBeVisible();
  });

  test.skip('should have step 2: "Select Your Settings"', async ({ page }) => {
    await page.goto('/dashboard');

    const step2 = page.locator('h3:has-text("Select Your Settings")');
    await expect(step2).toBeVisible();
  });

  test.skip('should have step 3: "Generate Content"', async ({ page }) => {
    await page.goto('/dashboard');

    const step3 = page.locator('h3:has-text("Generate Content")');
    await expect(step3).toBeVisible();
  });

  test.skip('should have step 4: "Edit & Share"', async ({ page }) => {
    await page.goto('/dashboard');

    const step4 = page.locator('h3:has-text("Edit & Share")');
    await expect(step4).toBeVisible();
  });

  test.skip('should navigate to generate page when clicking "Start Creating"', async ({ page }) => {
    await page.goto('/dashboard');

    const generateButton = page.locator('a[href="/dashboard/generate"]').first();
    await generateButton.click();

    await page.waitForLoadState('networkidle');

    // Should navigate to generate page
    await expect(page).toHaveURL(/.*\/dashboard\/generate/);
  });

  test.skip('should navigate to history page when clicking "View Posts"', async ({ page }) => {
    await page.goto('/dashboard');

    const historyButton = page.locator('a[href="/dashboard/history"]').first();
    await historyButton.click();

    await page.waitForLoadState('networkidle');

    // Should navigate to history page
    await expect(page).toHaveURL(/.*\/dashboard\/history/);
  });

  test.skip('should navigate to analytics page when clicking "View Analytics"', async ({ page }) => {
    await page.goto('/dashboard');

    const analyticsButton = page.locator('a[href="/dashboard/analytics"]').first();
    await analyticsButton.click();

    await page.waitForLoadState('networkidle');

    // Should navigate to analytics page
    await expect(page).toHaveURL(/.*\/dashboard\/analytics/);
  });

  test.skip('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Main elements should still be visible
    await expect(page.locator('h1:has-text("Welcome back!")')).toBeVisible();

    // Stats grid should stack on mobile
    const statsGrid = page.locator('div.grid.grid-cols-1');
    await expect(statsGrid).toBeVisible();
  });
});

test.describe('Dashboard - Sidebar Navigation Tests', () => {
  test.skip('should have sidebar with navigation links', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for sidebar (this depends on your layout component)
    // Typically would check for navigation menu items
    const dashboardLink = page.locator('a[href="/dashboard"]');
    const generateLink = page.locator('a[href="/dashboard/generate"]');
    const historyLink = page.locator('a[href="/dashboard/history"]');

    // At least one should be visible (depending on your layout)
    const linkCount = await dashboardLink.count() + await generateLink.count() + await historyLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
