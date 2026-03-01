import type { ReactNode } from 'react';
import { useState } from 'react';

import type { LayoutProps } from '../../types/markdown';

/**
 * Layout component for responsive editor/preview arrangement.
 * Supports split view (desktop) and toggle view (mobile).
 */
export function Layout({
  children,
  mode,
  onToggleView,
  className = '',
}: LayoutProps) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const isEditorOnly = mode === 'editor-only';
  const isPreviewOnly = mode === 'preview-only';
  const isSplit = mode === 'split';

  const toggleLabel = isEditorOnly ? 'Show Preview' : 'Show Editor';

  const handleToggleDark = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  // Convert children to array for selective rendering
  const childrenArray = Array.isArray(children) ? children : [children];
  const editorPane = childrenArray[0] as ReactNode;
  const previewPane = childrenArray[1] as ReactNode;

  return (
    <div
      data-testid="layout-container"
      className={`flex h-screen flex-col ${className}`}
    >
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Markdown Preview
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleDark}
            aria-pressed={isDark ? 'true' : 'false'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {isDark ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={onToggleView}
            aria-pressed={isEditorOnly ? 'false' : 'true'}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden"
          >
            {toggleLabel}
          </button>
        </div>
      </header>

      {/* Editor and Preview Panes */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Editor Pane */}
        <div
          className={`flex-1 overflow-auto border-r border-gray-200 dark:border-gray-700 ${isPreviewOnly ? 'hidden' : ''} ${
            isSplit ? 'md:w-1/2' : 'w-full'
          }`}
        >
          {editorPane}
        </div>

        {/* Preview Pane */}
        <div
          className={`flex-1 overflow-auto ${isEditorOnly ? 'hidden' : ''} ${
            isSplit ? 'md:w-1/2' : 'w-full'
          }`}
        >
          {previewPane}
        </div>
      </div>
    </div>
  );
}
