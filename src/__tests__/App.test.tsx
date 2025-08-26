import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component – Polish UI', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', {
      name: /Przeglądarka dokumentów medycznych/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<App />);

    // Sidebar heading for categories
    const sidebarHeading = screen.getByRole('heading', { name: /Kategorie/i });
    expect(sidebarHeading).toBeInTheDocument();

    // Year select
    const yearLabel = screen.getByLabelText(/Rok:/i);
    expect(yearLabel).toBeInTheDocument();

    // Search input (using placeholder)
    const searchInput = screen.getByPlaceholderText(
      /Nazwa pliku lub treść PDF…/i,
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('shows empty state when no documents returned', async () => {
    render(<App />);

    // Wait for the empty-state text after loading finishes
    const emptyState = await screen.findByText(/Brak wyników\./i);
    expect(emptyState).toBeInTheDocument();
  });
});
