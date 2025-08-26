/**
 * Global test setup for Vitest.
 *
 * The goal is to keep this file **minimal** so tests start fast.
 * We only install helpful matchers, register a cleanup hook, and
 * provide the single mock our components rely on (`window.factory`).
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add jest-dom matchers (e.g. toBeInTheDocument)
expect.extend(matchers);

// Ensure DOM is cleaned between tests
afterEach(() => cleanup());

// Minimal mock of the Electron preload API used in SystemInfo
Object.defineProperty(window, 'factory', {
  value: {
    systemInfo: vi.fn().mockReturnValue('mock-platform • mock-arch'),
  },
  writable: true,
  configurable: true,
});

/**
 * Mock of the `window.docs` API exposed by the new preload script.
 * Provides basic async stubs so components relying on the API
 * can run in the test environment without Electron.
 */
Object.defineProperty(window, 'docs', {
  value: {
    meta: vi.fn().mockResolvedValue({ categories: [], years: [] }),
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
    open: vi.fn().mockResolvedValue(true),
  },
  writable: true,
  configurable: true,
});
