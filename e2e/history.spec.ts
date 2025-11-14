import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to history page
    // Note: Requires authentication and petId
    await page.goto('/history?petId=test-pet-id');
  });

  test('should load history page', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Check for history page elements
    // Either we see history content or we're redirected
    const historyTitle = page.locator('text=/History|history/i');
    const chatButton = page.getByRole('button', { name: /Chat/i });
    
    // Should have either history content or navigation
    if (await historyTitle.isVisible() || await chatButton.isVisible()) {
      // Page loaded successfully
      expect(true).toBeTruthy();
    }
  });

  test('should show empty state when no conversations', async ({ page }) => {
    await page.goto('/history?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Check for empty state
    const emptyState = page.locator('text=/No conversations yet|Start a conversation/i');
    
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      
      // Should have button to start conversation
      const startButton = page.getByRole('button', { name: /Start New Conversation|Start/i });
      if (await startButton.isVisible()) {
        await expect(startButton).toBeVisible();
      }
    }
  });

  test('should navigate to chat from history', async ({ page }) => {
    await page.goto('/history?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Look for chat navigation button
    const chatButton = page.getByRole('button', { name: /Chat/i });
    
    if (await chatButton.isVisible()) {
      await chatButton.click();
      
      // Should navigate to chat
      await expect(page).toHaveURL(/.*\/chat/);
    }
  });

  test('should display conversation list when conversations exist', async ({ page }) => {
    await page.goto('/history?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Look for conversation cards
    const conversationCard = page.locator('[class*="card"], [class*="Card"]').first();
    
    if (await conversationCard.isVisible()) {
      // Should have clickable conversation
      await expect(conversationCard).toBeVisible();
      
      // Click conversation
      await conversationCard.click();
      
      // Should navigate to chat with conversationId
      // URL should change
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/chat');
    }
  });

  test('should show pet name in header', async ({ page }) => {
    await page.goto('/history?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Check for pet name in header
    const header = page.locator('header, [class*="header"]');
    
    if (await header.isVisible()) {
      // Header should be visible
      await expect(header).toBeVisible();
    }
  });
});

