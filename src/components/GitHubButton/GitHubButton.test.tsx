import { render, screen } from '@testing-library/react';

import { GitHubButton } from './GitHubButton';

describe('GitHubButton', () => {
  it('renders GitHub button with correct link', () => {
    render(<GitHubButton />);

    const link = screen.getByRole('link', {
      name: /view repository on github/i,
    });

    expect(link).toHaveAttribute(
      'href',
      'https://github.com/remarkablemark/markdown-preview',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders GitHub icon svg', () => {
    render(<GitHubButton />);

    const svg = screen.getByTestId('github-icon');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });
});
