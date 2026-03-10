import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Layout } from './Layout';

describe('Layout Component', () => {
  function TestChildren() {
    return (
      <>
        <div data-testid="editor-pane">Editor</div>
        <div data-testid="preview-pane">Preview</div>
      </>
    );
  }

  describe('split view mode', () => {
    it('displays split view (50/50) on desktop viewport', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const layout = screen.getByTestId('layout-container');
      expect(layout).toBeInTheDocument();

      const editorPane = screen.getByTestId('editor-pane');
      const previewPane = screen.getByTestId('preview-pane');

      expect(editorPane).toBeInTheDocument();
      expect(previewPane).toBeInTheDocument();
    });

    it('each pane scrolls independently', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const editorPane = screen.getByTestId('editor-pane');
      const previewPane = screen.getByTestId('preview-pane');

      // Both panes should have overflow-auto class for independent scrolling
      expect(editorPane.parentElement).toHaveClass('overflow-auto');
      expect(previewPane.parentElement).toHaveClass('overflow-auto');
    });
  });

  describe('mobile toggle', () => {
    it('toggle button switches editor/preview on mobile', async () => {
      const user = userEvent.setup();
      const onToggleView = vi.fn();

      render(
        <Layout mode="editor-only" onToggleView={onToggleView}>
          <TestChildren />
        </Layout>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /preview/i,
      });
      expect(toggleButton).toBeInTheDocument();

      await user.click(toggleButton);
      expect(onToggleView).toHaveBeenCalledTimes(1);
    });

    it('toggle button has correct aria-pressed state', () => {
      render(
        <Layout mode="editor-only" onToggleView={vi.fn()}>
          <TestChildren />
        </Layout>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /preview/i,
      });
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggle shows correct label based on mode', () => {
      const { rerender } = render(
        <Layout mode="editor-only" onToggleView={vi.fn()}>
          <TestChildren />
        </Layout>,
      );

      let toggleButton = screen.getByRole('button', { name: /preview/i });
      expect(toggleButton).toBeInTheDocument();

      rerender(
        <Layout mode="preview-only" onToggleView={vi.fn()}>
          <TestChildren />
        </Layout>,
      );

      toggleButton = screen.getByRole('button', { name: /editor/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('editor-only mode', () => {
    it('shows only editor pane', () => {
      render(
        <Layout mode="editor-only">
          <TestChildren />
        </Layout>,
      );

      const editorPane = screen.getByTestId('editor-pane');
      expect(editorPane).toBeInTheDocument();
    });
  });

  describe('preview-only mode', () => {
    it('shows only preview pane', () => {
      render(
        <Layout mode="preview-only">
          <TestChildren />
        </Layout>,
      );

      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('toggle button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onToggleView = vi.fn();

      render(
        <Layout mode="editor-only" onToggleView={onToggleView}>
          <TestChildren />
        </Layout>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /preview/i,
      });

      // Focus and activate with keyboard
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onToggleView).toHaveBeenCalledTimes(1);
    });
  });

  describe('layout structure', () => {
    it('has full viewport height', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const layout = screen.getByTestId('layout-container');
      expect(layout).toHaveClass('h-screen');
    });

    it('uses flexbox for layout', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const layout = screen.getByTestId('layout-container');
      expect(layout).toHaveClass('flex');
    });
  });

  describe('dark mode toggle', () => {
    beforeEach(() => {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    });

    it('displays dark mode toggle button', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button', {
        name: /switch to dark mode/i,
      });
      expect(darkModeButton).toBeInTheDocument();
    });

    it('toggles from light to dark mode when clicked', async () => {
      const user = userEvent.setup();

      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button', {
        name: /switch to dark mode/i,
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.theme).toBeUndefined();

      await user.click(darkModeButton);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.theme).toBe('dark');
    });

    it('toggles from dark to system mode when clicked again', async () => {
      const user = userEvent.setup();

      // Start with dark mode enabled
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';

      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button', {
        name: /switch to system mode/i,
      });

      await user.click(darkModeButton);

      // System mode uses matchMedia which is mocked to return false (light)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.theme).toBe('system');
    });

    it('shows correct icon based on current mode', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button', {
        name: /switch to dark mode/i,
      });
      expect(darkModeButton).toHaveTextContent('☀️');
    });

    it('shows moon icon in dark mode', () => {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';

      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button');
      expect(darkModeButton).toHaveTextContent('🌙');
    });

    it('shows computer icon in system mode', () => {
      localStorage.theme = 'system';

      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button');
      expect(darkModeButton).toHaveTextContent('💻');
    });

    it('has correct aria-pressed state', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button', {
        name: /switch to dark mode/i,
      });
      expect(darkModeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows current theme in title attribute', () => {
      render(
        <Layout mode="split">
          <TestChildren />
        </Layout>,
      );

      const darkModeButton = screen.getByRole('button');
      expect(darkModeButton).toHaveAttribute('title', 'Current: Light mode');
    });
  });
});
