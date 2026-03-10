# Contract: URL Encoder Utilities

**Type**: Utility Functions  
**Stability**: Stable  
**Since**: 002-querystring-persistence

## Purpose

Pure utility functions for encoding and decoding markdown content to/from URL-safe compressed format. Provides high-performance compression using LZ-string algorithm with comprehensive error handling.

## Functions

### `encodeMarkdown`

Encode markdown string to URL-safe compressed format.

#### Signature

```typescript
function encodeMarkdown(markdown: string): EncodeResult;
```

#### Parameters

- **`markdown`**: `string` - Raw markdown content to encode
  - Can be any string including empty string
  - Preserves all Unicode characters, whitespace, and special characters
  - No length limit (performance degrades for very large content)

#### Return Value

```typescript
type EncodeResult =
  | { success: true; encoded: string; compressedLength: number }
  | { success: false; error: Error };
```

##### Success Case

- **`success`**: `true`
- **`encoded`**: URL-safe compressed string (LZ-string output)
- **`compressedLength`**: Length of encoded string in characters

##### Failure Case

- **`success`**: `false`
- **`error`**: `Error` object with details

#### Behavior

1. Compress markdown using `lz-string.compressToEncodedURIComponent()`
2. Measure compressed length
3. Return result object with encoded string and metadata

#### Performance

- **Target**: <100ms for all inputs
- **Typical**: 5-40ms for content up to 10KB
- **Scaling**: Linear with input size

#### Example

```typescript
import { encodeMarkdown } from 'src/utils/urlEncoder';

const result = encodeMarkdown('# Hello\n\nWorld!');

if (result.success) {
  console.log(result.encoded); // "BYUwNmD2Q4..."
  console.log(result.compressedLength); // 42
} else {
  console.error(result.error);
}
```

---

### `decodeMarkdown`

Decode URL-safe compressed string back to original markdown.

#### Signature

```typescript
function decodeMarkdown(encoded: string): DecodeResult;
```

#### Parameters

- **`encoded`**: `string` - URL-safe compressed string (from `encodeMarkdown`)
  - Must be valid LZ-string encoded output
  - Invalid input returns failure result (not exception)

#### Return Value

```typescript
type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };
```

##### Success Case

- **`success`**: `true`
- **`decoded`**: Original markdown string (100% fidelity)

##### Failure Case

- **`success`**: `false`
- **`error`**: `Error` object with details (e.g., "Invalid encoded data")

#### Behavior

1. Attempt to decompress using `lz-string.decompressFromEncodedURIComponent()`
2. If decompression returns `null` or throws: Return failure result
3. Otherwise: Return success with decoded string

#### Performance

- **Target**: <100ms for all inputs
- **Typical**: 3-30ms for content up to 10KB
- **Scaling**: Linear with input size

#### Example

```typescript
import { decodeMarkdown } from 'src/utils/urlEncoder';

const result = decodeMarkdown('BYUwNmD2Q4...');

if (result.success) {
  console.log(result.decoded); // "# Hello\n\nWorld!"
} else {
  console.error('Failed to decode:', result.error);
}
```

---

### `checkUrlLength`

Check if encoded string exceeds URL length limit.

#### Signature

```typescript
function checkUrlLength(encoded: string): UrlLengthCheck;
```

#### Parameters

- **`encoded`**: `string` - Encoded markdown string to check

#### Return Value

```typescript
interface UrlLengthCheck {
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

#### Constants

- **`MAX_URL_LENGTH`**: `2048` (conservative for broad browser compatibility)

#### Example

```typescript
import { checkUrlLength } from 'src/utils/urlEncoder';

const check = checkUrlLength(encodedString);

if (check.exceedsLimit) {
  console.warn(
    `URL length ${check.actualLength} exceeds limit ${check.maxLength} ` +
      `(${check.percentUsed.toFixed(0)}% used)`,
  );
}
```

---

### `roundTripTest`

Utility for testing encode/decode fidelity (primarily for tests).

#### Signature

```typescript
function roundTripTest(markdown: string): boolean;
```

#### Parameters

- **`markdown`**: `string` - Markdown to test

#### Return Value

- **`boolean`**: `true` if `decode(encode(markdown)) === markdown`, `false` otherwise

#### Purpose

Verify that encoding and decoding preserves content exactly (100% fidelity).

#### Example

```typescript
import { roundTripTest } from 'src/utils/urlEncoder';

const testCases = [
  '# Simple',
  'Unicode: 你好 🎉',
  'Special: <>&"\'',
  'Whitespace:\n\n\t  ',
];

testCases.forEach((test) => {
  expect(roundTripTest(test)).toBe(true);
});
```

## Type Definitions

### Core Types

```typescript
/**
 * Result of encoding operation
 */
export type EncodeResult =
  | { success: true; encoded: string; compressedLength: number }
  | { success: false; error: Error };

/**
 * Result of decoding operation
 */
export type DecodeResult =
  | { success: true; decoded: string }
  | { success: false; error: Error };

/**
 * URL length validation result
 */
export interface UrlLengthCheck {
  exceedsLimit: boolean;
  actualLength: number;
  maxLength: number;
  percentUsed: number;
}
```

### Constants

```typescript
/** Maximum URL length before warning (conservative) */
export const MAX_URL_LENGTH = 2048;

