import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useUrlPersistence } from './useUrlPersistence';

describe('useUrlPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('should initialize with default markdown when URL is empty', () => {
    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toContain('Heading');
    expect(result.current.loadedFromUrl).toBe(false);
  });

  it('should load markdown from URL parameter on mount', () => {
    const encoded = 'BYUwNmD2Q4A';
    window.history.replaceState(null, '', `/?md=${encoded}`);

    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.loadedFromUrl).toBe(true);
  });

  it('should update URL when markdown changes (debounced)', async () => {
    const { result } = renderHook(() => useUrlPersistence());
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    act(() => {
      result.current.setMarkdown('# New Content');
    });

    expect(replaceStateSpy).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(replaceStateSpy).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('should sync immediately when syncToUrl is called', () => {
    const { result } = renderHook(() => useUrlPersistence());
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    act(() => {
      result.current.setMarkdown('# Immediate');
      result.current.syncToUrl();
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('should use replaceState not pushState', async () => {
    const { result } = renderHook(() => useUrlPersistence());
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    act(() => {
      result.current.setMarkdown('# Test');
    });

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  it('should warn when URL length exceeds limit', async () => {
    const { result } = renderHook(() => useUrlPersistence());
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // Mock implementation
    });

    const longMarkdown = Array.from(
      { length: 5000 },
      (_, i) => `Line ${String(i)}: Random content ${String(Math.random())}\n`,
    ).join('');

    act(() => {
      result.current.setMarkdown(longMarkdown);
    });

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it('should handle corrupt URL data gracefully', () => {
    window.history.replaceState(null, '', '/?md=invalid!!!data');

    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toContain('Heading');
    expect(result.current.loadedFromUrl).toBe(false);
  });

  it('should update markdown state immediately', () => {
    const { result } = renderHook(() => useUrlPersistence());

    act(() => {
      result.current.setMarkdown('# Updated');
    });

    expect(result.current.markdown).toBe('# Updated');
  });

  it('should accept initial markdown parameter', () => {
    const { result } = renderHook(() => useUrlPersistence('# Custom Initial'));

    expect(result.current.markdown).toBe('# Custom Initial');
    expect(result.current.loadedFromUrl).toBe(false);
  });

  it('should prioritize URL parameter over initial markdown', () => {
    const encoded = 'BYUwNmD2Q4A';
    window.history.replaceState(null, '', `/?md=${encoded}`);

    const { result } = renderHook(() => useUrlPersistence('# Custom Initial'));

    expect(result.current.loadedFromUrl).toBe(true);
  });
});
