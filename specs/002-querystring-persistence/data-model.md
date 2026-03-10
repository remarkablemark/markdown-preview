# Data Model: Querystring Persistence

**Feature**: Querystring Persistence  
**Branch**: `002-querystring-persistence`  
**Date**: 2026-03-10

## Overview

This document defines the data structures, types, and state management for URL-based markdown persistence. The feature operates entirely client-side with no server storage.

## Core Entities

### 1. EncodedUrlParameter

**Description**: URL-safe compressed representation of markdown content

**TypeScript Interface**:

```typescript
interface EncodedUrlParameter {
  /** Querystring parameter name (always 'md') */
  key: 'md';

  /** LZ-string compressed and URL-encoded markdown */
  value: string;

  /** Original markdown length before compression */
  originalLength: number;

  /** Compressed length (for monitoring URL limits) */
  compressedLength: number;
}
```

**Validation Rules**:

- `key`: Must always be `'md'` (constant)
- `value`: Must be valid LZ-string encoded output (URL-safe characters only)
- `compressedLength`: Must be ≤ 2048 chars (log warning if exceeded)
- Round-trip requirement: `decode(encode(content)) === content` (100% fidelity)

**Transformations**:

```typescript
// Encode: MarkdownContent → EncodedUrlParameter
const encode = (markdown: string): string => {
  return compressToEncodedURIComponent(markdown);
};

// Decode: EncodedUrlParameter → MarkdownContent
const decode = (encoded: string): string | null => {
  try {
    return decompressFromEncodedURIComponent(encoded);
  } catch {
    return null; // Return null for corrupt data
  }
};
```

### 3. UrlPersistenceState

**Description**: Internal state managed by the `useUrlPersistence` hook

**TypeScript Interface**:

```typescript
interface UrlPersistenceState {
  /** Current markdown content in editor */
  markdown: string;

  /** Whether content was loaded from URL on initial mount */
  loadedFromUrl: boolean;

  /** Whether URL sync is currently active */
  isSyncing: boolean;

  /** Last error encountered (for debugging) */
  lastError: Error | null;
}
```

**State Transitions**:

```
[Initial] → [Loading from URL] → [Loaded]
                ↓
         [Syncing to URL] ← [User Editing]
                ↓
         [Sync Complete]
```

**Invariants**:

- `loadedFromUrl` is set once on mount, never changes
- `isSyncing` is true only during debounce window
- `lastError` is cleared on successful operations

## Constants

### URL Configuration

```typescript
/** Querystring parameter name for markdown content */
export const URL_PARAM_KEY = 'md' as const;

/** Maximum URL length before warning (conservative for compatibility) */
export const MAX_URL_LENGTH = 2048;

/** Debounce delay for URL updates (milliseconds) */
export const URL_UPDATE_DEBOUNCE_MS = 500;

/** Performance target for encode/decode operations (milliseconds) */
export const PERFORMANCE_TARGET_MS = 100;
```

### Default Content

```typescript
/** Default markdown shown when URL is empty or corrupt */
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

## Type Definitions

### Core Types

```typescript
/**
 * Result type for encode/decode operations
 */
export type EncodeResult =
  | { success: true; encoded: string; compressedLength: number }
  | { success: false; error: Error };

export type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };

/**
 * URL persistence hook return type
 */
export interface UseUrlPersistenceReturn {
  /** Current markdown content */
  markdown: string;

  /** Update markdown content (triggers URL sync) */
  setMarkdown: (value: string) => void;

  /** Whether content was loaded from URL */
  loadedFromUrl: boolean;

  /** Manually trigger URL sync (bypasses debounce) */
  syncToUrl: () => void;
}

/**
 * URL encoder utility functions
 */
export interface UrlEncoder {
  /** Encode markdown to URL-safe string */
  encode: (markdown: string) => EncodeResult;

  /** Decode URL parameter to markdown */
  decode: (encoded: string) => DecodeResult;

  /** Check if encoded string exceeds URL length limit */
  exceedsLimit: (encoded: string) => boolean;
}
```

### Error Types

```typescript
/**
 * Custom error for URL persistence operations
 */
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

## Data Flow

### Initial Page Load

```
1. Page loads
2. useUrlPersistence hook mounts
3. Read querystring parameter 'md'
4. If present:
   a. Decode using LZ-string
   b. If successful: Set as editor content
   c. If failed: Use DEFAULT_MARKDOWN
5. If absent: Use DEFAULT_MARKDOWN
6. Set loadedFromUrl flag
```

### User Editing Flow

```
1. User types in editor
2. onChange event fires
3. setMarkdown() called with new content
4. Debounce timer starts (500ms)
5. If user continues typing:
   a. Cancel previous timer
   b. Start new timer
6. When timer expires:
   a. Encode markdown using LZ-string
   b. Check compressed length
   c. If > MAX_URL_LENGTH: console.warn()
   d. Update URL using history.replaceState()
7. URL updated (no page reload)
```

### URL Sharing Flow

```
1. User copies URL from browser
2. URL contains encoded markdown in 'md' parameter
3. Recipient opens URL
4. Initial page load flow executes
5. Markdown decoded and displayed
6. Recipient can edit (triggers user editing flow)
```

