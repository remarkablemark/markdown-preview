# Quickstart Guide: Querystring Persistence

**Feature**: Querystring Persistence  
**Branch**: `002-querystring-persistence`  
**Date**: 2026-03-10

## Overview

This guide provides a step-by-step walkthrough for implementing URL-based markdown persistence. Follow the TDD workflow: write tests first, validate they fail, then implement.

## Prerequisites

- Node.js and npm installed
- Feature branch checked out: `002-querystring-persistence`
- Dependencies installed: `npm install`

## Implementation Checklist

- [ ] Install `lz-string` dependency
- [ ] Create type definitions
- [ ] Create URL encoder utilities (TDD)
- [ ] Create `useUrlPersistence` hook (TDD)
- [ ] Integrate hook into App component
- [ ] Add integration tests
- [ ] Verify all tests pass with 100% coverage
- [ ] Manual testing in browser

## Step 1: Install Dependencies

```bash
npm install lz-string@^1.5.0
npm install --save-dev @types/lz-string
```

**Verify**:

```bash
npm list lz-string
# Should show lz-string@1.5.0 or higher
```

## Step 2: Create Type Definitions

**File**: `src/types/urlPersistence.types.ts`

```typescript
export interface UseUrlPersistenceReturn {
  markdown: string;
  setMarkdown: (value: string) => void;
  loadedFromUrl: boolean;
  syncToUrl: () => void;
}

export type EncodeResult =
  | { success: true; encoded: string; compressedLength: number }
  | { success: false; error: Error };

export type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };

export interface UrlLengthCheck {
  exceedsLimit: boolean;
  actualLength: number;
  maxLength: number;
  percentUsed: number;
}

export class UrlPersistenceError extends Error {
  constructor(
    message: string,
    public readonly operation: 'encode' | 'decode' | 'sync',
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'UrlPersistenceError';
  }
}
```

**Verify**:

```bash
npm run lint:tsc
# Should compile without errors
```

## Step 3: Create Constants

**File**: `src/constants/index.ts` (add to existing file)

```typescript
// URL Persistence Constants
export const URL_PARAM_KEY = 'md' as const;
export const MAX_URL_LENGTH = 2048;
export const URL_UPDATE_DEBOUNCE_MS = 500;
export const PERFORMANCE_TARGET_MS = 100;

export const DEFAULT_MARKDOWN = `# Welcome to Markdown Preview

Try editing this text to see live preview!

