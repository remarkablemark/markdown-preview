import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMarkdown } from './useMarkdown';

describe('useMarkdown hook', () => {
  it('returns initial state with empty html and isEmpty true', () => {
    const { result } = renderHook(() => useMarkdown());

    expect(result.current.html).toBe('');
    expect(result.current.isEmpty).toBe(true);
  });

  it('provides a parse function that converts markdown to HTML', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('# Hello World');

    expect(html).toContain('<h1>');
    expect(html).toContain('Hello World');
  });

  it('returns empty string for empty markdown input', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('');

    expect(html).toBe('');
  });

  it('returns empty string for whitespace-only markdown', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('   ');

    expect(html).toBe('');
  });

  it('sanitizes HTML by default when sanitize option is enabled', () => {
    const { result } = renderHook(() =>
      useMarkdown({ sanitize: true, gfm: true, breaks: false }),
    );

    const html = result.current.parse('<script>alert("XSS")</script>Safe');

    expect(html).not.toContain('<script>');
    expect(html).toContain('Safe');
  });

  it('does not sanitize HTML when sanitize option is false', () => {
    const { result } = renderHook(() =>
      useMarkdown({ sanitize: false, gfm: true, breaks: false }),
    );

    const html = result.current.parse('<strong>Bold</strong>');

    expect(html).toContain('<strong>');
  });

  it('respects gfm option for GitHub Flavored Markdown', () => {
    const { result } = renderHook(() =>
      useMarkdown({ gfm: true, breaks: false, sanitize: false }),
    );

    const html = result.current.parse('~~strikethrough~~');

    expect(html).toContain('<del>');
  });

  it('respects breaks option for line breaks', () => {
    const { result } = renderHook(() =>
      useMarkdown({ breaks: true, gfm: true, sanitize: false }),
    );

    const html = result.current.parse('Line 1\nLine 2');

    expect(html).toContain('<br>');
  });

  it('provides setOptions function to update parsing options', () => {
    const { result } = renderHook(() =>
      useMarkdown({ sanitize: true, gfm: true, breaks: false }),
    );

    expect(result.current.options.sanitize).toBe(true);

    act(() => {
      result.current.setOptions({ sanitize: false });
    });

    expect(result.current.options.sanitize).toBe(false);
  });

  it('merges new options with existing options when setOptions is called', () => {
    const { result } = renderHook(() =>
      useMarkdown({ sanitize: true, gfm: true, breaks: false }),
    );

    act(() => {
      result.current.setOptions({ breaks: true });
    });

    expect(result.current.options.sanitize).toBe(true);
    expect(result.current.options.gfm).toBe(true);
    expect(result.current.options.breaks).toBe(true);
  });

  it('renders bold and italic formatting correctly', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('**bold** and *italic*');

    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
  });

  it('renders lists correctly', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('- Item 1\n- Item 2');

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('renders headers correctly', () => {
    const { result } = renderHook(() => useMarkdown());

    const html = result.current.parse('# Header 1\n## Header 2');

    expect(html).toContain('<h1>');
    expect(html).toContain('<h2>');
  });

  it('uses default options when no options provided', () => {
    const { result } = renderHook(() => useMarkdown());
    const options = result.current.options;

    expect(options.sanitize).toBe(true);
    expect(options.gfm).toBe(true);
    expect(options.breaks).toBe(false);
    expect(typeof options.emptyPlaceholder).toBe('string');
    expect(options.emptyPlaceholder).toContain('Start typing');
  });

  it('accepts partial options and merges with defaults', () => {
    const { result } = renderHook(() => useMarkdown({ breaks: true }));

    expect(result.current.options.breaks).toBe(true);
    expect(result.current.options.sanitize).toBe(true);
    expect(result.current.options.gfm).toBe(true);
  });
});
