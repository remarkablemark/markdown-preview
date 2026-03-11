import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useUrlPersistence } from './useUrlPersistence';

vi.mock('src/utils', async () => {
  const actual = await vi.importActual<typeof import('src/utils')>('src/utils');
  return {
    ...actual,
    debounce: (fn: (content: string) => void) => {
      const mock = fn as typeof fn & { cancel: () => void; flush: () => void };
      mock.cancel = vi.fn();
      mock.flush = vi.fn();
      return mock;
    },
  };
});

describe('useUrlPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('should initialize with default markdown when URL is empty', () => {
    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toContain('Heading');
  });

  it('should load markdown from URL parameter on mount', () => {
    const encoded = 'BYUwNmD2Q4A';
    window.history.replaceState(null, '', `/?md=${encoded}`);

    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toBe('hello');
  });

  it('should update URL when markdown changes', () => {
    const { result } = renderHook(() => useUrlPersistence());
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    act(() => {
      result.current.setMarkdown('# New Content');
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('should use replaceState not pushState', () => {
    const { result } = renderHook(() => useUrlPersistence());
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    act(() => {
      result.current.setMarkdown('# Test');
    });

    expect(replaceStateSpy).toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it('should warn when URL length exceeds limit', () => {
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

    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle corrupt URL data gracefully', () => {
    window.history.replaceState(null, '', '/?md=invalid!!!data');

    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toContain('Heading');
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
  });

  it('should prioritize URL parameter over initial markdown', () => {
    const encoded = 'BYUwNmD2Q4A';
    window.history.replaceState(null, '', `/?md=${encoded}`);

    const { result } = renderHook(() => useUrlPersistence('# Custom Initial'));

    expect(result.current.markdown).toBe('hello');
  });
});
