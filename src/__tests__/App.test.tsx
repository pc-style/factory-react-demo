import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the SystemInfo and GraduateButton components to simplify testing
vi.mock('../components/SystemInfo', () => ({
  // The real component now displays “Hello World”
  default: () => <div data-testid="system-info">Hello World</div>
}));

describe('App Component', () => {
  it('renders headline', () => {
    render(<App />);
    const headlineElement = screen.getByText('Factory – Software at Light-Speed');
    expect(headlineElement).toBeInTheDocument();
  });

  it('renders SystemInfo component', () => {
    render(<App />);
    const systemInfoElement = screen.getByTestId('system-info');
    expect(systemInfoElement).toBeInTheDocument();
  });

  it('renders Factory logo', () => {
    render(<App />);
    const logoElement = screen.getByAltText('Factory logo');
    expect(logoElement).toBeInTheDocument();
    // Expect the authentic Factory logo SVG
    expect(logoElement.getAttribute('src')).toBe('/assets/logo.svg');
  });
});
