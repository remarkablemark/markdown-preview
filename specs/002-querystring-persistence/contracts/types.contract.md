# Contract: TypeScript Type Definitions

**Type**: Type Definitions  
**Stability**: Stable  
**Since**: 002-querystring-persistence

## Purpose

Public TypeScript type definitions and interfaces for the querystring persistence feature. These types ensure type safety across the application and serve as documentation for the feature's data structures.

## Public Types

### Hook Return Types

#### `UseUrlPersistenceReturn`

Return type for the `useUrlPersistence` hook.

```typescript
export interface UseUrlPersistenceReturn {
  /** Current markdown content synchronized with URL */
  markdown: string;

  /** Update markdown content (triggers debounced URL sync) */
  setMarkdown: (value: string) => void;

  /** Whether content was loaded from URL on initial mount */
  loadedFromUrl: boolean;

  /** Manually trigger URL sync (bypasses debounce) */
  syncToUrl: () => void;
}
```

**Usage**:

```typescript
const {
  markdown,
  setMarkdown,
  loadedFromUrl,
  syncToUrl,
}: UseUrlPersistenceReturn = useUrlPersistence();
```

---

### Encoder Result Types

#### `EncodeResult`

Discriminated union type for encoding operation results.

```typescript
export type EncodeResult =
  | { success: true; encoded: string; compressedLength: number }
  | { success: false; error: Error };
```

**Type Guards**:

```typescript
if (result.success) {
  // TypeScript knows: result.encoded and result.compressedLength exist
  console.log(result.encoded);
} else {
  // TypeScript knows: result.error exists
  console.error(result.error);
}
```

#### `DecodeResult`

Discriminated union type for decoding operation results.

```typescript
export type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };
```

**Type Guards**:

```typescript
if (result.success) {
  // TypeScript knows: result.decoded exists
  setMarkdown(result.decoded);
} else {
  // TypeScript knows: result.error exists
  console.error(result.error);
}
```

---

### Validation Types

#### `UrlLengthCheck`

Result of URL length validation.

```typescript
export interface UrlLengthCheck {
  /** Whether encoded string exceeds limit */
  exceedsLimit: boolean;

  /** Actual length of encoded string */
  actualLength: number;

  /** Maximum recommended length */
  maxLength: number;

  /** Percentage of limit used (0-100+) */
  percentUsed: number;
}
```

**Usage**:

```typescript
const check: UrlLengthCheck = checkUrlLength(encoded);
if (check.exceedsLimit) {
  console.warn(`URL at ${check.percentUsed}% of limit`);
}
```

---

### Constants Types

#### `UrlParamKey`

Literal type for the URL parameter name.

```typescript
export type UrlParamKey = 'md';
```

**Usage**:

```typescript
const paramKey: UrlParamKey = 'md'; // ✅ Valid
const paramKey: UrlParamKey = 'markdown'; // ❌ Type error
```

---

### Error Types

#### `UrlPersistenceError`

Custom error class for URL persistence operations.

```typescript
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

**Properties**:

- **`message`**: Error description
- **`operation`**: Which operation failed ('encode' | 'decode' | 'sync')
- **`originalError`**: Optional underlying error that caused the failure

**Usage**:

```typescript
try {
  // ... encode operation
} catch (err) {
  throw new UrlPersistenceError(
    'Failed to encode markdown',
    'encode',
    err as Error,
  );
}
```

---

## Internal Types (Not Exported)

These types are used internally but not part of the public API:

### `UrlPersistenceState`

Internal state for the hook (not exported).

```typescript
interface UrlPersistenceState {
  markdown: string;
  loadedFromUrl: boolean;
  isSyncing: boolean;
  lastError: Error | null;
}
```

### `DebouncedFunction`

Type for debounced function (not exported).

```typescript
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}
```

---

## Type Utilities

### Type Guards

#### `isEncodeSuccess`

Type guard for successful encode result.

```typescript
export function isEncodeSuccess(
  result: EncodeResult,
): result is { success: true; encoded: string; compressedLength: number } {
  return result.success === true;
}
```

**Usage**:

```typescript
const result = encodeMarkdown(content);
if (isEncodeSuccess(result)) {
  // TypeScript knows result has 'encoded' and 'compressedLength'
  updateUrl(result.encoded);
}
```

#### `isDecodeSuccess`

Type guard for successful decode result.

```typescript
export function isDecodeSuccess(
  result: DecodeResult,
): result is { success: true; decoded: string } {
  return result.success === true;
}
```

**Usage**:

```typescript
const result = decodeMarkdown(encoded);
if (isDecodeSuccess(result)) {
  // TypeScript knows result has 'decoded'
  setMarkdown(result.decoded);
}
```

---

## Constants

### Type-Safe Constants

```typescript
/** Querystring parameter name for markdown content */
export const URL_PARAM_KEY: UrlParamKey = 'md' as const;

