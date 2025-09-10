import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock для useAppStore
jest.mock('../store/useAppStore', () => ({
  useAppStore: () => ({
    files: [],
    selectedGasolineMap: null,
    selectedGasMap: null,
    isLoading: false,
    error: null,
    addFiles: jest.fn(),
    removeFile: jest.fn(),
    toggleFileVisibility: jest.fn(),
    toggleMapVisibility: jest.fn(),
    selectGasolineMap: jest.fn(),
    selectGasMap: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Zenit Map Editor')).toBeInTheDocument();
  });

  it('displays the application title', () => {
    render(<App />);
    expect(screen.getByText('Zenit Map Editor')).toBeInTheDocument();
    expect(screen.getByText(/Редактор топливных карт/)).toBeInTheDocument();
  });
});
