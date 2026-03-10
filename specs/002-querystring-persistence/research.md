# Research: Querystring Persistence

**Feature**: Querystring Persistence  
**Branch**: `002-querystring-persistence`  
**Date**: 2026-03-10

## Overview

This document consolidates technical research and decisions for implementing URL-based markdown persistence. All decisions were validated during the specification clarification phase.

## Technical Decisions

### 1. Compression Library: LZ-string

**Decision**: Use `lz-string` library for JavaScript string compression

**Rationale**:

- **URL-safe output**: Provides `compressToEncodedURIComponent()` method specifically designed for URL encoding
- **Client-side focus**: Pure JavaScript implementation with no server dependencies
- **Proven performance**: Widely used in browser-based applications for URL compression
- **Small footprint**: Minimal bundle size impact (~3KB gzipped)
- **Browser compatibility**: Works across all modern browsers without polyfills

**Alternatives Considered**:

- **pako (zlib)**: Larger bundle size, designed for binary data rather than strings
- **Native browser compression**: Not available in all browsers, requires async API
- **Base64 encoding only**: No compression, would hit URL length limits quickly
- **Custom compression**: Unnecessary complexity, reinventing the wheel

**Implementation Notes**:

```typescript
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

// Encode markdown to URL-safe string
const encoded = compressToEncodedURIComponent(markdownText);

// Decode URL parameter back to markdown
const decoded = decompressFromEncodedURIComponent(urlParam);
```

### 2. URL Parameter Name: `md`

**Decision**: Use `md` as the querystring parameter name

**Rationale**:

- **Semantic clarity**: Immediately recognizable as "markdown"
- **Brevity**: Minimizes URL length overhead (every character counts)
- **Convention**: Follows common practice of short, meaningful parameter names
- **No conflicts**: Unlikely to collide with other querystring parameters

**Alternatives Considered**:

- **`markdown`**: Too verbose, wastes URL space
- **`content`**: Too generic, could conflict with other uses
- **`text`**: Not specific enough to indicate markdown format
- **`m`**: Too cryptic, reduces readability

### 3. Debounce Delay: 500ms

**Decision**: Debounce URL updates with 500ms delay

**Rationale**:

- **Performance balance**: Prevents excessive browser history API calls while typing
- **Responsiveness**: Short enough that users perceive near-instant updates
- **Battery efficiency**: Reduces CPU/battery usage on mobile devices
- **Network consideration**: Although no network calls, reduces DOM manipulation overhead

**Alternatives Considered**:

- **No debounce**: Would cause performance issues, excessive URL updates
- **250ms**: Too aggressive, still causes many updates during fast typing
- **1000ms**: Too slow, users might copy URL before update completes
- **Leading edge debounce**: Would update immediately then block, poor UX for continuous typing

**Implementation Notes**:

```typescript
// Use setTimeout-based debounce in custom hook
const debouncedUpdateUrl = useMemo(
  () => debounce((content: string) => updateUrl(content), 500),
  [],
);
```

### 4. URL Length Limit Handling: Log Warning and Continue

**Decision**: When compressed content exceeds URL length limits, log `console.warn()` and continue updating URL

**Rationale**:

- **Non-blocking UX**: Users can continue editing without interruption
- **Developer visibility**: Console warning alerts developers to potential issues
- **Graceful degradation**: URL still updates, may work in browsers with higher limits
- **No data loss**: Content remains in editor, only URL sharing is affected

**Alternatives Considered**:

- **Block updates**: Would freeze URL at arbitrary point, confusing UX
- **Show error modal**: Too disruptive for edge case scenario
- **Truncate content**: Would corrupt markdown, cause data loss
- **Silent failure**: No visibility into the issue for debugging

**Implementation Notes**:

```typescript
const MAX_URL_LENGTH = 2048; // Conservative limit for broad compatibility

if (encodedContent.length > MAX_URL_LENGTH) {
  console.warn(
    `Encoded markdown exceeds URL length limit (${encodedContent.length} > ${MAX_URL_LENGTH}). ` +
      'URL may not work in all browsers.',
  );
}
// Continue with URL update regardless
```

### 5. Performance Target: <100ms for Encode/Decode

**Decision**: Encode and decode operations must complete in under 100ms

**Rationale**:

- **Imperceptible delay**: 100ms is below human perception threshold for instant feedback
- **Responsive UX**: Ensures page load and URL updates feel instantaneous
- **Realistic target**: LZ-string compression is fast enough to meet this consistently
- **Measurable**: Can be verified with performance tests

**Alternatives Considered**:

- **<50ms**: Too aggressive, may fail on slower devices or large content
- **<200ms**: Noticeable delay, degrades perceived performance
- **No target**: Would allow performance regressions to slip through

**Verification Strategy**:

```typescript
// Performance test in Vitest
it('should encode markdown in under 100ms', () => {
  const largeMarkdown = generateLargeMarkdown(5000); // 5KB content
  const start = performance.now();
  const encoded = encodeMarkdown(largeMarkdown);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});
```

### 6. Empty/Corrupt Querystring Handling: Default Placeholder

**Decision**: Show default markdown placeholder with example syntax when querystring is empty or corrupt

**Rationale**:

