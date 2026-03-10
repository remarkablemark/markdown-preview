import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('shows "Preview" when in editor-only mode', () => {
    render(<ViewToggle mode="editor-only" onToggle={vi.fn()} />);

    const button = screen.getByRole('button', { name: /preview/i });
    expect(button).toBeInTheDocument();
  });

  it('shows "Editor" when in preview-only mode', () => {
    render(<ViewToggle mode="preview-only" onToggle={vi.fn()} />);

    const button = screen.getByRole('button', { name: /editor/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ViewToggle mode="editor-only" onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /preview/i });
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-pressed attribute based on mode', () => {
    const { rerender } = render(
      <ViewToggle mode="editor-only" onToggle={vi.fn()} />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<ViewToggle mode="preview-only" onToggle={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
