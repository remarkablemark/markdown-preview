import type { ReactNode } from 'react';

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
  const isEditorOnly = mode === 'editor-only';
  const isPreviewOnly = mode === 'preview-only';
  const isSplit = mode === 'split';

  const toggleLabel = isEditorOnly ? 'Show preview' : 'Show editor';

  // Convert children to array for selective rendering
  const childrenArray = Array.isArray(children) ? children : [children];
  const editorPane = childrenArray[0] as ReactNode;
  const previewPane = childrenArray[1] as ReactNode;

  return (
    <div
      data-testid="layout-container"
      className={`flex h-screen flex-col md:flex-row ${className}`}
    >
      {/* Editor Pane */}
      <div
        className={`flex-1 overflow-auto border-r border-gray-200 ${isPreviewOnly ? 'hidden' : ''} ${
          isSplit ? 'md:w-1/2' : 'w-full'
        }`}
      >
        {editorPane}
      </div>

      {/* Mobile Toggle Button */}
      <div className="flex justify-center border-t border-b border-gray-200 p-2 md:hidden">
        <button
          type="button"
          onClick={onToggleView}
          aria-label={toggleLabel}
          aria-pressed={isEditorOnly ? 'false' : 'true'}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {toggleLabel}
        </button>
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
  );
}
