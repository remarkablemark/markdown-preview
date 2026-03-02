import { render, screen } from '@testing-library/react';

import { DarkModeToggle } from './DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  it('renders dark mode toggle button', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('displays sun icon in light mode', () => {
    document.documentElement.classList.remove('dark');
    render(<DarkModeToggle />);

    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('displays moon icon in dark mode', () => {
    document.documentElement.classList.add('dark');
    render(<DarkModeToggle />);

    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('has correct aria-pressed attribute', () => {
    document.documentElement.classList.remove('dark');
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
