# Tasks: Markdown Editor and Preview

**Input**: Design documents from `/specs/001-markdown-editor-preview/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Constitution Compliance**:

- **Test-First**: Tests MUST be written before implementation (TDD cycle)
- **Type Safety**: All new code requires explicit TypeScript types
- **Accessibility**: A11y tasks included for user-facing components

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project structure with component-driven architecture:

- Components: `src/components/`
- Hooks: `src/hooks/`
- Types: `src/types/`
- Tests: Co-located with components (`.test.tsx`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and verify project structure

- [ ] T001 Install markdown parser dependencies: `npm install marked dompurify`
- [ ] T002 [P] Verify TypeScript compilation: `npm run lint:tsc`
- [ ] T003 [P] Verify existing tests pass: `npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create TypeScript types in `src/types/markdown.ts`:
  - `MarkdownDocument` interface
  - `EditorState` interface
  - `ViewportConfiguration` type
  - `PreviewOptions` interface
  - `LayoutMode` union type
- [ ] T005 [P] Create `useMarkdown` hook in `src/hooks/useMarkdown.ts`:
  - Import and configure marked parser
  - Implement memoized markdown parsing
  - Export `html`, `isEmpty`, `parse`, `options`, `setOptions`
- [ ] T006 [P] Add basic CSS layout utilities in `src/index.css`:
  - Flexbox container classes
  - Full viewport height utilities
  - Scroll overflow handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Write and Edit Markdown Content (Priority: P1) 🎯 MVP

**Goal**: Provide a text editor area where users can type and edit markdown content

**Independent Test**: User can open the application, type markdown syntax in the editor area, make edits to existing text, and see their changes reflected immediately

### Tests for User Story 1 (MANDATORY per Constitution) ⚠️

> **CONSTITUTION REQUIREMENT**: Test-First principle mandates tests MUST be written and validated to FAIL before implementation begins.

- [ ] T007 [P] [US1] Create Editor component test file `src/components/Editor/Editor.test.tsx` with failing tests:
  - Renders textarea with provided value
  - Calls onChange callback when user types
  - Displays placeholder when value is empty
  - Handles text selection and deletion
- [ ] T008 [P] [US1] Create integration test in `src/main.test.tsx` with failing tests:
  - User can type markdown text and see it appear in editor
  - User can modify existing text
  - User can select and delete content

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create Editor component structure:
  - `src/components/Editor/Editor.tsx` - main component
  - `src/components/Editor/index.ts` - barrel export
- [ ] T010 [US1] Implement Editor component in `src/components/Editor/Editor.tsx`:
  - Controlled textarea with value prop
  - onChange handler calling parent callback
  - Placeholder text support
  - TypeScript props interface
- [ ] T011 [US1] Add accessibility to Editor in `src/components/Editor/Editor.tsx`:
  - `aria-label="Markdown editor"`
  - Keyboard navigation support
  - Visible focus indicator
- [ ] T012 [US1] Update `src/main.tsx` to integrate Editor component
- [ ] T013 [US1] Add logging for editor operations (console for dev)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Live Preview of Rendered Markdown (Priority: P1) 🎯 MVP

**Goal**: Render markdown content as HTML in a preview panel with live updates

**Independent Test**: User types markdown with various formatting elements (headers, bold, lists) and sees correctly rendered HTML preview that updates as they type

### Tests for User Story 2 (MANDATORY per Constitution) ⚠️

> **CONSTITUTION REQUIREMENT**: Test-First principle mandates tests MUST be written and validated to FAIL before implementation begins.

- [ ] T014 [P] [US2] Create Preview component test file `src/components/Preview/Preview.test.tsx` with failing tests:
  - Renders markdown as HTML
  - Sanitizes dangerous HTML (XSS prevention)
  - Shows empty state when markdown is empty
  - Updates when markdown prop changes
- [ ] T015 [P] [US2] Create integration test in `src/main.test.tsx` with failing tests:
  - Preview updates automatically as user types in editor
  - Headers, bold, italic, lists render correctly
  - Empty editor shows empty preview state

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create Preview component structure:
  - `src/components/Preview/Preview.tsx` - main component
  - `src/components/Preview/index.ts` - barrel export
