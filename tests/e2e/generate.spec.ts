import { test, expect } from '@playwright/test';

test.describe('Generate Page E2E Tests - Unauthenticated', () => {
  test('should redirect to sign-in when accessing generate page without authentication', async ({ page }) => {
    // Try to access generate page without authentication
    await page.goto('/dashboard/generate');

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be redirected to sign-in page
    const url = page.url();
    expect(url).toContain('sign-in');
  });
});

test.describe('Generate Page E2E Tests - UI Elements (requires auth bypass)', () => {
  // Note: These tests require authentication to access the page
  // They test the UI structure assuming the user is authenticated

  test.skip('should load generate page successfully when authenticated', async ({ page }) => {
    await page.goto('/dashboard/generate');

    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    await expect(page).toHaveURL(/.*\/dashboard\/generate/);
  });

  test.skip('should display "Generate Content" heading', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const heading = page.locator('h1:has-text("Generate Content")');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Generate Content');
  });

  test.skip('should display page description', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const description = page.locator('p:has-text("Create AI-powered social media posts")');
    await expect(description).toBeVisible();
  });

  test.skip('should display PostGenerator form', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for the form container
    const form = page.locator('div.bg-gray-800.rounded-lg.border.border-gray-700').first();
    await expect(form).toBeVisible();
  });

  test.skip('should have "Topic / Idea" input field', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for topic label
    const topicLabel = page.locator('label:has-text("Topic / Idea")');
    await expect(topicLabel).toBeVisible();

    // Check for topic input
    const topicInput = page.locator('input[name="topic"]');
    await expect(topicInput).toBeVisible();
    await expect(topicInput).toHaveAttribute('placeholder', /AI in healthcare|Remote work tips/i);
  });

  test.skip('should have "Platform" select dropdown', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for platform label
    const platformLabel = page.locator('label:has-text("Platform")');
    await expect(platformLabel).toBeVisible();

    // Check for platform select
    const platformSelect = page.locator('select[name="platform"]');
    await expect(platformSelect).toBeVisible();

    // Check options
    const linkedinOption = page.locator('option[value="linkedin"]');
    await expect(linkedinOption).toBeVisible();

    const twitterOption = page.locator('option[value="twitter"]');
    await expect(twitterOption).toBeVisible();

    const instagramOption = page.locator('option[value="instagram"]');
    await expect(instagramOption).toBeVisible();

    const facebookOption = page.locator('option[value="facebook"]');
    await expect(facebookOption).toBeVisible();

    const tiktokOption = page.locator('option[value="tiktok"]');
    await expect(tiktokOption).toBeVisible();
  });

  test.skip('should have "Tone" select dropdown', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for tone label
    const toneLabel = page.locator('label:has-text("Tone")');
    await expect(toneLabel).toBeVisible();

    // Check for tone select
    const toneSelect = page.locator('select[name="tone"]');
    await expect(toneSelect).toBeVisible();

    // Check options
    const professionalOption = page.locator('option[value="Professional"]');
    await expect(professionalOption).toBeVisible();

    const casualOption = page.locator('option[value="Casual"]');
    await expect(casualOption).toBeVisible();

    const inspirationalOption = page.locator('option[value="Inspirational"]');
    await expect(inspirationalOption).toBeVisible();
  });

  test.skip('should have "Length" select dropdown', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for length label
    const lengthLabel = page.locator('label:has-text("Length")');
    await expect(lengthLabel).toBeVisible();

    // Check for length select
    const lengthSelect = page.locator('select[name="length"]');
    await expect(lengthSelect).toBeVisible();

    // Check options
    const shortOption = page.locator('option[value="Short"]');
    await expect(shortOption).toBeVisible();

    const mediumOption = page.locator('option[value="Medium"]');
    await expect(mediumOption).toBeVisible();

    const longOption = page.locator('option[value="Long"]');
    await expect(longOption).toBeVisible();
  });

  test.skip('should have "Generate Post" button', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for generate button
    const generateButton = page.locator('button:has-text("Generate Post")');
    await expect(generateButton).toBeVisible();

    // Button should be disabled when topic is empty
    await expect(generateButton).toBeDisabled();
  });

  test.skip('should enable "Generate Post" button when topic is filled', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Fill in topic
    const topicInput = page.locator('input[name="topic"]');
    await topicInput.fill('AI in healthcare');

    // Button should now be enabled
    const generateButton = page.locator('button:has-text("Generate Post")');
    await expect(generateButton).toBeEnabled();
  });

  test.skip('should display helpful tips section', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Check for tips cards
    const tipCards = page.locator('div.bg-gray-800.rounded-lg.border.border-gray-700.p-6');
    await expect(tipCards.first()).toBeVisible();

    // Check for specific tips
    const beSpecificTip = page.locator('h3:has-text("Be Specific")');
    await expect(beSpecificTip).toBeVisible();

    const chooseToneTip = page.locator('h3:has-text("Choose Your Tone")');
    await expect(chooseToneTip).toBeVisible();

    const editTip = page.locator('h3:has-text("Edit & Customize")');
    await expect(editTip).toBeVisible();
  });

  test.skip('should allow selecting different platforms', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const platformSelect = page.locator('select[name="platform"]');

    // Select Twitter
    await platformSelect.selectOption('twitter');
    await expect(platformSelect).toHaveValue('twitter');

    // Select Instagram
    await platformSelect.selectOption('instagram');
    await expect(platformSelect).toHaveValue('instagram');

    // Select LinkedIn
    await platformSelect.selectOption('linkedin');
    await expect(platformSelect).toHaveValue('linkedin');
  });

  test.skip('should allow selecting different tones', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const toneSelect = page.locator('select[name="tone"]');

    // Select Casual
    await toneSelect.selectOption('Casual');
    await expect(toneSelect).toHaveValue('Casual');

    // Select Inspirational
    await toneSelect.selectOption('Inspirational');
    await expect(toneSelect).toHaveValue('Inspirational');

    // Select Professional
    await toneSelect.selectOption('Professional');
    await expect(toneSelect).toHaveValue('Professional');
  });

  test.skip('should allow selecting different lengths', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const lengthSelect = page.locator('select[name="length"]');

    // Select Short
    await lengthSelect.selectOption('Short');
    await expect(lengthSelect).toHaveValue('Short');

    // Select Long
    await lengthSelect.selectOption('Long');
    await expect(lengthSelect).toHaveValue('Long');

    // Select Medium
    await lengthSelect.selectOption('Medium');
    await expect(lengthSelect).toHaveValue('Medium');
  });

  test.skip('should show loading state when generating post', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Fill in the form
    await page.locator('input[name="topic"]').fill('AI in healthcare');

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate Post")');
    await generateButton.click();

    // Should show loading state
    const loadingButton = page.locator('button:has-text("Generating...")');
    await expect(loadingButton).toBeVisible({ timeout: 5000 });

    // Button should have loading icon
    const loadingIcon = page.locator('button svg.animate-spin');
    await expect(loadingIcon).toBeVisible();
  });

  test.skip('should display generated post section after generation', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Fill in the form
    await page.locator('input[name="topic"]').fill('AI in healthcare');

    // Click generate button
    const generateButton = page.locator('button:has-text("Generate Post")');
    await generateButton.click();

    // Wait for generation to complete (this could take a while)
    await page.waitForTimeout(10000);

    // Check for generated post section
    const generatedSection = page.locator('h2:has-text("Generated Post")');
    await expect(generatedSection).toBeVisible({ timeout: 30000 });

    // Should have textarea with content
    const textarea = page.locator('textarea[placeholder="Your generated post..."]');
    await expect(textarea).toBeVisible();
  });

  test.skip('should have action buttons for generated post', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Generate a post first
    await page.locator('input[name="topic"]').fill('AI in healthcare');
    await page.locator('button:has-text("Generate Post")').click();

    // Wait for generation
    await page.waitForTimeout(10000);
    await page.waitForSelector('h2:has-text("Generated Post")', { timeout: 30000 });

    // Check for action buttons
    const copyButton = page.locator('button:has-text("Copy")');
    await expect(copyButton).toBeVisible();

    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();

    const clearButton = page.locator('button:has-text("Clear")');
    await expect(clearButton).toBeVisible();
  });

  test.skip('should allow editing generated post', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Generate a post
    await page.locator('input[name="topic"]').fill('AI in healthcare');
    await page.locator('button:has-text("Generate Post")').click();

    // Wait for generation
    await page.waitForTimeout(10000);
    await page.waitForSelector('h2:has-text("Generated Post")', { timeout: 30000 });

    // Get textarea
    const textarea = page.locator('textarea[placeholder="Your generated post..."]');

    // Should be editable
    await textarea.fill('This is my edited post content');
    await expect(textarea).toHaveValue('This is my edited post content');
  });

  test.skip('should copy post to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/dashboard/generate');

    // Generate a post
    await page.locator('input[name="topic"]').fill('AI in healthcare');
    await page.locator('button:has-text("Generate Post")').click();

    // Wait for generation
    await page.waitForTimeout(10000);
    await page.waitForSelector('h2:has-text("Generated Post")', { timeout: 30000 });

    // Click copy button
    const copyButton = page.locator('button:has-text("Copy")');
    await copyButton.click();

    // Should show success toast
    const successToast = page.locator('text=Copied to clipboard');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test.skip('should clear form and generated post', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Fill in form
    await page.locator('input[name="topic"]').fill('AI in healthcare');

    // Generate post
    await page.locator('button:has-text("Generate Post")').click();
    await page.waitForTimeout(10000);
    await page.waitForSelector('h2:has-text("Generated Post")', { timeout: 30000 });

    // Click clear button
    const clearButton = page.locator('button:has-text("Clear")');
    await clearButton.click();

    // Generated post section should be hidden
    const generatedSection = page.locator('h2:has-text("Generated Post")');
    await expect(generatedSection).not.toBeVisible();

    // Form should be cleared
    const topicInput = page.locator('input[name="topic"]');
    await expect(topicInput).toHaveValue('');
  });

  test.skip('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/generate');

    // Main elements should still be visible
    await expect(page.locator('h1:has-text("Generate Content")')).toBeVisible();
    await expect(page.locator('input[name="topic"]')).toBeVisible();
    await expect(page.locator('select[name="platform"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Post")')).toBeVisible();
  });
});

test.describe('Generate Page - Form Validation', () => {
  test.skip('should show error toast when trying to generate without topic', async ({ page }) => {
    await page.goto('/dashboard/generate');

    // Leave topic empty and try to click generate
    const generateButton = page.locator('button:has-text("Generate Post")');

    // Button should be disabled
    await expect(generateButton).toBeDisabled();
  });

  test.skip('should accept topic input and enable button', async ({ page }) => {
    await page.goto('/dashboard/generate');

    const topicInput = page.locator('input[name="topic"]');
    const generateButton = page.locator('button:has-text("Generate Post")');

    // Initially disabled
    await expect(generateButton).toBeDisabled();

    // Type something
    await topicInput.fill('Test topic');

    // Should be enabled
    await expect(generateButton).toBeEnabled();

    // Clear input
    await topicInput.fill('');

    // Should be disabled again
    await expect(generateButton).toBeDisabled();
  });
});
