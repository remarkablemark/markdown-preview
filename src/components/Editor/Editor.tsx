import type { EditorProps } from '../../types/markdown';

/**
 * Editor component for markdown input.
 * Provides a controlled textarea with accessibility support.
 */
export function Editor({
  value,
  onChange,
  onCursorChange,
  placeholder = 'Start typing markdown...',
  disabled = false,
  className = '',
}: EditorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (onCursorChange) {
      const textarea = event.currentTarget;
      const text = textarea.value.substring(0, textarea.selectionStart);
      const lines = text.split('\n');
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length + 1;

      onCursorChange({
        line: currentLine,
        column: currentColumn,
        offset: textarea.selectionStart,
      });
    }
  };

  return (
    <textarea
      aria-label="Markdown editor"
      className={`h-full w-full resize-none bg-white p-4 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-900 dark:text-gray-100 ${className}`}
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      placeholder={placeholder}
      disabled={disabled}
      spellCheck={false}
    />
  );
}