- [ ] T017 [US2] Implement Preview component in `src/components/Preview/Preview.tsx`:
  - Import marked parser via useMarkdown hook
  - Render sanitized HTML output
  - Empty state placeholder support
  - TypeScript props interface
- [ ] T018 [US2] Add HTML sanitization with DOMPurify in `src/components/Preview/Preview.tsx`:
  - Import DOMPurify
  - Sanitize marked output before rendering
  - Treat pasted HTML as plain text (FR-010)
- [ ] T019 [US2] Add accessibility to Preview in `src/components/Preview/Preview.tsx`:
  - `role="region"`
  - `aria-label="Markdown preview"`
  - `aria-live="polite"` for dynamic updates
- [ ] T020 [US2] Update `src/main.tsx` to integrate Editor + Preview with state management:
  - Lift markdown state to App/main
  - Pass state to both Editor and Preview
  - Wire up onChange to update shared state

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently and together (MVP complete)

---

## Phase 5: User Story 3 - Split-Screen Editor and Preview Layout (Priority: P2)

**Goal**: Display editor and preview side-by-side on desktop with toggle for mobile

**Independent Test**: Application displays editor and preview panels visible simultaneously with appropriate sizing and scroll behavior

### Tests for User Story 3 (MANDATORY per Constitution) ⚠️

> **CONSTITUTION REQUIREMENT**: Test-First principle mandates tests MUST be written and validated to FAIL before implementation begins.

- [ ] T021 [P] [US3] Create Layout component test file `src/components/Layout/Layout.test.tsx` with failing tests:
  - Displays split view (50/50) on desktop viewport
  - Each pane scrolls independently
  - Toggle button switches editor/preview on mobile
  - Full viewport height layout
- [ ] T022 [P] [US3] Create responsive layout integration test in `src/main.test.tsx` with failing tests:
  - Desktop (≥768px): Editor and preview side-by-side
  - Mobile (<768px): Toggle between editor-only and preview-only
  - Independent vertical and horizontal scrolling

### Implementation for User Story 3

- [ ] T023 [P] [US3] Create Layout component structure:
  - `src/components/Layout/Layout.tsx` - main component
  - `src/components/Layout/index.ts` - barrel export
- [ ] T024 [US3] Implement Layout component in `src/components/Layout/Layout.tsx`:
  - Flexbox container with flex-direction row
  - Editor and Preview panes with flex: 1
  - Mobile toggle button
  - Viewport mode state management
- [ ] T025 [US3] Add responsive CSS in `src/index.css`:
  - Media query at 768px breakpoint
  - Split mode: `flex-direction: row`, both panes visible
  - Mobile mode: toggle visibility with hidden class
  - Independent overflow: auto for each pane
- [ ] T026 [US3] Add accessibility to Layout toggle in `src/components/Layout/Layout.tsx`:
  - `aria-label` indicating current view
  - `aria-pressed` state for toggle button
  - Keyboard accessible toggle
- [ ] T027 [US3] Update `src/main.tsx` to wrap Editor and Preview with Layout
- [ ] T028 [US3] Add performance optimization for large documents:
  - Test with 10,000+ characters
  - Verify <16ms frame time
  - Add `useDeferredValue` if needed for preview updates

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Clear Empty State Guidance (Priority: P3)

**Goal**: Display helpful placeholder or example content when editor is empty

**Independent Test**: Empty editor displays placeholder or example markdown showing users what they can do

### Tests for User Story 4 (MANDATORY per Constitution) ⚠️

> **CONSTITUTION REQUIREMENT**: Test-First principle mandates tests MUST be written and validated to FAIL before implementation begins.

- [ ] T029 [P] [US4] Create empty state test in `src/components/Editor/Editor.test.tsx` with failing tests:
  - Placeholder displays when editor is empty on load
  - Placeholder disappears when user starts typing
  - Placeholder reappears when all content is cleared
- [ ] T030 [P] [US4] Create empty state test in `src/components/Preview/Preview.test.tsx` with failing tests:
  - Preview shows empty state message when no content
  - Empty state is visually distinct (styled)

### Implementation for User Story 4

- [ ] T031 [US4] Add placeholder styling in `src/components/Editor/Editor.tsx`:
  - CSS for placeholder text (gray, italic)
  - Example markdown text showing headers, bold, lists
