import { test, expect } from '@playwright/test';

test.describe('Post Management', () => {
  // This assumes you have authentication set up
  test.beforeEach(async ({ page }) => {
    // Navigate to the posts page
    await page.goto('http://localhost:3003/dashboard/posts');
  });

  test('should display posts table after page load', async ({ page }) => {
    // Wait for either the posts table or empty state to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]', { timeout: 10000 });

    // Check if we have the page header
    await expect(page.getByText('Post Management')).toBeVisible();

    // Check if view switcher is present
    await expect(page.getByTestId('table-tab')).toBeVisible();
    await expect(page.getByTestId('calendar-tab')).toBeVisible();
  });

  test('should switch between table and calendar views', async ({ page }) => {
    // Start on table view
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Click calendar tab
    await page.getByTestId('calendar-tab').click();

    // Verify calendar is visible (check for react-big-calendar class)
    await expect(page.locator('.rbc-calendar')).toBeVisible({ timeout: 5000 });

    // Switch back to table
    await page.getByTestId('table-tab').click();

    // Verify we're back on table view
    await expect(page.locator('[data-testid="posts-table"], [data-testid="empty-state"]')).toBeVisible();
  });

  test('should show empty state when no posts exist', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // If empty state is visible
    const emptyState = page.getByTestId('empty-state');
    if (await emptyState.isVisible()) {
      await expect(page.getByText('No posts yet')).toBeVisible();
      await expect(page.getByRole('button', { name: /Create Your First Post/i })).toBeVisible();
    }
  });

  test('should open edit modal when clicking edit button', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Check if we have any posts
    const editButton = page.getByTestId('edit-button').first();
    const isVisible = await editButton.isVisible().catch(() => false);

    if (isVisible) {
      // Click the first edit button
      await editButton.click();

      // Wait for modal to appear
      await expect(page.getByText('Edit Post')).toBeVisible({ timeout: 3000 });

      // Check for content textarea
      await expect(page.locator('textarea')).toBeVisible();

      // Check for character counter
      await expect(page.getByText(/\/500 characters/)).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /Cancel/i }).click();

      // Verify modal is closed
      await expect(page.getByText('Edit Post')).not.toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should save edited post content', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Check if we have any posts
    const editButton = page.getByTestId('edit-button').first();
    const isVisible = await editButton.isVisible().catch(() => false);

    if (isVisible) {
      // Click edit
      await editButton.click();

      // Wait for modal
      await expect(page.getByText('Edit Post')).toBeVisible();

      // Edit the content
      const textarea = page.locator('textarea');
      await textarea.clear();
      await textarea.fill('Updated test content for E2E testing');

      // Save
      await page.getByTestId('save-button').click();

      // Wait for modal to close and success toast
      await expect(page.getByText('Edit Post')).not.toBeVisible({ timeout: 5000 });

      // Verify success toast (sonner)
      await expect(page.getByText(/Post updated successfully/i)).toBeVisible({ timeout: 3000 });
    } else {
      test.skip();
    }
  });

  test('should delete post with confirmation', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Check if we have any posts
    const deleteButton = page.getByTestId('delete-button').first();
    const isVisible = await deleteButton.isVisible().catch(() => false);

    if (isVisible) {
      // Get initial row count
      const initialRows = await page.getByTestId('post-row').count();

      // Set up dialog handler for browser confirm()
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Are you sure');
        await dialog.accept();
      });

      // Click delete
      await deleteButton.click();

      // Wait for success toast
      await expect(page.getByText(/Post deleted/i)).toBeVisible({ timeout: 3000 });

      // Verify row count decreased or empty state appeared
      await page.waitForTimeout(1000); // Brief wait for UI update
      const newRows = await page.getByTestId('post-row').count();

      if (newRows === 0) {
        await expect(page.getByTestId('empty-state')).toBeVisible();
      } else {
        expect(newRows).toBe(initialRows - 1);
      }
    } else {
      test.skip();
    }
  });

  test('should display posts in calendar view', async ({ page }) => {
    // Wait for page load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Switch to calendar view
    await page.getByTestId('calendar-tab').click();

    // Wait for calendar to render
    await expect(page.locator('.rbc-calendar')).toBeVisible({ timeout: 5000 });

    // Check for calendar month view
    await expect(page.locator('.rbc-month-view')).toBeVisible();

    // Check if toolbar exists (navigation buttons)
    await expect(page.locator('.rbc-toolbar')).toBeVisible();
  });

  test('should display correct post status badges', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Check if we have posts with status badges
    const postRows = await page.getByTestId('post-row').count();

    if (postRows > 0) {
      // Look for badge elements (they should have specific status classes/text)
      const badges = page.locator('td').filter({ hasText: /Draft|Scheduled|Published|Failed/i });
      const badgeCount = await badges.count();

      // We should have at least one badge
      expect(badgeCount).toBeGreaterThanOrEqual(1);
    } else {
      test.skip();
    }
  });

  test('should navigate to generate page when clicking Create New Post', async ({ page }) => {
    // Wait for page load
    await page.waitForSelector('[data-testid="posts-table"], [data-testid="empty-state"]');

    // Click the "Create New Post" button in header
    await page.getByRole('button', { name: /Create New Post/i }).click();

    // Verify navigation to generate page
    await expect(page).toHaveURL(/\/dashboard\/generate/);
  });
});
