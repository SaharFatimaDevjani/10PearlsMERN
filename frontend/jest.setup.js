// frontend/jest.setup.js
import '@testing-library/jest-dom';

// --- Polyfills needed by react-router / jsdom on Node ---
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// Some libs may expect Web Crypto in test env
try {
  // Node 18+ has webcrypto here
  global.crypto = global.crypto || require('crypto').webcrypto;
} catch { /* ignore */ }

// Safe stubs for URL APIs used by export code
global.URL.createObjectURL = global.URL.createObjectURL || (() => 'blob:mock');
global.URL.revokeObjectURL = global.URL.revokeObjectURL || (() => {});

// --- Mocks to keep tests quiet and deterministic ---
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
}));

// Auto-confirm SweetAlert dialogs in tests
jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
  },
}));

// Replace WYSIWYG with a simple <textarea> that uses the same onChange signature
jest.mock('react-simple-wysiwyg', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
    />
  ),
}));
