# Contract: useUrlPersistence Hook

**Type**: React Custom Hook  
**Stability**: Stable  
**Since**: 002-querystring-persistence

## Purpose

Custom React hook that manages bidirectional synchronization between markdown editor content and browser URL querystring. Provides automatic URL updates with debouncing and initial content loading from URL parameters.

## Signature

```typescript
function useUrlPersistence(initialMarkdown?: string): UseUrlPersistenceReturn;
```

## Parameters

### `initialMarkdown` (optional)

- **Type**: `string`
- **Default**: `DEFAULT_MARKDOWN` constant
- **Description**: Fallback markdown content to use when URL parameter is absent or corrupt
- **Validation**: Any valid string (including empty string)

## Return Value

### `UseUrlPersistenceReturn`

```typescript
interface UseUrlPersistenceReturn {
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

#### Properties

##### `markdown`

- **Type**: `string`
- **Description**: Current markdown content in the editor
- **Reactivity**: Updates when user calls `setMarkdown()` or on initial load
- **Persistence**: Automatically synced to URL with 500ms debounce

##### `setMarkdown`

- **Type**: `(value: string) => void`
- **Description**: Update markdown content and trigger URL sync
- **Side Effects**:
  - Updates internal state immediately
  - Schedules debounced URL update (500ms delay)
  - Cancels previous pending URL update
- **Performance**: Synchronous state update, async URL sync

##### `loadedFromUrl`

- **Type**: `boolean`
- **Description**: Flag indicating whether content was loaded from URL on mount
- **Values**:
  - `true`: Content was successfully decoded from `?md=` parameter
  - `false`: Used default/initial markdown (URL absent or corrupt)
- **Stability**: Set once on mount, never changes during component lifecycle

##### `syncToUrl`

- **Type**: `() => void`
- **Description**: Manually trigger URL sync, bypassing debounce delay
- **Use Cases**:
  - Before navigation (ensure URL is current)
  - Before copying URL to clipboard
  - In response to explicit "save" button click
- **Behavior**: Flushes pending debounced update immediately

## Behavior Specification

### Initial Mount

1. Hook mounts with component
2. Reads `?md=` parameter from `window.location.search`
3. If parameter exists:
   - Attempts to decode using LZ-string
   - On success: Sets as initial markdown, `loadedFromUrl = true`
   - On failure: Uses `initialMarkdown` or `DEFAULT_MARKDOWN`, `loadedFromUrl = false`
4. If parameter absent: Uses `initialMarkdown` or `DEFAULT_MARKDOWN`, `loadedFromUrl = false`

### Content Updates

1. Consumer calls `setMarkdown(newValue)`
2. Internal state updates immediately (synchronous)
3. Debounce timer starts (500ms)
4. If `setMarkdown()` called again before timer expires:
   - Previous timer cancelled
   - New timer started
5. When timer expires:
   - Markdown encoded using LZ-string
   - Compressed length checked against `MAX_URL_LENGTH` (2048)
   - If exceeded: `console.warn()` logged
   - URL updated using `history.replaceState()`
   - No page reload occurs

### URL Synchronization

- **Method**: `window.history.replaceState()` (not `pushState`)
- **Rationale**: Avoids polluting browser history with edit states
- **Parameter**: `?md={encoded_content}`
- **Encoding**: LZ-string `compressToEncodedURIComponent()`
- **Debounce**: 500ms trailing edge
- **Performance**: Encode operation must complete in <100ms

### Manual URL Edits

- **Behavior**: Ignored after initial mount
- **Rationale**: Prevents unexpected content changes and data loss
- **Implementation**: URL only read once in mount effect (empty deps array)

## Performance Guarantees

- **Encode/Decode**: <100ms for all operations
- **State Update**: Synchronous (immediate)
- **URL Sync**: Debounced 500ms (async)
- **Memory**: O(n) where n = markdown content length

## Error Handling

### Decode Errors (Corrupt URL Data)

- **Behavior**: Silent fallback to `initialMarkdown` or `DEFAULT_MARKDOWN`
- **Logging**: No error logged (expected edge case)
- **User Impact**: None (graceful degradation)

### Encode Errors (Unlikely)

- **Behavior**: URL update skipped, content remains in editor
- **Logging**: Error logged to console
- **User Impact**: Content not shareable via URL, but not lost

### URL Length Exceeded

- **Behavior**: URL updated anyway (browser enforces hard limits)
- **Logging**: `console.warn()` with actual vs. limit lengths
- **User Impact**: URL may not work in all browsers

## Usage Examples

### Basic Usage

```typescript
import { useUrlPersistence } from 'src/hooks/useUrlPersistence';

function MarkdownEditor() {
  const { markdown, setMarkdown, loadedFromUrl } = useUrlPersistence();

  return (
    <div>
      {loadedFromUrl && <p>Loaded from shared URL</p>}
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
      />
    </div>
  );
}
```

### With Custom Initial Content

```typescript
const CUSTOM_TEMPLATE = '# My Template\n\nStart here...';

function MarkdownEditor() {
  const { markdown, setMarkdown } = useUrlPersistence(CUSTOM_TEMPLATE);

  return (
    <textarea
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
    />
  );
}
```

### Manual Sync Before Navigation

```typescript
function MarkdownEditor() {
  const { markdown, setMarkdown, syncToUrl } = useUrlPersistence();

  const handleShare = () => {
    // Ensure URL is current before copying
    syncToUrl();
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
      />
      <button onClick={handleShare}>Copy Share URL</button>
    </>
  );
}
```

### Detecting Shared Content

```typescript
function MarkdownEditor() {
  const { markdown, setMarkdown, loadedFromUrl } = useUrlPersistence();

  useEffect(() => {
    if (loadedFromUrl) {
      // Track analytics event
      analytics.track('shared_content_opened');
    }
  }, [loadedFromUrl]);

  return (
    <textarea
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
    />
  );
}
```

## Testing Contract

### Required Tests

```typescript
describe('useUrlPersistence', () => {
  it('should load markdown from URL parameter on mount', () => {
    // Test initial load from ?md= parameter
  });

  it('should use default markdown when URL parameter is absent', () => {
    // Test fallback behavior
  });

  it('should use default markdown when URL parameter is corrupt', () => {
    // Test error handling
  });

  it('should update URL when markdown changes (debounced)', () => {
    // Test debounced sync behavior
  });

  it('should cancel previous debounce on rapid changes', () => {
    // Test debounce cancellation
  });

  it('should set loadedFromUrl flag correctly', () => {
    // Test flag accuracy
  });

  it('should sync immediately when syncToUrl is called', () => {
    // Test manual sync bypass
  });

  it('should use replaceState not pushState', () => {
    // Test history API usage
  });

  it('should warn when URL length exceeds limit', () => {
    // Test console.warn() on length exceeded
  });

  it('should ignore manual URL edits after mount', () => {
    // Test that URL changes don't trigger re-loads
  });
});
```

## Dependencies

- **React**: Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **lz-string**: Compression library
- **Browser APIs**: `URLSearchParams`, `History API`

## Breaking Changes

Changes that would break this contract:

- ❌ Changing hook name
- ❌ Changing return value shape
- ❌ Removing `loadedFromUrl` or `syncToUrl`
- ❌ Changing debounce delay without migration path
- ❌ Changing URL parameter name from `md`

## Non-Breaking Changes

Changes that preserve this contract:

- ✅ Internal implementation optimizations
- ✅ Additional optional parameters
- ✅ Additional return values (extending interface)
- ✅ Performance improvements
- ✅ Bug fixes that don't change API

## Version History

- **v1.0.0** (002-querystring-persistence): Initial implementation