## Features
- **Bold** and *italic* text
- [Links](https://example.com)
- \`code\` blocks

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
`;
```

## Step 4: Create URL Encoder Tests (TDD - Red Phase)

**File**: `src/utils/urlEncoder.test.ts`

```typescript
import { describe, expect, it } from 'vitest';

import { checkUrlLength, decodeMarkdown, encodeMarkdown } from './urlEncoder';

describe('urlEncoder', () => {
  describe('encodeMarkdown', () => {
    it('should encode markdown to URL-safe string', () => {
      const markdown = '# Hello World';
      const result = encodeMarkdown(markdown);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.encoded).toBeTruthy();
        expect(result.compressedLength).toBeGreaterThan(0);
      }
    });

    it('should handle empty string', () => {
      const result = encodeMarkdown('');
      expect(result.success).toBe(true);
    });

    it('should handle Unicode characters', () => {
      const markdown = '你好 🎉 Hello';
      const result = encodeMarkdown(markdown);
      expect(result.success).toBe(true);
    });

    it('should handle special characters', () => {
      const markdown = '<>&"\'`\n\t';
      const result = encodeMarkdown(markdown);
      expect(result.success).toBe(true);
    });

    it('should complete in under 100ms', () => {
      const markdown = 'x'.repeat(5000);
      const start = performance.now();
      encodeMarkdown(markdown);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('decodeMarkdown', () => {
    it('should decode encoded markdown', () => {
      const original = '# Test\n\nContent';
      const encoded = encodeMarkdown(original);

      if (encoded.success) {
        const result = decodeMarkdown(encoded.encoded);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.decoded).toBe(original);
        }
      }
    });

    it('should return error for invalid input', () => {
      const result = decodeMarkdown('invalid!!!data');
      expect(result.success).toBe(false);
    });

    it('should complete in under 100ms', () => {
      const markdown = 'x'.repeat(5000);
      const encoded = encodeMarkdown(markdown);

      if (encoded.success) {
        const start = performance.now();
        decodeMarkdown(encoded.encoded);
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(100);
      }
    });
  });

  describe('round-trip fidelity', () => {
    const testCases = [
      '# Simple',
      'Unicode: 你好 🎉',
      'Special: <>&"\'',
      'Whitespace:\n\n\t  ',
      '',
      'x'.repeat(1000),
    ];

    testCases.forEach((testCase) => {
      it(`should preserve: ${testCase.substring(0, 20)}...`, () => {
        const encoded = encodeMarkdown(testCase);
        expect(encoded.success).toBe(true);

        if (encoded.success) {
          const decoded = decodeMarkdown(encoded.encoded);
          expect(decoded.success).toBe(true);

          if (decoded.success) {
            expect(decoded.decoded).toBe(testCase);
          }
        }
      });
    });
  });

  describe('checkUrlLength', () => {
    it('should detect when length exceeds limit', () => {
      const longString = 'x'.repeat(3000);
      const check = checkUrlLength(longString);

      expect(check.exceedsLimit).toBe(true);
      expect(check.actualLength).toBe(3000);
      expect(check.maxLength).toBe(2048);
      expect(check.percentUsed).toBeGreaterThan(100);
    });

    it('should calculate percentage correctly', () => {
      const shortString = 'x'.repeat(1024);
      const check = checkUrlLength(shortString);

      expect(check.exceedsLimit).toBe(false);
      expect(check.percentUsed).toBe(50);
    });
  });
});
```

**Verify tests fail**:

```bash
npm test -- src/utils/urlEncoder.test.ts
# Should fail - implementation doesn't exist yet
```

## Step 5: Implement URL Encoder (TDD - Green Phase)

**File**: `src/utils/urlEncoder.ts`

```typescript
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

import { MAX_URL_LENGTH } from 'src/constants';
import type {
  DecodeResult,
  EncodeResult,
  UrlLengthCheck,
} from 'src/types/urlPersistence.types';

export function encodeMarkdown(markdown: string): EncodeResult {
  try {
    const encoded = compressToEncodedURIComponent(markdown);
    return {
      success: true,
      encoded,
      compressedLength: encoded.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    };
  }
}

export function decodeMarkdown(encoded: string): DecodeResult {
  try {
    const decoded = decompressFromEncodedURIComponent(encoded);

    if (decoded === null || decoded === undefined) {
      return {
        success: false,
        error: new Error('Invalid encoded data'),
      };
    }

    return {
      success: true,
      decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    };
  }
}

export function checkUrlLength(encoded: string): UrlLengthCheck {
  const actualLength = encoded.length;
  const percentUsed = (actualLength / MAX_URL_LENGTH) * 100;

  return {
    exceedsLimit: actualLength > MAX_URL_LENGTH,
    actualLength,
    maxLength: MAX_URL_LENGTH,
    percentUsed,
  };
}
```

**Verify tests pass**:

```bash
npm test -- src/utils/urlEncoder.test.ts
# All tests should pass
```

**Check coverage**:

```bash
npm run test:ci -- src/utils/urlEncoder.test.ts
# Should show 100% coverage
```

## Step 6: Create Hook Tests (TDD - Red Phase)

**File**: `src/hooks/useUrlPersistence.test.tsx`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUrlPersistence } from './useUrlPersistence';

describe('useUrlPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('should initialize with default markdown when URL is empty', () => {
    const { result } = renderHook(() => useUrlPersistence());

    expect(result.current.markdown).toContain('Welcome to Markdown Preview');
    expect(result.current.loadedFromUrl).toBe(false);
  });

  it('should load markdown from URL parameter on mount', () => {
    const testMarkdown = '# Test Content';
    const encoded = 'BYUwNmD2Q4...'; // Mock encoded value
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

    // Should not update immediately
    expect(replaceStateSpy).not.toHaveBeenCalled();

    // Should update after debounce (500ms)
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
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const longMarkdown = 'x'.repeat(10000);

    act(() => {
      result.current.setMarkdown(longMarkdown);
    });

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });
});
```

**Verify tests fail**:

```bash
npm test -- src/hooks/useUrlPersistence.test.tsx
# Should fail - implementation doesn't exist yet
```

## Step 7: Implement Hook (TDD - Green Phase)

**File**: `src/hooks/useUrlPersistence.ts`

```typescript
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_MARKDOWN,
  MAX_URL_LENGTH,
  URL_PARAM_KEY,
  URL_UPDATE_DEBOUNCE_MS,
} from 'src/constants';
import type { UseUrlPersistenceReturn } from 'src/types/urlPersistence.types';
import {
  checkUrlLength,
  decodeMarkdown,
  encodeMarkdown,
} from 'src/utils/urlEncoder';

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] | null = null;

  const debouncedFn = ((...args: unknown[]) => {
    lastArgs = args;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  }) as T & { cancel: () => void; flush: () => void };

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFn.flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

export function useUrlPersistence(
  initialMarkdown?: string,
): UseUrlPersistenceReturn {
  const [markdown, setMarkdownState] = useState<string>('');
  const [loadedFromUrl, setLoadedFromUrl] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_PARAM_KEY);

    if (encoded) {
      const result = decodeMarkdown(encoded);
      if (result.success) {
        setMarkdownState(result.decoded);
        setLoadedFromUrl(true);
        return;
      }
    }

    setMarkdownState(initialMarkdown ?? DEFAULT_MARKDOWN);
  }, [initialMarkdown]);

  const debouncedSync = useMemo(
    () =>
      debounce((content: string) => {
        const result = encodeMarkdown(content);
        if (result.success) {
          const check = checkUrlLength(result.encoded);
          if (check.exceedsLimit) {
            console.warn(
              `Encoded markdown exceeds URL length limit ` +
                `(${check.actualLength} > ${check.maxLength})`,
            );
          }

          const url = new URL(window.location.href);
          url.searchParams.set(URL_PARAM_KEY, result.encoded);
          window.history.replaceState(null, '', url.toString());
        }
      }, URL_UPDATE_DEBOUNCE_MS),
    [],
  );

  const setMarkdown = useCallback(
    (value: string) => {
      setMarkdownState(value);
      debouncedSync(value);
    },
    [debouncedSync],
  );

  const syncToUrl = useCallback(() => {
    debouncedSync.flush();
  }, [debouncedSync]);

  return {
    markdown,
    setMarkdown,
    loadedFromUrl,
    syncToUrl,
  };
}
```

**Verify tests pass**:

```bash
npm test -- src/hooks/useUrlPersistence.test.tsx
# All tests should pass
```

## Step 8: Create Barrel Exports

**File**: `src/hooks/index.ts` (add to existing)

```typescript
export { useUrlPersistence } from './useUrlPersistence';
export type { UseUrlPersistenceReturn } from 'src/types/urlPersistence.types';
```

**File**: `src/utils/index.ts` (create if doesn't exist)

```typescript
export { checkUrlLength, decodeMarkdown, encodeMarkdown } from './urlEncoder';
```

## Step 9: Integrate into App Component

**File**: `src/components/App/App.tsx` (modify existing)

Find where markdown state is currently managed and replace with:

```typescript
import { useUrlPersistence } from 'src/hooks';

export function App() {
  const { markdown, setMarkdown, loadedFromUrl } = useUrlPersistence();

  // Rest of component...
}
```

## Step 10: Run All Tests

```bash
# Run all tests with coverage
npm run test:ci

# Verify 100% coverage (excluding barrel exports)
# Check coverage report in terminal
```

## Step 11: Manual Testing

```bash
# Start dev server
npm start
```

### Test Cases

1. **Empty URL Load**
   - Open http://localhost:5173
   - Verify default markdown appears
   - Edit content
   - Wait 500ms
   - Verify URL updates with `?md=` parameter

2. **URL Sharing**
   - Copy URL from browser
   - Open in new tab/window
   - Verify same content appears

3. **URL Length Warning**
   - Paste very long markdown (>5000 chars)
   - Open browser console
   - Verify warning appears about URL length

4. **Special Characters**
   - Enter markdown with Unicode: `你好 🎉`
   - Verify URL updates
   - Reload page
   - Verify content preserved exactly

5. **Corrupt URL**
   - Manually edit URL to `?md=invalid!!!`
   - Reload page
   - Verify default markdown appears (silent fallback)

## Step 12: Lint and Type Check

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run TypeScript type check
npm run lint:tsc
```

All should pass with no errors.

## Step 13: Build Verification

```bash
# Production build
npm run build

# Verify build succeeds
# Check dist/ directory created
```

## Troubleshooting

### Tests Failing

- **Debounce timing**: Use `waitFor` with sufficient timeout (1000ms)
- **Mock cleanup**: Ensure `vi.clearAllMocks()` in `beforeEach`
- **URL state**: Reset `window.location` between tests

### Type Errors

- **Import paths**: Use `src/` prefix for absolute imports
- **Strict mode**: All types must be explicit, no `any`
- **Result types**: Use discriminated unions with type guards

### Coverage Not 100%

- **Barrel exports**: Exclude `index.ts` files (not tested)
- **Error branches**: Test both success and failure paths
- **Edge cases**: Test empty strings, Unicode, special chars

## Next Steps

After implementation complete:

1. Create PR with all changes
2. Request code review
3. Address review feedback
4. Merge to main branch
5. Deploy to production

## Reference Documentation

- [research.md](./research.md) - Technical decisions and rationale
- [data-model.md](./data-model.md) - Data structures and types
- [contracts/](./contracts/) - Public API contracts
- [spec.md](./spec.md) - Feature specification

## Support

For questions or issues:

1. Review contract documentation in `contracts/` directory
2. Check test examples in `.test.ts` files
3. Consult research.md for technical decisions
