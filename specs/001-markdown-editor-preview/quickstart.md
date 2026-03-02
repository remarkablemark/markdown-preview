# Quickstart: Markdown Editor and Preview

**Date**: 2026-03-01 | **Feature**: 001-markdown-editor-preview

## Overview

This quickstart guide helps developers get up and running with the markdown editor feature quickly. Follow these steps to install dependencies, run the development server, and verify the implementation.

---

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- npm (bundled with Node.js)
- Git

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:

- **marked**: Markdown parser for rendering
- **dompurify**: HTML sanitization for security
- Plus all existing project dependencies

### 2. Verify Installation

```bash
npm run lint:tsc
```

Should complete with no errors.

---

## Development

### Start Dev Server

```bash
npm start
```

- Opens browser at `http://127.0.0.1:5173`
- Hot module replacement enabled
- Console shows build status

### Run Tests

```bash
npm test
```

Or watch mode:

```bash
npm run test:watch
```

### Type Check

```bash
npm run lint:tsc
```

---

## File Structure

```
src/
├── components/
│   ├── Editor/          # Markdown editor component
│   ├── Preview/         # Markdown preview component
│   └── Layout/          # Responsive layout component
├── hooks/
│   └── useMarkdown.ts   # Markdown parsing hook
├── types/
│   └── markdown.ts      # TypeScript types
└── main.tsx             # App entry point
```

---

## Usage Examples

### Basic Usage

```typescript
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { useMarkdown } from '@/hooks/useMarkdown';

function MyComponent() {
  const [markdown, setMarkdown] = useState('# Hello World');
  const { html } = useMarkdown();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Editor value={markdown} onChange={setMarkdown} />
      <Preview markdown={html} />
    </div>
  );
}
```

### With Custom Options

```typescript
const { html, setOptions } = useMarkdown({
  gfm: true,
  breaks: true,
  sanitize: true,
});
```

### Mobile Toggle

```typescript
const [mode, setMode] = useState<LayoutMode>('editor-only');

<button onClick={() => setMode(mode === 'editor-only' ? 'preview-only' : 'editor-only')}>
  {mode === 'editor-only' ? 'Show Preview' : 'Show Editor'}
</button>
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:ci
```

Coverage report in `coverage/` directory.

### Test Individual Components

```bash
npm test -- Editor.test.tsx
npm test -- Preview.test.tsx
npm test -- Layout.test.tsx
```

---

## Common Tasks

### Add New Markdown Syntax Support

1. Update `src/hooks/useMarkdown.ts` parser options
2. Add test case for new syntax
3. Update `contracts/component-contracts.md` if behavior changes

### Change Layout Breakpoint

1. Update `mobileBreakpoint` in `ViewportConfiguration`
2. Update CSS media query in `Layout.tsx`
3. Test on various screen sizes

### Customize Empty State Placeholder

```typescript
<Editor
  value={markdown}
  onChange={setMarkdown}
  placeholder="# Start Writing\n\nType your markdown here..."
/>
```

---

## Troubleshooting

### Preview Not Updating

**Symptom**: Editor changes but preview stays static

**Check**:

1. Is `onChange` callback updating state?
2. Is `useMarkdown` hook receiving updated value?
3. Check browser console for errors

**Fix**: Ensure state flow: `Editor → onChange → setState → Preview`

### Layout Not Splitting

**Symptom**: Editor and preview stacked vertically on desktop

**Check**:

1. Viewport width >= 768px?
2. CSS flexbox applied correctly?
3. No inline styles overriding?

**Fix**: Inspect element and verify `flex-direction: row` on container

### TypeScript Errors

**Symptom**: Type errors in components

**Check**:

1. Run `npm run lint:tsc` for full error list
2. Verify all props match interface definitions
3. Check event types are correct

**Fix**: Update types in `src/types/markdown.ts`

---

## Performance Tips

### Optimize Large Documents

If typing lag occurs with 10,000+ characters:

```typescript
// Use deferred updates for preview
const deferredMarkdown = useDeferredValue(markdown);
const { html } = useMarkdown(deferredMarkdown);
```

### Reduce Re-renders

```typescript
// Memoize callback functions
const handleChange = useCallback((value: string) => {
  setMarkdown(value);
}, []);
```

---

## Accessibility Checklist

Before merging:

- [ ] Editor has `aria-label`
- [ ] Preview has `role="region"` and `aria-label`
- [ ] Toggle button has `aria-pressed`
- [ ] Keyboard navigation works (Tab, arrows)
- [ ] Focus indicators visible
- [ ] Screen reader test passed

---

## Next Steps

1. Review `data-model.md` for type definitions
2. Review `contracts/component-contracts.md` for interface specs
3. Review `research.md` for implementation decisions
4. Start implementing with TDD approach

---

## Resources

- [Spec](./spec.md) - Full feature specification
- [Research](./research.md) - Technical research and decisions
- [Data Model](./data-model.md) - TypeScript interfaces
- [Contracts](./contracts/component-contracts.md) - Component interfaces
