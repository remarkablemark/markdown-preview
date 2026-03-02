import type { EditorProps } from 'src/types/markdown';

/**
 * Editor component for markdown input.
 * Provides a controlled textarea with accessibility support.
 */
export function Editor({
  value,
  onChange,
  placeholder = 'Start typing markdown...',
}: EditorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      aria-label="Markdown editor"
      className="h-full w-full resize-none bg-white p-4 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-900 dark:text-gray-100"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      spellCheck={false}
    />
  );
}
