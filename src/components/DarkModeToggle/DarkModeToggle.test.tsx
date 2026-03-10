import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DarkModeToggle } from './DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  it('renders dark mode toggle button', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');

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

  it('shows current theme in title attribute', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('title', 'Current: Light mode');
  });

  it('cycles from light to dark mode when clicked', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    await user.click(button);

    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(localStorage.theme).toBe('dark');
  });

  it('cycles from dark to system mode when clicked', async () => {
    const user = userEvent.setup();
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
    render(<DarkModeToggle />);

    const button = screen.getByRole('button', {
      name: /switch to system mode/i,
    });

    await user.click(button);

    expect(screen.getByText('💻')).toBeInTheDocument();
    expect(localStorage.theme).toBe('system');
  });

  it('cycles from system to light mode when clicked', async () => {
    const user = userEvent.setup();
    localStorage.theme = 'system';
    render(<DarkModeToggle />);

    const button = screen.getByRole('button', {
      name: /switch to light mode/i,
    });

    await user.click(button);

    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(localStorage.theme).toBe('light');
  });

  it('applies dark class when switching to system mode and system prefers dark', async () => {
    const user = userEvent.setup();
    localStorage.theme = 'dark';
    document.documentElement.classList.add('dark');

    // Mock matchMedia to return dark preference
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        ({
          matches: true,
        }) as MediaQueryList,
    );

    render(<DarkModeToggle />);

    const button = screen.getByRole('button', {
      name: /switch to system mode/i,
    });

    await user.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.theme).toBe('system');
  });

  it('removes dark class when switching to system mode and system prefers light', async () => {
    const user = userEvent.setup();
    localStorage.theme = 'dark';
    document.documentElement.classList.add('dark');

    // Mock matchMedia to return light preference
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        ({
          matches: false,
        }) as MediaQueryList,
    );

    render(<DarkModeToggle />);

    const button = screen.getByRole('button', {
      name: /switch to system mode/i,
    });

    await user.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.theme).toBe('system');
  });

  it('initializes with system mode from localStorage', () => {
    localStorage.theme = 'system';
    render(<DarkModeToggle />);

    expect(screen.getByText('💻')).toBeInTheDocument();
  });

  it('initializes with light mode from localStorage', () => {
    localStorage.theme = 'light';
    render(<DarkModeToggle />);

    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('initializes with dark mode from localStorage', () => {
    localStorage.theme = 'dark';
    render(<DarkModeToggle />);

    expect(screen.getByText('🌙')).toBeInTheDocument();
  });
});
