import '@testing-library/jest-dom';

// Mock для Electron API
Object.defineProperty(window, 'electronAPI', {
  value: {
    selectFiles: jest.fn(),
    saveFile: jest.fn(),
  },
  writable: true,
});