/** Performance target for encode/decode operations (ms) */
export const PERFORMANCE_TARGET_MS = 100;
```

## Error Handling

### Encode Errors

**Rare** - LZ-string compression rarely fails

- **Cause**: Out of memory (extremely large input)
- **Behavior**: Return `{ success: false, error }` result
- **Recovery**: Caller should handle gracefully (e.g., show error message)

### Decode Errors

**Common** - Invalid or corrupt URL data

- **Cause**: Malformed encoded string, manual URL editing, truncation
- **Behavior**: Return `{ success: false, error }` result
- **Recovery**: Caller should use default markdown (silent fallback)

### No Exceptions Thrown

All functions use Result types instead of throwing exceptions. This ensures:

- ✅ Explicit error handling at call site
- ✅ Type-safe error checking
- ✅ No unexpected crashes

## Performance Guarantees

### Encode Performance

| Input Size | Target | Typical |
| ---------- | ------ | ------- |
| 1KB        | <100ms | ~5ms    |
| 5KB        | <100ms | ~20ms   |
| 10KB       | <100ms | ~40ms   |
| 20KB       | <100ms | ~80ms   |

### Decode Performance

| Input Size | Target | Typical |
| ---------- | ------ | ------- |
| 1KB        | <100ms | ~3ms    |
| 5KB        | <100ms | ~15ms   |
| 10KB       | <100ms | ~30ms   |
| 20KB       | <100ms | ~60ms   |

### Memory Usage

- **Encode**: O(n) where n = input length
- **Decode**: O(n) where n = output length
- **No Leaks**: All memory released after function returns

## Fidelity Guarantee

**100% Round-Trip Fidelity**

For all valid markdown strings:

```typescript
decode(encode(markdown)) === markdown;
```

This includes:

- ✅ Unicode characters (emoji, CJK, etc.)
- ✅ Special characters (`<>&"'`)
- ✅ Whitespace (spaces, tabs, newlines)
- ✅ Empty strings
- ✅ Very long strings

## Usage Examples

### Basic Encode/Decode

```typescript
import { encodeMarkdown, decodeMarkdown } from 'src/utils/urlEncoder';

// Encode
const encodeResult = encodeMarkdown('# Hello World');
if (encodeResult.success) {
  const encoded = encodeResult.encoded;

  // Decode
  const decodeResult = decodeMarkdown(encoded);
  if (decodeResult.success) {
    console.log(decodeResult.decoded); // "# Hello World"
  }
}
```

### With Length Checking

```typescript
import { encodeMarkdown, checkUrlLength } from 'src/utils/urlEncoder';

const result = encodeMarkdown(longMarkdown);

if (result.success) {
  const check = checkUrlLength(result.encoded);

  if (check.exceedsLimit) {
    console.warn(`URL too long: ${check.percentUsed}% of limit`);
  }

  // Use encoded string anyway (browser will enforce limits)
  updateUrl(result.encoded);
}
```

### Error Handling

```typescript
import { decodeMarkdown } from 'src/utils/urlEncoder';

const params = new URLSearchParams(window.location.search);
const encoded = params.get('md');

if (encoded) {
  const result = decodeMarkdown(encoded);

  if (result.success) {
    setMarkdown(result.decoded);
  } else {
    // Silent fallback to default
    setMarkdown(DEFAULT_MARKDOWN);
  }
} else {
  setMarkdown(DEFAULT_MARKDOWN);
}
```

## Testing Contract

### Required Tests

```typescript
describe('urlEncoder', () => {
  describe('encodeMarkdown', () => {
    it('should encode markdown to URL-safe string', () => {});
    it('should handle empty string', () => {});
    it('should handle Unicode characters', () => {});
    it('should handle special characters', () => {});
    it('should complete in under 100ms', () => {});
  });

  describe('decodeMarkdown', () => {
    it('should decode encoded markdown', () => {});
    it('should return error for invalid input', () => {});
    it('should handle corrupt data gracefully', () => {});
    it('should complete in under 100ms', () => {});
  });

  describe('round-trip fidelity', () => {
    it('should preserve all characters', () => {});
    it('should preserve whitespace', () => {});
    it('should preserve Unicode', () => {});
    it('should preserve empty string', () => {});
  });

  describe('checkUrlLength', () => {
    it('should detect when length exceeds limit', () => {});
    it('should calculate percentage correctly', () => {});
  });
});
```

## Dependencies

- **lz-string**: ^1.5.0
  - `compressToEncodedURIComponent()`
  - `decompressFromEncodedURIComponent()`

## Breaking Changes

Changes that would break this contract:

- ❌ Changing function names
- ❌ Changing return types (Result shape)
- ❌ Changing compression algorithm (breaks existing URLs)
- ❌ Throwing exceptions instead of returning Results

## Non-Breaking Changes

Changes that preserve this contract:

- ✅ Performance optimizations
- ✅ Additional utility functions
- ✅ Internal implementation changes
- ✅ Better error messages

## Version History

- **v1.0.0** (002-querystring-persistence): Initial implementation
