# Data Model: Markdown Editor and Preview

**Date**: 2026-03-01 | **Feature**: 001-markdown-editor-preview

## Overview

This document defines the TypeScript interfaces and types for the markdown editor feature. The data model is minimal since the feature operates entirely in-memory without persistence.

---

## Core Types

### LayoutMode

Defines the layout mode based on available screen width.

```typescript
type LayoutMode = 'split' | 'editor-only' | 'preview-only';
```

**Derived Values**:

- `mode = viewportWidth >= mobileBreakpoint ? 'split' : 'editor-only'`
- Editor pane width: `mode === 'split' ? '50%' : '100%'`
- Preview pane width: `mode === 'split' ? '50%' : '100%'`

---

### PreviewOptions

Configuration for markdown rendering.

```typescript
interface PreviewOptions {
  /** Enable GitHub Flavored Markdown */
  gfm: boolean;
  /** Convert line breaks to <br> */
  breaks: boolean;
  /** Sanitize HTML output */
  sanitize: boolean;
  /** Placeholder HTML when content is empty */
  emptyPlaceholder: string;
}
```

**Default Configuration**:

```typescript
const DEFAULT_PREVIEW_OPTIONS: PreviewOptions = {
  gfm: true,
  breaks: false,
  sanitize: true,
  emptyPlaceholder:
    '<p class="text-gray-400 italic">Start typing markdown...</p>',
};
```

---

## Component Props

### EditorProps

```typescript
interface EditorProps {
  /** Current markdown content */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
}
```

---

### PreviewProps

```typescript
interface PreviewProps {
  /** Markdown content to render */
  markdown: string;
  /** Rendering options */
  options?: Partial<PreviewOptions>;
  /** Aria label for accessibility */
  ariaLabel?: string;
}
```

---

### LayoutProps

```typescript
interface LayoutProps {
  /** Editor and Preview components */
  children: React.ReactNode;
  /** Current layout mode */
  mode: LayoutMode;
  /** Callback to toggle view mode (mobile) */
  onToggleView?: () => void;
}
```

---

## Event Types

### Editor Events

```typescript
type EditorChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
```

### Layout Events

```typescript
type ViewportResizeEvent = UIEvent;
type ToggleViewEvent = React.MouseEvent<HTMLButtonElement>;
```

---

## Validation Rules

### Functional Requirement Mapping

| Requirement                 | Type/Interface                    | Validation                   |
| --------------------------- | --------------------------------- | ---------------------------- |
| FR-001 (Edit markdown)      | `EditorProps.value`               | String, non-null             |
| FR-002 (Render HTML)        | `PreviewProps.markdown`           | Sanitized HTML string        |
| FR-003 (Live preview)       | N/A                               | Updates on every keystroke   |
| FR-004 (Markdown syntax)    | `PreviewOptions.gfm`              | GFM enabled                  |
| FR-005 (Split layout)       | `LayoutProps.mode`                | 'split' when width >= 768px  |
| FR-006 (Independent scroll) | CSS (not typed)                   | `overflow: auto` on panes    |
| FR-007 (Mobile toggle)      | `LayoutProps.onToggleView`        | Callback for toggle          |
| FR-008 (Empty state)        | `PreviewOptions.emptyPlaceholder` | HTML string shown when empty |
| FR-009 (Performance)        | N/A                               | Tested with 10k+ chars       |
| FR-010 (HTML as text)       | DOMPurify sanitization            | HTML tags escaped            |

---

## Type Safety Notes

- All function parameters and return types are explicit
- No `any` types permitted
- Use `unknown` for caught errors, then narrow with type guards
- Event types use React's typed event system
- Props interfaces use `Partial<T>` for optional configuration
