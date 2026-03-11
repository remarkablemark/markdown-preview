import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Editor } from './Editor';

describe('Editor Component', () => {
  /**
   * Helper component to test controlled Editor with state
   */
  function EditorHarness({
    initialValue = '',
    placeholder,
  }: {
    initialValue?: string;
    placeholder?: string;
  }) {
    const [value, setValue] = useState(initialValue);
    return (
      <Editor value={value} onChange={setValue} placeholder={placeholder} />
    );
  }

  describe('rendering', () => {
    it('renders textarea with provided value', () => {
      const testValue = '# Hello World\n\nThis is **bold** text.';
      render(<EditorHarness initialValue={testValue} />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveValue(testValue);
    });

    it('displays placeholder when value is empty', () => {
      render(
        <EditorHarness
          initialValue=""
          placeholder="Start typing markdown..."
        />,
      );

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Start typing markdown...',
      );
    });
  });

  describe('user interaction', () => {
    it('calls onChange callback when user types', async () => {
      const user = userEvent.setup();
      render(<EditorHarness initialValue="" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      await user.type(textarea, 'Hello');

      // With stateful parent, value should update
      expect(textarea).toHaveValue('Hello');
    });

    it('handles text selection and deletion', async () => {
      const user = userEvent.setup();
      render(<EditorHarness initialValue="Some text to delete" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveValue('Some text to delete');

      // Select all text
      fireEvent.select(textarea, {
        target: { selectionStart: 0, selectionEnd: 19 },
      });

      // Delete selected text
      await user.keyboard('{Backspace}');

      expect(textarea).toHaveValue('');
    });

    it('displays existing content and allows modification', async () => {
      const user = userEvent.setup();
      render(<EditorHarness initialValue="# Existing Content" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveValue('# Existing Content');

      // Append text
      await user.type(textarea, ' with more');

      expect(textarea).toHaveValue('# Existing Content with more');
    });
  });

  describe('accessibility', () => {
    it('has aria-label for screen readers', () => {
      render(<EditorHarness initialValue="" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveAttribute('aria-label', 'Markdown editor');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EditorHarness initialValue="" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });

      // Focus the textarea
      textarea.focus();
      expect(textarea).toHaveFocus();

      // Type using keyboard
      await user.keyboard('Test');
      expect(textarea).toHaveValue('Test');
    });

    it('has visible focus indicator', () => {
      render(<EditorHarness initialValue="" />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      textarea.focus();

      // Check that focus is visible (Tailwind focus classes)
      expect(textarea).toHaveClass('focus:ring-2');
    });
  });

  describe('empty state', () => {
    it('placeholder disappears when user starts typing', async () => {
      const user = userEvent.setup();
      render(<EditorHarness initialValue="" placeholder="Start typing..." />);

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveAttribute('placeholder', 'Start typing...');

      await user.type(textarea, 'H');
      // Placeholder attribute remains but visual placeholder disappears when value exists
      expect(textarea).toHaveValue('H');
    });

    it('placeholder reappears when all content is cleared', async () => {
      const user = userEvent.setup();
      render(
        <EditorHarness
          initialValue="Some content"
          placeholder="Start typing..."
        />,
      );

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveValue('Some content');

      // Clear all content using keyboard
      textarea.focus();
      await user.keyboard('{Control>}a{/Control}{Backspace}');
      expect(textarea).toHaveValue('');
    });
  });
});