## Validation Rules

### Encode Operation

- **Input**: Any string (including empty)
- **Output**: URL-safe string or error
- **Performance**: Must complete in <100ms
- **Fidelity**: `decode(encode(x)) === x` for all valid inputs

### Decode Operation

- **Input**: URL-safe string from querystring
- **Output**: Original markdown or null (for corrupt data)
- **Performance**: Must complete in <100ms
- **Error Handling**: Silent fallback to DEFAULT_MARKDOWN (no user-visible errors)

### URL Update Operation

- **Trigger**: Debounced on content change (500ms)
- **Method**: `history.replaceState()` (not `pushState`)
- **Warning**: Log to console if compressed length > 2048 chars
- **Continuation**: Always update URL even if length exceeded

## State Management

### Hook Architecture

```typescript
/**
 * Custom hook for URL persistence
 * Manages bidirectional sync between editor content and URL
 */
export function useUrlPersistence(
  initialMarkdown?: string,
): UseUrlPersistenceReturn {
  // Internal state
  const [markdown, setMarkdownState] = useState<string>('');
  const [loadedFromUrl, setLoadedFromUrl] = useState<boolean>(false);

  // Load from URL on mount (once)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_PARAM_KEY);

    if (encoded) {
      const result = decode(encoded);
      if (result.success) {
        setMarkdownState(result.decoded);
        setLoadedFromUrl(true);
        return;
      }
    }

    // Fallback to default
    setMarkdownState(initialMarkdown ?? DEFAULT_MARKDOWN);
  }, []);

  // Debounced URL sync
  const debouncedSync = useMemo(
    () =>
      debounce((content: string) => {
        const result = encode(content);
        if (result.success) {
          if (result.compressedLength > MAX_URL_LENGTH) {
            console.warn(
              `Encoded markdown exceeds URL length limit ` +
                `(${result.compressedLength} > ${MAX_URL_LENGTH})`,
            );
          }

          const url = new URL(window.location.href);
          url.searchParams.set(URL_PARAM_KEY, result.encoded);
          window.history.replaceState(null, '', url.toString());
        }
      }, URL_UPDATE_DEBOUNCE_MS),
    [],
  );

  // Public setter that triggers sync
  const setMarkdown = useCallback(
    (value: string) => {
      setMarkdownState(value);
      debouncedSync(value);
    },
    [debouncedSync],
  );

  return {
    markdown,
    setMarkdown,
    loadedFromUrl,
    syncToUrl: () => debouncedSync.flush(),
  };
}
```

## Performance Considerations

### Encoding Performance

- **Target**: <100ms for all operations
- **Typical**: 5-40ms for content up to 10KB
- **Bottleneck**: LZ-string compression (already optimized)
- **Monitoring**: Performance tests verify target compliance

### Debounce Strategy

- **Delay**: 500ms (balances responsiveness and performance)
- **Type**: Trailing edge (update after user stops typing)
- **Cancellation**: Previous timer cancelled on new input
- **Flush**: Manual sync available via `syncToUrl()` method

### Memory Usage

- **Minimal**: Only stores current markdown string
- **No history**: URL updates use replaceState (no history accumulation)
- **Garbage collection**: Debounce timers cleaned up properly

## Security Considerations

### XSS Prevention

- **Threat**: Malicious markdown in URL could inject scripts
- **Mitigation**: Existing DOMPurify sanitization handles this
- **Verification**: Test with XSS payloads in querystring

### Data Privacy

- **Visibility**: Markdown content visible in URL (browser history, logs, referrers)
- **User Education**: Document that sensitive data should not be stored
- **No Server Storage**: Content never sent to server (client-side only)

## Testing Requirements

### Unit Tests

- ✅ Encode/decode round-trip fidelity (100% data preservation)
- ✅ Special character handling (Unicode, emojis, markdown syntax)
- ✅ Performance benchmarks (<100ms target)
- ✅ Edge cases (empty string, very large content, malformed data)
- ✅ Error handling (corrupt data returns null)

### Integration Tests

- ✅ URL updates on content change with debounce
- ✅ Initial load from querystring parameter
- ✅ Fallback to default placeholder
- ✅ Console warning on URL length exceeded
- ✅ replaceState vs pushState behavior

### Hook Tests

- ✅ useUrlPersistence hook initialization
- ✅ Debounced sync behavior
- ✅ loadedFromUrl flag correctness
- ✅ Manual sync via syncToUrl()

## Dependencies

### External Libraries

- **lz-string**: ^1.5.0 (compression/decompression)

### Browser APIs

- **URLSearchParams**: Parse and construct querystrings
- **History API**: Update URL without reload
- **performance.now()**: Performance measurement

## Migration Notes

**N/A** - This is a new feature with no existing data to migrate.

## Future Considerations

### Potential Enhancements (Out of Scope)

- **Compression algorithm selection**: Allow users to choose compression method
- **URL shortening service**: Integrate with URL shortener for very long content
- **LocalStorage backup**: Fallback storage when URL limits exceeded
- **Share button UI**: Dedicated button to copy URL to clipboard
- **QR code generation**: Generate QR code for mobile sharing

**Note**: These are explicitly YAGNI (You Aren't Gonna Need It) until proven necessary.
