import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding flow', async ({ page }) => {
    // Start at landing page
    await page.goto('/');
    
    // Click Get Started
    await page.getByRole('button', { name: /Get Started/i }).click();
    
    // Should be on "Why Us" page
    await expect(page).toHaveURL(/.*\/onboarding\/why/);
    await expect(page.getByText(/Why us\?/i)).toBeVisible();
    await expect(page.getByText(/Know what to do, fast/i)).toBeVisible();
    
    // Click Continue
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Should be on "How It Works" page
    await expect(page).toHaveURL(/.*\/onboarding\/how/);
    await expect(page.getByText(/How It Works/i)).toBeVisible();
    await expect(page.getByText(/Share your pet's symptoms/i)).toBeVisible();
    
    // Should see disclaimer
    await expect(page.getByText(/LetsVet provides educational information/i)).toBeVisible();
    
    // Click Add pet
    await page.getByRole('button', { name: /Add pet/i }).click();
    
    // Should be on pet form page
    await expect(page).toHaveURL(/.*\/onboarding\/pet/);
    await expect(page.getByText(/Tell us about your pet/i)).toBeVisible();
  });

  test('should fill out and submit pet form', async ({ page }) => {
    // Navigate directly to pet form (requires auth, but test will handle)
    await page.goto('/onboarding/pet');
    
    // Wait for form to load
    await expect(page.getByLabelText(/Name/i)).toBeVisible();
    
    // Fill out form
    await page.getByLabelText(/Name/i).fill('Max');
    await page.getByLabelText(/Dog/i).click();
    await page.getByLabelText(/Age \(years\)/i).fill('3');
    await page.getByLabelText(/Weight \(kg\)/i).fill('25');
    await page.getByLabelText(/Male/i).click();
    
    // Fill breed with autocomplete
    const breedInput = page.getByLabelText(/Breed/i);
    await breedInput.fill('Gold');
    
    // Wait for suggestions and select
    await expect(page.getByText(/Golden Retriever/i)).toBeVisible();
    await page.getByText(/Golden Retriever/i).click();
    
    // Submit form
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Should show success message
    await expect(page.getByText(/Pet saved successfully/i)).toBeVisible();
    
    // Should redirect to chat (after delay)
    // Note: This may require actual Firebase setup or mocking
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/onboarding/pet');
    
    await expect(page.getByLabelText(/Name/i)).toBeVisible();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/Please enter your pet's name/i)).toBeVisible();
  });

  test('should show breed autocomplete suggestions', async ({ page }) => {
    await page.goto('/onboarding/pet');
    
    // Select species first
    await page.getByLabelText(/Dog/i).click();
    
    // Type in breed field
    const breedInput = page.getByLabelText(/Breed/i);
    await breedInput.fill('Lab');
    
    // Should show suggestions
    await expect(page.getByText(/Labrador Retriever/i)).toBeVisible();
    
    // Click suggestion
    await page.getByText(/Labrador Retriever/i).click();
    
    // Breed should be filled
    await expect(breedInput).toHaveValue(/Labrador Retriever/i);
  });

  test('should filter breeds by species', async ({ page }) => {
    await page.goto('/onboarding/pet');
    
    // Select dog
    await page.getByLabelText(/Dog/i).click();
    const breedInput = page.getByLabelText(/Breed/i);
    await breedInput.fill('Pers');
    
    // Should not show cat breeds
    await expect(page.getByText(/Persian/i)).not.toBeVisible();
    
    // Change to cat
    await page.getByLabelText(/Cat/i).click();
    await breedInput.fill('Pers');
    
    // Should show cat breeds
    await expect(page.getByText(/Persian/i)).toBeVisible();
  });
});

