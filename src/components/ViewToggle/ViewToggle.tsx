import type { LayoutMode } from 'src/types/markdown';

interface ViewToggleProps {
  mode: LayoutMode;
  onToggle: () => void;
}

/**
 * Toggle button to switch between editor and preview modes on mobile.
 */
export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  const isEditorOnly = mode === 'editor-only';
  const label = isEditorOnly ? 'Preview' : 'Editor';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isEditorOnly ? 'false' : 'true'}
      className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden"
    >
      {label}
    </button>
  );
}
