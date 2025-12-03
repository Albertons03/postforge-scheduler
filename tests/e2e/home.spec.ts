import { test, expect } from '@playwright/test';

test.describe('Home Page E2E Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    await expect(page).toHaveURL('/');
  });

  test('should display PostForge title', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading
    const heading = page.locator('h1:has-text("Welcome to PostForge")');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome to PostForge');
  });

  test('should display subtitle/description', async ({ page }) => {
    await page.goto('/');

    // Check for the subtitle
    const subtitle = page.locator('p:has-text("AI-powered social media content generation")');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('AI-powered social media content generation and scheduling');
  });

  test('should display "Get Started" button', async ({ page }) => {
    await page.goto('/');

    // Check for Get Started button (Sign Up)
    const getStartedButton = page.locator('a:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
    await expect(getStartedButton).toHaveAttribute('href', '/sign-up');
  });

  test('should display "Sign In" button', async ({ page }) => {
    await page.goto('/');

    // Check for Sign In button
    const signInButton = page.locator('a:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute('href', '/sign-in');
  });

  test('should navigate to sign-up page when clicking "Get Started"', async ({ page }) => {
    await page.goto('/');

    // Click Get Started button
    const getStartedButton = page.locator('a:has-text("Get Started")');
    await getStartedButton.click();

    // Verify navigation
    await expect(page).toHaveURL(/.*sign-up.*/);
  });

  test('should navigate to sign-in page when clicking "Sign In"', async ({ page }) => {
    await page.goto('/');

    // Click Sign In button
    const signInButton = page.locator('a:has-text("Sign In")');
    await signInButton.click();

    // Verify navigation
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    // Check page title (this depends on your Next.js metadata configuration)
    await expect(page).toHaveTitle(/PostForge/);
  });

  test('should display gradient background', async ({ page }) => {
    await page.goto('/');

    // Check if main element has gradient classes
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for gradient classes
    const mainClass = await main.getAttribute('class');
    expect(mainClass).toContain('bg-gradient-to-br');
  });

  test('should be responsive - check layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify elements are still visible
    await expect(page.locator('h1:has-text("Welcome to PostForge")')).toBeVisible();
    await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
  });
});
