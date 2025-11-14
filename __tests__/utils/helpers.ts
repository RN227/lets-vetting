import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Wait for an element to appear in the DOM
 */
export const waitForElement = async (text: string | RegExp, options?: { timeout?: number }) => {
  return waitFor(
    () => {
      const element = screen.getByText(text);
      expect(element).toBeInTheDocument();
    },
    options
  );
};

/**
 * Fill out a form field
 */
export const fillField = async (label: string | RegExp, value: string) => {
  const field = screen.getByLabelText(label);
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

/**
 * Click a button by text
 */
export const clickButton = async (text: string | RegExp) => {
  const button = screen.getByRole('button', { name: text });
  await userEvent.click(button);
};

/**
 * Select a radio option
 */
export const selectRadio = async (label: string | RegExp) => {
  const radio = screen.getByLabelText(label);
  await userEvent.click(radio);
};

/**
 * Select an option from a dropdown
 */
export const selectOption = async (label: string | RegExp, optionText: string) => {
  const select = screen.getByLabelText(label);
  await userEvent.click(select);
  const option = screen.getByRole('option', { name: optionText });
  await userEvent.click(option);
};

/**
 * Wait for navigation (useful for testing redirects)
 */
export const waitForNavigation = async (timeout = 3000) => {
  await waitFor(
    () => {
      // Check if URL has changed
      expect(window.location.pathname).not.toBe('/');
    },
    { timeout }
  );
};

/**
 * Mock router push/replace
 */
export const createMockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
});

/**
 * Create delay for async operations
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

