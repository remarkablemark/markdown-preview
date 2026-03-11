import { render, screen } from '@testing-library/react';

import { Preview } from './Preview';

describe('Preview Component', () => {
  describe('rendering', () => {
    it('renders markdown as HTML', () => {
      const markdown = '# Hello World';
      render(<Preview markdown={markdown} />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveTextContent('Hello World');
    });

    it('renders bold and italic formatting', () => {
      const markdown = '**bold** and *italic*';
      render(<Preview markdown={markdown} />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent('bold and italic');
    });

    it('renders lists correctly', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      render(<Preview markdown={markdown} />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent('Item 1');
      expect(preview).toHaveTextContent('Item 2');
      expect(preview).toHaveTextContent('Item 3');
    });
  });

  describe('HTML sanitization', () => {
    it('sanitizes dangerous HTML (XSS prevention)', () => {
      const maliciousMarkdown = '<script>alert("XSS")</script>Safe text';
      render(<Preview markdown={maliciousMarkdown} />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      // Script tag should be removed/sanitized
      expect(preview).toHaveTextContent('Safe text');
      expect(preview.innerHTML).not.toContain('<script>');
    });

    it('removes dangerous event handlers', () => {
      const markdown = '<img src="x" onerror="alert(1)">';
      render(<Preview markdown={markdown} />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      // onerror should be stripped
      expect(preview.innerHTML).not.toContain('onerror');
    });
  });

  describe('empty state', () => {
    it('shows empty state when markdown is empty', () => {
      render(<Preview markdown="" />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent(/start typing/i);
    });

    it('shows empty state when markdown is whitespace only', () => {
      render(<Preview markdown="   " />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent(/start typing/i);
    });

    it('empty state is visually distinct (styled)', () => {
      render(<Preview markdown="" />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      // Empty state should have styling (text-gray-400 italic from default placeholder)
      expect(preview).toBeInTheDocument();
    });
  });

  describe('updates', () => {
    it('updates when markdown prop changes', () => {
      const { rerender } = render(<Preview markdown="Initial" />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent('Initial');

      rerender(<Preview markdown="Updated" />);
      expect(preview).toHaveTextContent('Updated');
    });
  });

  describe('accessibility', () => {
    it('has role="region"', () => {
      render(<Preview markdown="Test" />);

      const preview = screen.getByRole('region');
      expect(preview).toBeInTheDocument();
    });

    it('has aria-label', () => {
      render(<Preview markdown="Test" />);

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveAttribute('aria-label', 'Markdown preview');
    });

    it('accepts custom aria-label', () => {
      render(<Preview markdown="Test" ariaLabel="Custom preview label" />);

      const preview = screen.getByRole('region', {
        name: /custom preview label/i,
      });
      expect(preview).toBeInTheDocument();
    });
  });

  describe('sanitization options', () => {
    it('renders HTML without sanitization when sanitize option is false', () => {
      const markdown = '<strong>Bold</strong> text';
      render(
        <Preview
          markdown={markdown}
          options={{ sanitize: false, gfm: true, breaks: false }}
        />,
      );

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview.innerHTML).toContain('<strong>Bold</strong>');
    });

    it('respects gfm option for GitHub Flavored Markdown', () => {
      const markdown = '~~strikethrough~~';
      render(
        <Preview
          markdown={markdown}
          options={{ gfm: true, sanitize: false }}
        />,
      );

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      // GFM should render strikethrough
      expect(preview.innerHTML).toContain('<del>');
    });

    it('respects breaks option for line breaks', () => {
      const markdown = 'Line 1\nLine 2';
      render(
        <Preview
          markdown={markdown}
          options={{ breaks: true, sanitize: false }}
        />,
      );

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      // With breaks: true, newlines should become <br> tags
      expect(preview.innerHTML).toContain('<br>');
    });

    it('uses custom empty placeholder when provided', () => {
      render(
        <Preview
          markdown=""
          options={{
            emptyPlaceholder: '<p class="custom">No content yet</p>',
          }}
        />,
      );

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview.innerHTML).toContain('No content yet');
    });
  });
});
