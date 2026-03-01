# Component Interface Contracts

**Date**: 2026-03-01 | **Feature**: 001-markdown-editor-preview

## Overview

This document defines the public interface contracts for components exposed by the markdown editor feature. These contracts ensure consistent behavior and clear separation of concerns.

---

## Component Contracts

### Editor Component

**File**: `src/components/Editor/Editor.tsx`

**Purpose**: Provides a text input area for users to type and edit markdown content.

**Public Interface**:

```typescript
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (position: {
    line: number;
    column: number;
    offset: number;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Behavioral Contract**:

1. **OnChange**: MUST fire on every keystroke that modifies content
2. **OnCursorChange**: MUST fire when cursor position changes (optional)
3. **Placeholder**: MUST display when value is empty string
4. **Disabled**: When true, user cannot interact with editor
5. **Value**: Controlled component—parent controls content

**Accessibility Contract**:

- MUST have `aria-label="Markdown editor"`
- MUST support keyboard navigation (tab, arrow keys, home/end)
- MUST have visible focus indicator
- MUST announce placeholder to screen readers

**Performance Contract**:

- MUST handle 10,000+ characters without perceptible input lag (<16ms)
- MUST NOT re-render on parent updates if value unchanged

---

### Preview Component

**File**: `src/components/Preview/Preview.tsx`

**Purpose**: Renders markdown content as sanitized HTML.

**Public Interface**:

```typescript
interface PreviewProps {
  markdown: string;
  options?: Partial<{
    gfm: boolean;
    breaks: boolean;
    sanitize: boolean;
    emptyPlaceholder: string;
  }>;
  ariaLabel?: string;
}
```

**Behavioral Contract**:

1. **Rendering**: MUST parse and render markdown on every prop change
2. **Sanitization**: MUST sanitize HTML to prevent XSS
3. **Empty State**: MUST show placeholder when markdown is empty
4. **Updates**: MUST update within 100ms of markdown change (SC-001)

**Accessibility Contract**:

- MUST have `role="region"`
- MUST have `aria-label` (default: "Markdown preview")
- SHOULD use `aria-live="polite"` for dynamic content updates

**Security Contract**:

- MUST NOT execute or render user-provided HTML tags
- MUST escape all HTML entities in output
- MUST sanitize markdown output with DOMPurify

---

### Layout Component

**File**: `src/components/Layout/Layout.tsx\*\*

**Purpose**: Manages responsive layout for editor and preview panes.

**Public Interface**:

```typescript
interface LayoutProps {
  children: React.ReactNode;
  mode: 'split' | 'editor-only' | 'preview-only';
  onToggleView?: () => void;
}
```

**Behavioral Contract**:

1. **Split Mode**: MUST display children side-by-side (50/50 width, 100vh height)
2. **Editor-Only Mode**: MUST show only first child (editor)
3. **Preview-Only Mode**: MUST show only second child (preview)
4. **Toggle**: MUST call onToggleView when toggle button clicked (mobile)
5. **Scrolling**: Each pane MUST scroll independently

**Responsive Contract**:

- Desktop (≥768px): Default to 'split' mode
- Mobile (<768px): Default to 'editor-only' mode with toggle control

**Accessibility Contract**:

- Toggle button MUST have `aria-label` indicating current view
- Toggle button MUST have `aria-pressed` state

---

## Custom Hook Contract

### useMarkdown

**File**: `src/hooks/useMarkdown.ts`

**Purpose**: Handles markdown parsing with memoization.

**Public Interface**:

```typescript
interface UseMarkdownReturn {
  html: string;
  isEmpty: boolean;
  parse: (markdown: string) => string;
  options: PreviewOptions;
  setOptions: (options: Partial<PreviewOptions>) => void;
}

function useMarkdown(options?: Partial<PreviewOptions>): UseMarkdownReturn;
```

**Behavioral Contract**:

1. **Memoization**: MUST memoize HTML output to prevent re-parsing
2. **Updates**: MUST re-parse only when markdown input changes
3. **Options**: MUST apply options to parser configuration

**Performance Contract**:

- Parse time MUST be <16ms for 10,000 character input
- MUST NOT cause layout shifts on update

---

## Integration Points

### Parent Component (App)

The App component integrates all sub-components:

```typescript
function App() {
  const [markdown, setMarkdown] = useState('');
  const { html } = useMarkdown();
  const [mode, setMode] = useState<LayoutMode>('split');

  return (
    <Layout mode={mode} onToggleView={() => setMode(mode === 'editor-only' ? 'preview-only' : 'editor-only')}>
      <Editor value={markdown} onChange={setMarkdown} />
      <Preview markdown={html} />
    </Layout>
  );
}
```

**Data Flow**:

```
User Input → Editor.onChange → App.setState → useMarkdown.parse → Preview.render
```

---

## Testing Contracts

### Unit Test Requirements

Each component MUST have tests for:

**Editor**:

- [ ] Renders with provided value
- [ ] Calls onChange on user input
- [ ] Displays placeholder when empty
- [ ] Respects disabled prop
- [ ] Keyboard navigation works

**Preview**:

- [ ] Renders markdown as HTML
- [ ] Sanitizes dangerous HTML
- [ ] Shows placeholder when empty
- [ ] Updates on markdown prop change

**Layout**:

- [ ] Displays split view correctly
- [ ] Toggles between editor/preview on mobile
- [ ] Independent scrolling for each pane

**useMarkdown**:

- [ ] Returns parsed HTML
- [ ] Memoizes results
- [ ] Respects options

---

## Version History

| Version | Date       | Changes                                       |
| ------- | ---------- | --------------------------------------------- |
| 1.0.0   | 2026-03-01 | Initial contracts for markdown editor feature |