- [ ] T032 [US4] Add empty state placeholder in `src/components/Preview/Preview.tsx`:
  - Default empty state message
  - Configurable via props
- [ ] T033 [US4] Update `src/types/markdown.ts` with `emptyPlaceholder` in PreviewOptions

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T034 [P] Run full test suite: `npm test` - all tests must pass
- [ ] T035 [P] Run type check: `npm run lint:tsc` - no errors
- [ ] T036 [P] Run linter: `npm run lint` - no errors
- [ ] T037 [P] Verify accessibility with browser DevTools
- [ ] T038 [P] Performance test with 10,000 character document
- [ ] T039 [P] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T040 [P] Mobile testing (iOS Safari, Android Chrome)
- [ ] T041 Update quickstart.md with actual implementation details
- [ ] T042 Code cleanup and refactoring pass
- [ ] T043 Update README.md with feature documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (shared state)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Wraps US1 and US2
- **User Story 4 (P3)**: Can start after US1 and US2 - Enhances empty state behavior

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component structure before implementation
- Core implementation before integration
- Accessibility before completion
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T004, T005, T006 can all run in parallel (different files)
- **Phase 3**: T007 and T008 (tests) can run in parallel; T009 (structure) can start after tests written
- **Phase 4**: T014 and T015 (tests) can run in parallel; T016 (structure) can start after tests written
- **Phase 5**: T021 and T022 (tests) can run in parallel; T023 (structure) can start after tests written
- **Phase 6**: T029 and T030 (tests) can run in parallel
- **Phase 7**: All polish tasks can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create Editor component test file src/components/Editor/Editor.test.tsx"
Task: "Create integration test in src/main.test.tsx"

# After tests written and failing, launch component structure:
Task: "Create Editor component structure (Editor.tsx, index.ts)"
```

---

## Parallel Example: Foundational Phase

```bash
# All foundational tasks can run in parallel (different files):
Task: "Create TypeScript types in src/types/markdown.ts"
Task: "Create useMarkdown hook in src/hooks/useMarkdown.ts"
Task: "Add basic CSS layout utilities in src/index.css"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Editor only)
4. Complete Phase 4: User Story 2 (Preview with live updates)
5. **STOP and VALIDATE**: Test MVP independently - editor + preview working
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Editor works → Test independently
3. Add User Story 2 → Preview works with live updates → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 → Split-screen layout → Test independently → Deploy/Demo
5. Add User Story 4 → Empty state guidance → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Editor)
   - Developer B: User Story 2 (Preview) - coordinates on shared state
3. After US1 + US2 complete:
   - Developer A: User Story 3 (Layout)
   - Developer B: User Story 4 (Empty state)
4. Stories complete and integrate independently

---

## Task Summary

| Phase     | Description                | Task Count |
| --------- | -------------------------- | ---------- |
| Phase 1   | Setup                      | 3          |
| Phase 2   | Foundational               | 3          |
| Phase 3   | User Story 1 (Editor)      | 7          |
| Phase 4   | User Story 2 (Preview)     | 10         |
| Phase 5   | User Story 3 (Layout)      | 8          |
| Phase 6   | User Story 4 (Empty State) | 5          |
| Phase 7   | Polish                     | 10         |
| **Total** |                            | **46**     |

### Tasks per User Story

- **US1 (P1)**: T007-T013 (7 tasks) - Editor component
- **US2 (P1)**: T014-T020 (7 tasks) - Preview component
- **US3 (P2)**: T021-T028 (8 tasks) - Layout component
- **US4 (P3)**: T029-T033 (5 tasks) - Empty state

### Independent Test Criteria

| Story | Independent Test                            |
| ----- | ------------------------------------------- |
| US1   | User can type and edit markdown in editor   |
| US2   | User sees live preview updates as they type |
| US3   | Desktop: split-screen; Mobile: toggle views |
| US4   | Empty editor shows helpful placeholder      |

### Suggested MVP Scope

**Minimum Viable Product**: User Stories 1 + 2 only

- Editor component for typing markdown
- Preview component with live updates
- Basic vertical stacking layout (no split-screen required)
- Can be extended with US3 (layout) and US4 (polish) later

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths are absolute from repository root
