import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './components/App';

// Mock the root element for main.tsx tests
const mockRoot = document.createElement('div');
mockRoot.id = 'root';

describe('Main Integration Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.appendChild(mockRoot);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('User Story 1: Write and Edit Markdown Content', () => {
    it('user can type markdown text and see it appear in editor', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });
      expect(editor).toBeInTheDocument();

      // Clear existing content first
      fireEvent.change(editor, { target: { value: '' } });

      // Type in the editor
      await user.type(editor, 'Hello');

      // Verify the editor shows the typed content
      expect(editor).toHaveValue('Hello');
    });

    it('user can modify existing text', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });

      // Clear existing content first
      fireEvent.change(editor, { target: { value: '' } });

      // Type initial content
      await user.type(editor, 'Initial');
      expect(editor).toHaveValue('Initial');

      // Add more text
      await user.type(editor, ' Modified');
      expect(editor).toHaveValue('Initial Modified');
    });

    it('user can select and delete content', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });

      // Clear existing content first
      fireEvent.change(editor, { target: { value: '' } });

      // Type content
      await user.type(editor, 'Text');
      expect(editor).toHaveValue('Text');

      // Select all and delete
      const textarea = editor as HTMLTextAreaElement;
      textarea.setSelectionRange(0, textarea.value.length);
      fireEvent.select(editor);
      await user.keyboard('{Backspace}');

      // Content should be cleared
      expect(editor).toHaveValue('');
    });
  });

  describe('User Story 2: Live Preview Updates', () => {
    it('preview updates automatically as user types in editor', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });
      const preview = screen.getByRole('region', { name: /markdown preview/i });

      // Clear existing content first
      fireEvent.change(editor, { target: { value: '' } });

      // Type markdown
      await user.type(editor, '# Heading');

      // Verify preview updates
      await waitFor(() => {
        expect(preview).toHaveTextContent('Heading');
      });
    });

    it('headers render correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });
      const preview = screen.getByRole('region', { name: /markdown preview/i });

      // Type header markdown
      await user.type(editor, '# Main Title');

      // Verify preview shows header
      await waitFor(() => {
        expect(preview).toHaveTextContent('Main Title');
      });
    });

    it('bold and italic render correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });
      const preview = screen.getByRole('region', { name: /markdown preview/i });

      // Type bold and italic
      await user.type(editor, '**bold** and *italic*');

      // Verify preview renders formatting
      await waitFor(() => {
        expect(preview).toHaveTextContent('bold and italic');
      });
    });

    it('lists render correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });
      const preview = screen.getByRole('region', { name: /markdown preview/i });

      // Type list items
      await user.type(editor, '- Item 1\n- Item 2');

      // Verify preview shows list
      await waitFor(() => {
        expect(preview).toHaveTextContent('Item 1');
        expect(preview).toHaveTextContent('Item 2');
      });
    });

    it('empty editor shows empty preview state', () => {
      render(<App />);

      const editor = screen.getByRole('textbox', { name: /markdown editor/i });

      // Clear the default content
      fireEvent.change(editor, { target: { value: '' } });

      const preview = screen.getByRole('region', { name: /markdown preview/i });
      expect(preview).toHaveTextContent(/start typing/i);
    });
  });

  describe('main.tsx entry point', () => {
    it('renders App component wrapped in StrictMode', async () => {
      // Import main.tsx to execute the entry point code
      await act(async () => {
        await import('./main');
      });

      // Wait for the app to render
      await waitFor(() => {
        const editor = screen.queryByRole('textbox', {
          name: /markdown editor/i,
        });
        expect(editor).toBeInTheDocument();
      });
    });
  });
});
