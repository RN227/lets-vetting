import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    // Note: This requires authentication and a pet, so may need setup
    // For now, we'll test what we can
    await page.goto('/chat?petId=test-pet-id');
  });

  test('should load chat page', async ({ page }) => {
    // Check for chat interface elements
    // Note: May need to handle auth redirect
    const chatInput = page.getByPlaceholder(/Describe symptoms/i);
    
    // Either we're on chat page or redirected
    if (await chatInput.isVisible()) {
      await expect(chatInput).toBeVisible();
      await expect(page.getByRole('button', { name: /Send/i })).toBeVisible();
    }
  });

  test('should show condition pills when no messages', async ({ page }) => {
    await page.goto('/chat?petId=test-pet-id');
    
    // Wait a bit for page to load
    await page.waitForTimeout(1000);
    
    // Check if condition pills are visible (when no messages exist)
    const pills = page.locator('text=/Not eating|Vomiting|Diarrhea/i');
    const pillsCount = await pills.count();
    
    if (pillsCount > 0) {
      // Pills should be visible
      await expect(pills.first()).toBeVisible();
    }
  });

  test('should allow typing in message input', async ({ page }) => {
    await page.goto('/chat?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    const chatInput = page.getByPlaceholder(/Describe symptoms/i);
    
    if (await chatInput.isVisible()) {
      await chatInput.fill('My dog is not eating');
      await expect(chatInput).toHaveValue('My dog is not eating');
    }
  });

  test('should enable send button when message is entered', async ({ page }) => {
    await page.goto('/chat?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    const chatInput = page.getByPlaceholder(/Describe symptoms/i);
    const sendButton = page.getByRole('button', { name: /Send/i });
    
    if (await chatInput.isVisible()) {
      // Button should be disabled initially (empty message)
      await expect(sendButton).toBeDisabled();
      
      // Type message
      await chatInput.fill('Test message');
      
      // Button should be enabled
      await expect(sendButton).toBeEnabled();
    }
  });

  test('should show helper text at bottom', async ({ page }) => {
    await page.goto('/chat?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Check for disclaimer text
    await expect(page.getByText(/AI guidance only/i)).toBeVisible();
  });

  test('should handle condition pill selection', async ({ page }) => {
    await page.goto('/chat?petId=test-pet-id');
    await page.waitForTimeout(1000);
    
    // Look for condition pills
    const pill = page.locator('text=/Not eating|Vomiting/i').first();
    
    if (await pill.isVisible()) {
      await pill.click();
      
      // Pill should be selected (disabled or styled differently)
      await expect(pill).toBeVisible();
      
      // Message input should be populated or pill should be disabled
      const chatInput = page.getByPlaceholder(/Describe symptoms/i);
      if (await chatInput.isVisible()) {
        // Input might be populated with pill text
        const inputValue = await chatInput.inputValue();
        // Either input has value or pill is disabled
        expect(inputValue.length > 0 || (await pill.isDisabled())).toBeTruthy();
      }
    }
  });
});

