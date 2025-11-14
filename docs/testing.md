# Testing Guide

This document provides a comprehensive guide for testing the LetsVet application.

## Overview

The LetsVet application uses a dual testing approach:

1. **Unit/Integration Tests** - Jest + React Testing Library for fast, isolated component and service tests
2. **End-to-End Tests** - Playwright for full browser testing of user flows

## Running Tests

### Unit/Integration Tests (Jest)

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Structure

```
lets-vetting/
├── __tests__/              # Unit/Integration tests
│   ├── app/                # Page component tests
│   ├── components/          # Component tests
│   ├── lib/                # Service/utility tests
│   └── utils/              # Test utilities
│       ├── test-utils.tsx  # Custom render with providers
│       ├── mocks.ts        # Mock implementations
│       └── helpers.ts      # Helper functions
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts
│   ├── onboarding.spec.ts
│   ├── chat.spec.ts
│   └── history.spec.ts
└── jest.config.js          # Jest configuration
```

## Writing Unit Tests

### Basic Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/lib/auth-context';
import MyComponent from '@/app/my-component';

// Mock dependencies
jest.mock('@/lib/auth-context');

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Using Test Utilities

The `__tests__/utils/test-utils.tsx` provides a custom render function that includes all providers (Theme, Auth):

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import MyComponent from '@/app/my-component';

// Automatically wrapped with providers
render(<MyComponent />);
```

### Mocking Firebase

Firebase services are mocked in `__tests__/utils/mocks.ts`. Use these mocks in your tests:

```typescript
import { mockFirebaseAuth, mockPet } from '@/__tests__/utils/mocks';

// Use mocks in your tests
jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  // ... other mocks
}));
```

### Testing User Interactions

Use `@testing-library/user-event` for simulating user interactions:

```typescript
import userEvent from '@testing-library/user-event';

test('should handle button click', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  await user.click(screen.getByRole('button', { name: /Submit/i }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Writing E2E Tests

### Basic E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

### Best Practices for E2E Tests

1. **Use descriptive test names** - Clearly describe what the test verifies
2. **Wait for elements** - Use `waitFor` or `expect().toBeVisible()` instead of fixed timeouts
3. **Test user flows** - Focus on complete user journeys, not implementation details
4. **Keep tests independent** - Each test should be able to run in isolation
5. **Use data-testid sparingly** - Prefer accessible selectors (role, text, label)

### Example E2E Test

```typescript
test('should complete onboarding flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Get Started/i }).click();
  await expect(page).toHaveURL(/.*\/onboarding\/why/);
  
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page).toHaveURL(/.*\/onboarding\/how/);
  
  // ... continue flow
});
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

✅ Good:
```typescript
expect(screen.getByText('Welcome')).toBeInTheDocument();
```

❌ Bad:
```typescript
expect(component.state.isWelcomeShown).toBe(true);
```

### 2. Use Accessible Selectors

✅ Good:
```typescript
screen.getByRole('button', { name: /Submit/i });
screen.getByLabelText(/Email/i);
```

❌ Bad:
```typescript
screen.getByTestId('submit-button');
screen.getByClassName('btn-primary');
```

### 3. Test User Flows

Focus on testing what users can see and do, not internal state:

```typescript
// Test the complete flow
test('should sign in and navigate to chat', async () => {
  // ... test complete user journey
});
```

### 4. Mock External Dependencies

Always mock Firebase, API calls, and other external services:

```typescript
jest.mock('@/lib/services/pets');
jest.mock('firebase/auth');
```

### 5. Keep Tests Fast

- Use unit tests for fast feedback
- Use E2E tests for critical user flows
- Mock expensive operations

## Mocking Strategies

### Mocking Firebase Auth

```typescript
jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(() => Promise.resolve({
    user: { uid: 'test-user', isAnonymous: true },
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));
```

### Mocking Next.js Router

The router is automatically mocked in `jest.setup.js`. If you need custom behavior:

```typescript
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
```

### Mocking Service Functions

```typescript
import { createPet } from '@/lib/services/pets';

jest.mock('@/lib/services/pets');

const mockCreatePet = createPet as jest.MockedFunction<typeof createPet>;
mockCreatePet.mockResolvedValue({
  id: 'pet-123',
  // ... pet data
});
```

## Coverage Goals

- **Target Coverage**: > 70% for critical paths
- **Focus Areas**:
  - Authentication flows
  - Form validation
  - Service functions
  - Critical user journeys

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test -- __tests__/app/page.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Debug mode (Node.js debugger)
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

```bash
# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with headed browser
npx playwright test --headed

# Debug specific test
npx playwright test --debug e2e/auth.spec.ts
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests failing due to Firebase initialization**
   - Ensure Firebase is properly mocked
   - Check `jest.setup.js` for required mocks

2. **E2E tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check if dev server is running
   - Verify base URL is correct

3. **Module not found errors**
   - Check `jest.config.js` module name mapping
   - Verify TypeScript paths in `tsconfig.json`

4. **Material UI theme errors**
   - Ensure `ThemeProvider` is included in test render
   - Use custom render from `test-utils.tsx`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

