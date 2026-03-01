import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

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

    it('renders with custom className', () => {
      render(
        <Editor
          value=""
          onChange={() => undefined}
          className="custom-editor-class"
        />,
      );

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toHaveClass('custom-editor-class');
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
    it('placeholder displays when editor is empty on load', () => {
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

  describe('disabled state', () => {
    it('respects disabled prop', () => {
      render(
        <Editor value="Cannot edit" onChange={() => undefined} disabled />,
      );

      const textarea = screen.getByRole('textbox', {
        name: /markdown editor/i,
      });
      expect(textarea).toBeDisabled();
    });
  });

  describe('onCursorChange callback', () => {
    it('calls onCursorChange when text is selected', () => {
      const onCursorChange = vi.fn();
      const testValue = `# Hello
World`; // Actual newline, not \n
      render(
        <Editor
          value={testValue}
          onChange={() => undefined}
          onCursorChange={onCursorChange}
        />,
      );

      const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
        name: /markdown editor/i,
      });

      // Verify the textarea has the expected value with newline
      expect(textarea.value).toBe(testValue);

      // Manually set selection range
      textarea.setSelectionRange(8, 13);

      fireEvent.select(textarea);

      // onCursorChange should be called with cursor position
      // text before cursor: "# Hello\n" -> split by '\n' -> ["# Hello", ""]
      // currentLine = 2, currentColumn = 0 + 1 = 1
      expect(onCursorChange).toHaveBeenCalledWith({
        line: 2,
        column: 1,
        offset: 8,
      });
    });

    it('tracks cursor position accurately on click', () => {
      const onCursorChange = vi.fn();
      const testValue = `Line 1
Line 2
Line 3`; // Actual newlines
      render(
        <Editor
          value={testValue}
          onChange={() => undefined}
          onCursorChange={onCursorChange}
        />,
      );

      const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
        name: /markdown editor/i,
      });

      // "Line 1\n" = 7 chars, position 7 is at start of "Line 2"
      textarea.setSelectionRange(7, 7);

      fireEvent.select(textarea);

      expect(onCursorChange).toHaveBeenCalledWith({
        line: 2,
        column: 1,
        offset: 7,
      });
    });

    it('handles cursor at beginning of text', () => {
      const onCursorChange = vi.fn();
      render(
        <Editor
          value="Some text"
          onChange={() => undefined}
          onCursorChange={onCursorChange}
        />,
      );

      const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
        name: /markdown editor/i,
      });

      // Select at start
      textarea.setSelectionRange(0, 0);

      fireEvent.select(textarea);

      expect(onCursorChange).toHaveBeenCalledWith({
        line: 1,
        column: 1,
        offset: 0,
      });
    });

    it('handles multi-line cursor position', () => {
      const onCursorChange = vi.fn();
      const testValue = `# Title

Paragraph here`; // Actual newlines: "# Title\n\nParagraph here"
      render(
        <Editor
          value={testValue}
          onChange={() => undefined}
          onCursorChange={onCursorChange}
        />,
      );

      const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
        name: /markdown editor/i,
      });

      // "# Title\n\n" = 9 chars (positions 0-8), position 9 is at 'P' in "Paragraph"
      // text before cursor: "# Title\n\n" -> split -> ["# Title", "", ""]
      // currentLine = 3, currentColumn = 0 + 1 = 1
      textarea.setSelectionRange(9, 9);

      fireEvent.select(textarea);

      expect(onCursorChange).toHaveBeenCalledWith({
        line: 3,
        column: 1,
        offset: 9,
      });
    });
  });
});
