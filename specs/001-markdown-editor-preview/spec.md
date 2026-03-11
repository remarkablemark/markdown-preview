# Feature Specification: Markdown Editor and Preview

**Feature Branch**: `001-markdown-editor-preview`
**Created**: 2026-03-01
**Updated**: 2026-03-01
**Status**: Done
**Input**: User description: "Markdown editor and preview"

## Implementation Notes

### Technical Decisions

- **Markdown Parser**: `marked` v17.0.3 - Fast, lightweight markdown parser with configurable options (GFM, breaks)
- **HTML Sanitization**: `DOMPurify` v3.3.1 - Prevents XSS attacks by sanitizing rendered HTML output
- **Styling**: Tailwind CSS v4.2.1 with `@tailwindcss/typography` plugin for prose styling
- **Layout**: Responsive flexbox layout with `h-screen`, `flex-col` (mobile) and `md:flex-row` (desktop)
- **State Management**: React `useState` hook for markdown content and layout mode
- **Dark Mode**: System preference detection with manual toggle; preference persisted to localStorage

### Component Architecture

```
App (root)
├── Layout (responsive container)
│   ├── Editor (textarea with controlled state)
│   └── Preview (sanitized HTML rendering)
```

### Key Implementation Details

- **Layout Classes**: Removed conflicting utility classes from `index.html` (`flex`, `min-h-screen`, `place-items-center`, `mx-auto`) to allow Layout component's full-screen flexbox layout to work correctly
- **Typography Plugin**: Added `@tailwindcss/typography` plugin to enable `prose` classes for styling raw HTML output from markdown parser
- **Responsive Breakpoint**: 768px (`md:`) for switching between stacked (mobile) and side-by-side (desktop) layouts
- **Empty State**: Placeholder text demonstrates markdown syntax (headers, bold, italic, lists, links, code)

## Clarifications

### Session 2026-03-01

- Q: What markdown renderer should be used? → A: Use established open-source markdown parser library (e.g., marked, markdown-it, remark)
- Q: How should toolbar buttons insert formatting into the editor? → A: Remove toolbar entirely, keep it simple

### Session 2026-03-01 (Mobile)

- Q: How should the editor and preview be arranged on mobile devices? → A: Toggle/Tab switch — user taps to switch between editor-only and preview-only views

### Session 2026-03-01 (Layout)

- Q: What are the exact layout dimensions for the desktop split-screen view? → A: Full viewport height, equal 50/50 width split; vertical and horizontal scrolling if content overflows

## Constitution Alignment

Verify this feature adheres to project principles:

| Principle           | Application to This Feature                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Test-First          | Unit tests for editor component behavior, preview rendering accuracy, and user interactions |
| Type Safety         | TypeScript interfaces for editor state, preview content, and configuration options          |
| Component-Driven    | Separate Editor and Preview components with clear props and responsibilities                |
| Accessibility First | Keyboard navigation, screen reader support, proper ARIA labels for editor and preview areas |
| Simplicity (YAGNI)  | Core editing and preview functionality only; toolbar and advanced features excluded         |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Write and Edit Markdown Content (Priority: P1)

As a user, I want to type and edit markdown text in an editor so that I can create formatted content.

**Why this priority**: This is the core functionality without which the application has no value. Users must be able to input and modify markdown text.

**Independent Test**: User can open the application, type markdown syntax in the editor area, make edits to existing text, and see their changes reflected immediately.

**Acceptance Scenarios**:

1. **Given** the editor is empty, **When** the user types markdown text, **Then** the text appears in the editor
2. **Given** the editor contains text, **When** the user modifies it, **Then** changes are reflected immediately
3. **Given** the user has content in the editor, **When** they select and delete text, **Then** the content is removed

---

### User Story 2 - View Live Preview of Rendered Markdown (Priority: P1)

As a user, I want to see a live preview of how my markdown renders so that I can verify the final output.

**Why this priority**: The preview is essential value proposition of the application. Users need immediate visual feedback on their markdown formatting.

**Independent Test**: User types markdown with various formatting elements (headers, bold, lists) and sees correctly rendered HTML preview that updates as they type.

**Acceptance Scenarios**:

1. **Given** the editor contains markdown, **When** the user types, **Then** the preview updates automatically to show rendered output
2. **Given** the editor has headers, lists, and formatted text, **When** rendered, **Then** the preview displays properly formatted HTML
3. **Given** the editor is cleared, **When** all content is removed, **Then** the preview shows empty state

---

### User Story 3 - Split-Screen Editor and Preview Layout (Priority: P2)

As a user, I want to see the editor and preview side-by-side so that I can write and review simultaneously.

**Why this priority**: Enhances workflow efficiency but application functions with stacked or toggle layout as alternative.

