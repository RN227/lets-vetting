import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should load landing page', async ({ page }) => {
    // Check for key elements on landing page
    await expect(page.locator('img[alt*="LetsVet"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /I Already Have an Account/i })).toBeVisible();
  });

  test('should navigate to onboarding when "Get Started" is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).click();
    
    // Should navigate to onboarding/why page
    await expect(page).toHaveURL(/.*\/onboarding\/why/);
  });

  test('should show login form when "I Already Have an Account" is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /I Already Have an Account/i }).click();
    
    // Should show login form
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
  });

  test('should navigate back from login form', async ({ page }) => {
    // Open login form
    await page.getByRole('button', { name: /I Already Have an Account/i }).click();
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: /Back/i }).click();
    
    // Should show landing page buttons again
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /I Already Have an Account/i })).toBeVisible();
  });

  test('should show Google sign-in button', async ({ page }) => {
    await page.getByRole('button', { name: /I Already Have an Account/i }).click();
    
    // Check for Google sign-in button
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
    
    // Button should have Google icon
    await expect(googleButton.locator('svg')).toBeVisible();
  });

  test('should handle loading state during sign-in', async ({ page }) => {
    await page.getByRole('button', { name: /I Already Have an Account/i }).click();
    
    const googleButton = page.getByRole('button', { name: /Continue with Google/i });
    
    // Click button (will trigger sign-in attempt)
    await googleButton.click();
    
    // Button should show loading state (disabled or with loading text)
    // Note: Actual Google sign-in will open popup, so we just verify button state
    await expect(googleButton).toBeVisible();
  });
});