- **Onboarding**: New users see example markdown demonstrating features
- **Error recovery**: Graceful fallback for corrupt data without error messages
- **Consistency**: Same behavior for empty and corrupt states
- **Educational**: Placeholder teaches markdown syntax

**Alternatives Considered**:

- **Empty editor**: Poor first-run experience, no guidance for users
- **Error message**: Disruptive, makes corrupt URLs feel like failures
- **Last known content**: Requires localStorage, adds complexity
- **Prompt user**: Interrupts workflow, unnecessary for recoverable situation

**Implementation Notes**:

```typescript
const DEFAULT_MARKDOWN = `# Welcome to Markdown Preview

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

### 7. Manual URL Edit Handling: Ignore After Initial Load

**Decision**: Only load markdown from querystring on initial page load; ignore manual URL edits

**Rationale**:

- **Predictable behavior**: Users expect editor content to persist during session
- **Prevents data loss**: Manual URL edits won't overwrite unsaved work
- **Simpler implementation**: No need to watch for URL changes after mount
- **Common pattern**: Matches behavior of most web applications

**Alternatives Considered**:

- **Continuous sync**: Would cause unexpected content changes, data loss risk
- **Prompt on manual edit**: Too disruptive, complex to detect intent
- **Merge changes**: Overly complex, unclear merge semantics

**Implementation Notes**:

```typescript
// In useUrlPersistence hook
useEffect(() => {
  // Load from URL only once on mount
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('md');
  if (encoded) {
    const decoded = decodeMarkdown(encoded);
    if (decoded) {
      setMarkdown(decoded);
    }
  }
}, []); // Empty deps array = run once on mount
```

### 8. Browser History API: replaceState vs pushState

**Decision**: Use `history.replaceState()` instead of `history.pushState()`

**Rationale**:

- **No history pollution**: Avoids creating browser history entry for each edit
- **Better UX**: Back button returns to previous page, not previous edit state
- **Performance**: Doesn't grow browser history with hundreds of entries
- **Standard pattern**: Common approach for auto-save/sync features

**Alternatives Considered**:

- **pushState**: Would create unusable history, back button becomes useless
- **No history API**: Would cause full page reload on URL change
- **Hybrid approach**: Unnecessary complexity for this use case

**Implementation Notes**:

```typescript
// Update URL without adding history entry
const updateUrl = (content: string) => {
  const encoded = encodeMarkdown(content);
  const url = new URL(window.location.href);
  url.searchParams.set('md', encoded);
  window.history.replaceState(null, '', url.toString());
};
```

## Dependencies

### Required NPM Packages

| Package   | Version | Purpose                             | Bundle Impact |
| --------- | ------- | ----------------------------------- | ------------- |
| lz-string | ^1.5.0  | String compression for URL encoding | ~3KB gzipped  |

### Browser APIs

| API                        | Purpose                           | Compatibility       |
| -------------------------- | --------------------------------- | ------------------- |
| URLSearchParams            | Parse and construct querystring   | All modern browsers |
| History API (replaceState) | Update URL without page reload    | All modern browsers |
| performance.now()          | Performance measurement for tests | All modern browsers |

## Testing Strategy

### Unit Tests

- Encode/decode round-trip fidelity (100% data preservation)
- Special character handling (Unicode, emojis, markdown syntax)
- Performance benchmarks (<100ms target)
- Edge cases (empty string, very large content, malformed data)

### Integration Tests

- URL updates on content change with debounce
- Initial load from querystring parameter
- Fallback to default placeholder
- Console warning on URL length exceeded

### E2E Tests

- Share URL workflow (copy URL, open in new tab, verify content)
- Browser back/forward navigation
- Page reload preserves content

## Security Considerations

### XSS Prevention

- **Risk**: Malicious URLs could inject scripts via markdown content
- **Mitigation**: Already handled by existing markdown sanitization (DOMPurify)
- **Verification**: Test with XSS payloads in querystring

### URL Length Attacks

- **Risk**: Extremely long URLs could cause browser issues
- **Mitigation**: Console warning at 2048 chars, browser enforces hard limits
- **Impact**: Minimal - browser will truncate or reject, no server impact

### Data Privacy

- **Risk**: Markdown content visible in URL (browser history, server logs, referrer headers)
- **Mitigation**: Document in user-facing help text, no sensitive data should be stored
- **Note**: This is inherent to URL-based persistence, not a bug

## Performance Benchmarks

### Expected Performance (based on LZ-string benchmarks)

| Content Size | Encode Time | Decode Time | Compressed Size |
| ------------ | ----------- | ----------- | --------------- |
| 1KB          | ~5ms        | ~3ms        | ~600 bytes      |
| 5KB          | ~20ms       | ~15ms       | ~2.5KB          |
| 10KB         | ~40ms       | ~30ms       | ~4.5KB          |
| 20KB         | ~80ms       | ~60ms       | ~8KB            |

**Note**: All times well under 100ms target. URL length limit (~2KB) typically reached before performance becomes concern.

## Open Questions

None - all technical decisions resolved during specification clarification phase.

## References

- [LZ-string GitHub](https://github.com/pieroxy/lz-string)
- [MDN: History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [URL Length Limits](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)