**Independent Test**: Application displays editor and preview panels visible simultaneously with appropriate sizing and scroll behavior.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** displayed on desktop, **Then** editor and preview are visible side-by-side with equal 50/50 width split taking full viewport height
2. **Given** content exceeds viewport, **When** user scrolls editor or preview, **Then** each pane scrolls independently both vertically and horizontally
3. **Given** narrow viewport (mobile), **When** application loads, **Then** user can toggle between editor-only and preview-only views via toggle button control

---

### User Story 4 - Clear Empty State Guidance (Priority: P3)

As a user, I want helpful guidance when starting with an empty editor so that I understand what to do.

**Why this priority**: Improves first-time user experience but core functionality works without onboarding text.

**Independent Test**: Empty editor displays placeholder or example markdown showing users what they can do.

**Acceptance Scenarios**:

1. **Given** the editor is empty on first load, **When** user views editor, **Then** placeholder text shows example markdown
2. **Given** placeholder is displayed, **When** user starts typing, **Then** placeholder disappears
3. **Given** user clears all content, **When** editor becomes empty, **Then** placeholder reappears

---

### User Story 5 - Dark Mode Support (Priority: P2)

As a user, I want to toggle between light and dark themes so that I can reduce eye strain in low-light environments.

**Why this priority**: Improves accessibility and user comfort during extended editing sessions.

**Independent Test**: User can toggle dark mode via button; preference persists across page reloads.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** user's system prefers dark mode, **Then** dark theme is applied automatically
2. **Given** the application is in light mode, **When** user clicks dark mode toggle, **Then** theme switches to dark mode
3. **Given** dark mode is enabled, **When** user refreshes page, **Then** dark mode persists

---

### Edge Cases

- What happens when user pastes large amounts of text (10,000+ characters)? System should handle without performance degradation.
- How does system handle malformed markdown? Renderer should gracefully display content without crashing.
- What happens when user pastes HTML content? System should treat as plain text, not render as HTML.
- How does layout behave on very narrow screens (mobile devices)? Layout should adapt responsively.
- What happens if user types extremely fast? Preview should keep up without noticeable lag.
- How does system handle malicious markdown containing script tags? System must sanitize output to prevent XSS attacks.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a text editor area where users can type and edit markdown content
- **FR-002**: System MUST render markdown content as HTML in a preview panel using an established open-source markdown parser library
- **FR-003**: System MUST update the preview automatically as the user types (live preview)
- **FR-004**: System MUST support standard markdown syntax including headers, bold, italic, lists, links, and code blocks
- **FR-005**: System MUST display editor and preview simultaneously in a split-screen layout on desktop viewports (≥768px) with equal 50/50 width split and full viewport height; layout must display correctly on viewports from 320px to 1920px width without horizontal page scrolling
- **FR-006**: System MUST provide independent vertical and horizontal scrolling for each pane when content overflows
- **FR-007**: System MUST provide a toggle/switch control to switch between editor-only and preview-only views on mobile viewports
- **FR-008**: System MUST display placeholder or example content when editor is empty on initial load. Example MUST demonstrate: headers (# H1, ## H2), **bold**, _italic_, - lists, [links](url), and `code blocks`
- **FR-009**: System MUST handle large documents (minimum 10,000 characters) with no perceptible input lag (under 16ms frame time per SC-004)
- **FR-010**: System MUST treat pasted HTML as plain text, not execute or render it
- **FR-011**: System MUST sanitize rendered HTML output to prevent XSS attacks using DOMPurify or equivalent library
- **FR-012**: System MUST provide a dark mode toggle button in the header accessible at all viewport sizes
- **FR-013**: System MUST detect and respect user's system color scheme preference on initial load
- **FR-014**: System MUST persist user's theme preference to localStorage and restore on subsequent visits
- **FR-015**: System MUST apply appropriate dark mode styling to editor background, text colors, preview background, and UI elements

### Key Entities _(include if feature involves data)_

- **Document**: The markdown content being edited, consisting of raw markdown text and its rendered HTML representation

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can see preview updates within 100 milliseconds of typing any character
- **SC-002**: Users can successfully create and view formatted markdown content (headers, bold, italic, lists) in a single session
- **SC-003**: 95% of first-time users can produce formatted markdown output within 2 minutes of opening the application
- **SC-004**: FR-009 validated - Application handles documents up to 10,000 characters with no perceptible input lag (under 16ms frame time)
- **SC-005**: FR-005 validated - Layout renders correctly across viewport range 320px-1920px with appropriate responsive behavior (split-screen desktop, toggle mobile)
- **SC-006**: FR-012/FR-013/FR-014 validated - Dark mode toggle is visible and functional; system preference is respected on load; preference persists across page reloads
