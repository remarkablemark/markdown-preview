import type { ReactNode } from 'react';
import type { LayoutProps } from 'src/types/markdown';

import { DarkModeToggle } from '../DarkModeToggle';
import { GitHubButton } from '../GitHubButton';
import { ViewToggle } from '../ViewToggle';

/**
 * Layout component for responsive editor/preview arrangement.
 * Supports split view (desktop) and toggle view (mobile).
 */
export function Layout({ children, mode, onToggleView }: LayoutProps) {
  const isEditorOnly = mode === 'editor-only';
  const isPreviewOnly = mode === 'preview-only';
  const isSplit = mode === 'split';

  // Convert children to array for selective rendering
  const childrenArray = Array.isArray(children) ? children : [children];
  const editorPane = childrenArray[0] as ReactNode;
  const previewPane = childrenArray[1] as ReactNode;

  return (
    <div data-testid="layout-container" className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          Markdown Preview
        </h1>
        <div className="flex items-center gap-2">
          <GitHubButton />
          <DarkModeToggle />
          {onToggleView && <ViewToggle mode={mode} onToggle={onToggleView} />}
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