/** Maximum URL length before warning (conservative for compatibility) */
export const MAX_URL_LENGTH: number = 2048;

/** Debounce delay for URL updates (milliseconds) */
export const URL_UPDATE_DEBOUNCE_MS: number = 500;

/** Performance target for encode/decode operations (milliseconds) */
export const PERFORMANCE_TARGET_MS: number = 100;

/** Default markdown shown when URL is empty or corrupt */
export const DEFAULT_MARKDOWN: string = `# Welcome to Markdown Preview

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

---

## Type Compatibility

### React Types

All types are compatible with React's type system:

```typescript
// ✅ Hook can be used in React components
function MyComponent() {
  const { markdown, setMarkdown }: UseUrlPersistenceReturn = useUrlPersistence();

  return (
    <textarea
      value={markdown}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setMarkdown(e.target.value)
      }
    />
  );
}
```

### Strict Mode Compliance

All types work with TypeScript strict mode:

- ✅ No implicit `any`
- ✅ Strict null checks
- ✅ Strict function types
- ✅ No unused locals/parameters

---

## Usage Examples

### Full Type-Safe Implementation

```typescript
import type {
  UseUrlPersistenceReturn,
  EncodeResult,
  DecodeResult,
  UrlLengthCheck,
} from 'src/types/urlPersistence.types';

import {
  useUrlPersistence,
  encodeMarkdown,
  decodeMarkdown,
  checkUrlLength,
} from 'src/hooks/useUrlPersistence';

function MarkdownEditor(): JSX.Element {
  const {
    markdown,
    setMarkdown,
    loadedFromUrl,
    syncToUrl,
  }: UseUrlPersistenceReturn = useUrlPersistence();

  const handleShare = (): void => {
    syncToUrl();

    const result: EncodeResult = encodeMarkdown(markdown);
    if (result.success) {
      const check: UrlLengthCheck = checkUrlLength(result.encoded);
      if (check.exceedsLimit) {
        alert(`URL may be too long (${check.percentUsed}% of limit)`);
      }
    }

    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div>
      {loadedFromUrl && <p>Loaded from shared URL</p>}
      <textarea
        value={markdown}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMarkdown(e.target.value)
        }
      />
      <button onClick={handleShare}>Share</button>
    </div>
  );
}
```

### Error Handling with Types

```typescript
import type { DecodeResult } from 'src/types/urlPersistence.types';
import { decodeMarkdown, DEFAULT_MARKDOWN } from 'src/utils/urlEncoder';

function loadFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const encoded: string | null = params.get('md');

  if (!encoded) {
    return DEFAULT_MARKDOWN;
  }

  const result: DecodeResult = decodeMarkdown(encoded);

  if (result.success) {
    return result.decoded;
  } else {
    console.error('Decode failed:', result.error);
    return DEFAULT_MARKDOWN;
  }
}
```

---

## Testing Types

### Type-Only Tests

```typescript
import type {
  UseUrlPersistenceReturn,
  EncodeResult,
  DecodeResult,
} from 'src/types/urlPersistence.types';

// Type assertions for compile-time verification
type AssertEqual<T, U> = T extends U ? (U extends T ? true : false) : false;

// Verify hook return type
type HookReturnTest = AssertEqual<
  UseUrlPersistenceReturn,
  {
    markdown: string;
    setMarkdown: (value: string) => void;
    loadedFromUrl: boolean;
    syncToUrl: () => void;
  }
>;

const hookReturnTest: HookReturnTest = true; // ✅ Compiles

// Verify discriminated unions work
function testEncodeResult(result: EncodeResult): void {
  if (result.success) {
    // @ts-expect-error - error should not exist on success
    const error = result.error;

    // ✅ These should exist
    const encoded: string = result.encoded;
    const length: number = result.compressedLength;
  } else {
    // @ts-expect-error - encoded should not exist on failure
    const encoded = result.encoded;

    // ✅ This should exist
    const error: Error = result.error;
  }
}
```

---

## Breaking Changes

Changes that would break this contract:

- ❌ Removing or renaming exported types
- ❌ Changing interface property names
- ❌ Changing discriminated union structure
- ❌ Making required properties optional (or vice versa)
- ❌ Changing property types

## Non-Breaking Changes

Changes that preserve this contract:

- ✅ Adding new optional properties to interfaces
- ✅ Adding new exported types
- ✅ Adding type guards or utility types
- ✅ Improving JSDoc comments
- ✅ Adding internal (non-exported) types

---

## Version History

- **v1.0.0** (002-querystring-persistence): Initial type definitions
