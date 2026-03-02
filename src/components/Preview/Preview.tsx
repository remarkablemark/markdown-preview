import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import type { PreviewProps } from 'src/types/markdown';
import { DEFAULT_PREVIEW_OPTIONS } from 'src/types/markdown';

/**
 * Preview component for rendering markdown as sanitized HTML.
 */
export function Preview({
  markdown,
  options = DEFAULT_PREVIEW_OPTIONS,
  ariaLabel = 'Markdown preview',
}: PreviewProps) {
  const mergedOptions = {
    ...DEFAULT_PREVIEW_OPTIONS,
    ...options,
  };

  const html = useMemo(() => {
    if (!markdown.trim()) {
      return mergedOptions.emptyPlaceholder;
    }

    // Configure marked with options
    marked.setOptions({
      gfm: mergedOptions.gfm,
      breaks: mergedOptions.breaks,
    });

    // Parse markdown to HTML
    const parsed = marked.parse(markdown) as string;

    // Sanitize HTML if enabled
    if (mergedOptions.sanitize) {
      return DOMPurify.sanitize(parsed);
    }

    return parsed;
  }, [
    markdown,
    mergedOptions.gfm,
    mergedOptions.breaks,
    mergedOptions.sanitize,
    mergedOptions.emptyPlaceholder,
  ]);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
      className="prose dark:prose-invert h-full max-w-none overflow-auto bg-white p-4 dark:bg-gray-800"
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
