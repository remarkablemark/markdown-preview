# Research: Markdown Editor and Preview

**Date**: 2026-03-01 | **Feature**: 001-markdown-editor-preview

## Research Questions & Decisions

### 1. Markdown Parser Library Selection

**Question**: Which established open-source markdown parser should be used for rendering?

**Decision**: Use **marked** (v15+)

**Rationale**:

- **Performance**: marked is one of the fastest markdown parsers for JavaScript, crucial for live preview with <16ms frame time requirement
- **Maturity**: Actively maintained since 2011, stable API, 10k+ GitHub stars
- **Simplicity**: Zero dependencies, small bundle size (~35KB gzipped)
- **TypeScript support**: Ships with TypeScript definitions
- **Security**: Built-in sanitizer options to prevent XSS from user content
- **GFM support**: Full GitHub Flavored Markdown support (headers, bold, italic, lists, links, code blocks)
- **Customization**: Extension system available if advanced features needed later

**Alternatives Considered**:

| Library         | Pros                                      | Cons                                                   | Why Not Selected                               |
| --------------- | ----------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| **markdown-it** | Highly extensible, plugin ecosystem, fast | Larger bundle size, more complex API                   | Overkill for simple use case (YAGNI)           |
| **remark**      | Modular, unified ecosystem, powerful      | Requires plugins for basic GFM, steeper learning curve | More configuration needed, larger total bundle |
| **showdown**    | Easy to use, good extensions              | Slower than marked, less active maintenance            | Performance concerns for live preview          |

**Implementation Notes**:

- Import: `import { marked } from 'marked'`
- Configure with `{ gfm: true, breaks: false }` for standard behavior
- For HTML sanitization (FR-010), consider `dompurify` if marked's renderer doesn't sufficiently sanitize
- Parse markdown synchronously for immediate preview updates

---

### 2. Editor Component Implementation

**Question**: What type of text input element should be used for the markdown editor?

**Decision**: Use **controlled `<textarea>` element** with React state

**Rationale**:

- **Simplicity**: Native HTML element, no external dependencies
- **Performance**: React 19's batching and compiler optimizations handle re-renders efficiently
- **Control**: Full control over value, selection, and keyboard events
- **Accessibility**: Native keyboard navigation, screen reader support built-in
- **Styling**: Easy to style with Tailwind CSS for custom appearance

**Alternatives Considered**:

| Library                 | Pros                                        | Cons                                               | Why Not Selected                               |
| ----------------------- | ------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| **CodeMirror**          | Syntax highlighting, line numbers, powerful | Large bundle (~200KB), overkill for markdown       | Violates YAGNI—no syntax highlighting required |
| **Monaco Editor**       | VS Code experience, rich features           | Very large bundle (~2MB), complex setup            | Massive overkill for simple markdown editing   |
| **contenteditable div** | Rich formatting possible                    | Complex cursor management, browser inconsistencies | Unnecessary complexity when textarea suffices  |

**Implementation Notes**:

- Use `React.ChangeEvent<HTMLTextAreaElement>` for typing events
- Store markdown content in component state
- Debounce not needed if marked performance is sufficient (test with 10k+ chars)
- Placeholder text for empty state (FR-008)

---

### 3. Layout Strategy for Responsive Design

**Question**: How to implement split-screen layout that adapts from desktop to mobile?

**Decision**: Use **CSS Flexbox with media queries** for responsive layout

**Rationale**:

- **Simplicity**: Native CSS, no layout libraries needed
- **Performance**: Hardware-accelerated, no JavaScript layout calculations
- **Flexibility**: Easy to switch between row (desktop) and column/toggle (mobile) layouts
- **Viewport units**: Use `vh` and `vw` for full viewport coverage

**Implementation Approach**:

```css
/* Desktop: side-by-side */
.layout-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.editor-pane,
.preview-pane {
  flex: 1;
  overflow: auto; /* Independent scrolling */
}

/* Mobile: toggle visibility */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }

  .editor-pane.hidden,
  .preview-pane.hidden {
    display: none;
  }
}
```

**Alternatives Considered**:

| Approach                       | Pros                     | Cons                                   | Why Not Selected                                |
| ------------------------------ | ------------------------ | -------------------------------------- | ----------------------------------------------- |
| **CSS Grid**                   | Powerful layout system   | Slightly more complex for simple split | Flexbox sufficient for 50/50 split              |
| **Tailwind container queries** | Modern, component-scoped | Less browser support                   | Standard media queries work fine                |
| **JavaScript resize observer** | Dynamic control          | Adds complexity, performance overhead  | CSS media queries are declarative and efficient |

---

### 4. State Management Strategy

**Question**: How to manage editor state and preview synchronization?

**Decision**: Use **local component state with React useState** (no external state management)

**Rationale**:

- **Simplicity**: Single source of truth in Editor component
- **Performance**: React 19 automatic batching handles rapid updates efficiently
- **Scope**: No need for global state—markdown content is local to this feature
- **YAGNI**: Redux/Zustand would add unnecessary complexity

**Implementation Pattern**:

```typescript
const [markdown, setMarkdown] = useState<string>('');
const html = useMemo(() => marked.parse(markdown), [markdown]);
```

**Performance Considerations**:

- If typing lag detected with 10k+ chars, consider:
  - `useDeferredValue` for preview updates
  - Web Worker for markdown parsing (last resort)
  - Throttling preview updates to 16ms intervals

---

### 5. HTML Sanitization (Security)

**Question**: How to handle pasted HTML content safely (FR-010)?

**Decision**: Treat pasted HTML as **plain text** + use **DOMPurify** for rendered output

**Rationale**:

- **FR-010 compliance**: Pasted HTML must not execute or render as HTML
- **Security**: Prevent XSS attacks if user somehow injects malicious content
- **Defense in depth**: Even though marked has some sanitization, DOMPurify adds extra layer

**Implementation**:

```typescript
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked.parse(markdown));
```

**Note**: For paste handling, textarea naturally treats input as plain text. No special paste handler needed unless rich text paste support is added later.

---

## Dependencies Summary

Based on research, the following dependencies should be added:

```json
{
  "dependencies": {
    "marked": "^15.0.0",
    "dompurify": "^3.0.0"
  }
}
```

**Installation**: `npm install marked dompurify`

---

## Performance Benchmarks (Reference)

| Library     | Parse Time (10k chars) | Bundle Size                  |
| ----------- | ---------------------- | ---------------------------- |
| marked      | ~5-10ms                | ~35KB gzipped                |
| markdown-it | ~10-15ms               | ~50KB gzipped                |
| remark      | ~15-20ms               | ~60KB gzipped (with plugins) |

**Target**: <16ms frame time = 60fps. Marked comfortably meets this goal.

---

## Accessibility Considerations

- **Editor**: Use `<textarea>` with `aria-label="Markdown editor"`
- **Preview**: Use `role="region"` with `aria-label="Markdown preview"`
- **Keyboard**: Tab navigation between editor and preview (if focusable)
- **Live Region**: Consider `aria-live="polite"` for preview updates (test with screen readers)

---

## References

- [marked GitHub](https://github.com/markedjs/marked)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [React 19 Performance](https://react.dev/blog/2024/04/25/react-19)
- [MDN: Textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)
