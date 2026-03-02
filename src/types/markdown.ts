/**
 * Defines the layout mode based on available screen width.
 */
export type LayoutMode = 'split' | 'editor-only' | 'preview-only';

/**
 * Configuration for markdown rendering.
 */
export interface PreviewOptions {
  /** Enable GitHub Flavored Markdown */
  gfm: boolean;
  /** Convert line breaks to <br> */
  breaks: boolean;
  /** Sanitize HTML output */
  sanitize: boolean;
  /** Placeholder HTML when content is empty */
  emptyPlaceholder: string;
}

/**
 * Default preview options configuration.
 */
export const DEFAULT_PREVIEW_OPTIONS: PreviewOptions = {
  gfm: true,
  breaks: false,
  sanitize: true,
  emptyPlaceholder:
    '<p class="text-gray-400 italic">Start typing markdown...</p>',
};

/**
 * Props for the Editor component.
 */
export interface EditorProps {
  /** Current markdown content */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * Props for the Preview component.
 */
export interface PreviewProps {
  /** Markdown content to render */
  markdown: string;
  /** Rendering options */
  options?: Partial<PreviewOptions>;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Props for the Layout component.
 */
export interface LayoutProps {
  /** Editor and Preview components */
  children: React.ReactNode;
  /** Current layout mode */
  mode: LayoutMode;
  /** Callback to toggle view mode (mobile) */
  onToggleView?: () => void;
}
