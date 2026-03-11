---
description: 'Task list for querystring persistence feature implementation'
---

# Tasks: Querystring Persistence

**Input**: Design documents from `/specs/002-querystring-persistence/`
**Prerequisites**: spec.md (user stories), data-model.md (types), contracts/ (API contracts), research.md (technical decisions), quickstart.md (implementation guide)

**Constitution Compliance**:

- **Test-First**: Tests MUST be written before implementation (red-green-refactor)
- **Type Safety**: All new code requires explicit TypeScript types
- **100% Coverage**: All code must have 100% test coverage (except barrel exports)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single React project structure
- `src/` at repository root
- Component structure: `src/components/ComponentName/`
- Utilities: `src/utils/`
- Hooks: `src/hooks/`
- Types: `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create type definitions needed by all user stories

- [x] T001 Install lz-string@1.5.0 dependency via npm
- [x] T002 [P] Create type definitions in src/types/urlPersistence.types.ts
- [x] T003 [P] Add URL persistence constants to src/constants/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core URL encoding utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for URL Encoder (TDD - Red Phase)

- [x] T004 [P] Create urlEncoder unit tests in src/utils/urlEncoder.test.ts
- [x] T005 Verify urlEncoder tests fail (red phase validation)

### Implementation for URL Encoder (TDD - Green Phase)

- [x] T006 Implement encodeMarkdown function in src/utils/urlEncoder.ts
- [x] T007 Implement decodeMarkdown function in src/utils/urlEncoder.ts
- [x] T008 Implement checkUrlLength function in src/utils/urlEncoder.ts
- [x] T009 Verify urlEncoder tests pass with 100% coverage

### Barrel Exports

- [x] T010 Create barrel export in src/utils/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Share Markdown via URL (Priority: P1) 🎯 MVP

**Goal**: Enable users to save markdown content to URL and share it with others via a copyable link containing encoded markdown

**Independent Test**: Enter markdown text, trigger save action, verify URL contains encoded markdown that can be copied and shared

### Tests for User Story 1 (TDD - Red Phase)

- [x] T011 [P] [US1] Create useUrlPersistence hook tests in src/hooks/useUrlPersistence.test.tsx
- [x] T012 [US1] Verify useUrlPersistence tests fail (red phase validation)

### Implementation for User Story 1 (TDD - Green Phase)

- [x] T013 [US1] Implement debounce utility function in src/utils/debounce.ts
- [x] T014 [US1] Implement useUrlPersistence hook with URL encoding in src/hooks/useUrlPersistence.ts
- [x] T015 [US1] Implement setMarkdown function with debounced URL sync in src/hooks/useUrlPersistence.ts
- [x] T016 [US1] ~~Implement syncToUrl function for manual sync~~ (removed as unused)
- [x] T017 [US1] Add URL length warning logic in src/hooks/useUrlPersistence.ts
- [x] T018 [US1] Verify useUrlPersistence tests pass with 100% coverage

### Integration for User Story 1

- [x] T019 [US1] Create barrel export in src/hooks/index.ts
- [x] T020 [US1] Integrate useUrlPersistence hook into App component in src/components/App/App.tsx
- [x] T021 [US1] Update App component tests in src/components/App/App.test.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can save markdown to URL and share it

---

## Phase 4: User Story 2 - Load Markdown from URL (Priority: P1) 🎯 MVP

**Goal**: Enable users to open a URL containing markdown content and view/edit it in the application

**Independent Test**: Navigate to a URL with encoded markdown in querystring and verify the editor loads with that content

**Note**: This user story shares implementation with US1 (same hook handles both save and load)

### Tests for User Story 2 (Already covered in T011)

- [x] T022 [US2] Verify URL loading tests exist in src/hooks/useUrlPersistence.test.tsx
- [x] T023 [US2] Verify corrupt URL handling tests exist in src/hooks/useUrlPersistence.test.tsx
- [x] T024 [US2] Verify empty URL handling tests exist in src/hooks/useUrlPersistence.test.tsx

### Implementation for User Story 2 (Already in useUrlPersistence hook)

- [x] T025 [US2] Verify initial URL load logic in useUrlPersistence hook (useEffect on mount)
- [x] T026 [US2] ~~Verify loadedFromUrl flag is set correctly~~ (removed as unused)
- [x] T027 [US2] Verify fallback to DEFAULT_MARKDOWN on corrupt/empty URL in src/hooks/useUrlPersistence.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - complete save/load cycle functional

---

## Phase 5: User Story 3 - Realtime URL Synchronization (Priority: P2)

**Goal**: Automatically update URL in realtime as user edits markdown content without requiring explicit save actions

**Independent Test**: Type in the editor and observe the URL update automatically as content changes (with 500ms debounce)

**Note**: This user story is also implemented in the useUrlPersistence hook via debounced setMarkdown

### Tests for User Story 3 (Already covered in T011)

- [x] T028 [US3] Verify debounce timing tests exist in src/utils/debounce.test.ts
- [x] T029 [US3] Verify replaceState (not pushState) tests exist in src/hooks/useUrlPersistence.test.tsx
- [x] T030 [US3] Verify manual URL edit ignore tests exist in src/hooks/useUrlPersistence.test.tsx

### Implementation for User Story 3 (Already in useUrlPersistence hook)

- [x] T031 [US3] Verify 500ms debounce implementation in src/hooks/useUrlPersistence.ts
- [x] T032 [US3] Verify history.replaceState usage (not pushState) in src/hooks/useUrlPersistence.ts
- [x] T033 [US3] Verify URL only loaded on initial mount (manual edits ignored) in src/hooks/useUrlPersistence.ts

**Checkpoint**: All user stories should now be independently functional - complete realtime URL persistence working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks across all user stories

- [x] T034 [P] Run full test suite with coverage: npm run test:ci
- [x] T035 [P] Verify 100% test coverage for all new code (excluding barrel exports)
- [x] T036 [P] Run ESLint: npm run lint
- [x] T037 [P] Run TypeScript type check: npm run lint:tsc
- [x] T038 Build production bundle: npm run build
- [x] T039 Manual testing per quickstart.md validation scenarios
- [x] T040 Verify all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Shares implementation with US1 (same hook handles both)
  - User Story 3 (P2): Shares implementation with US1 (debounced sync in same hook)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Implemented in same hook as US1 - verify load logic exists
- **User Story 3 (P2)**: Implemented in same hook as US1 - verify debounce logic exists

### Within Each Phase

**Phase 1 (Setup)**:

- T001 must complete before T002-T003
- T002 and T003 can run in parallel

**Phase 2 (Foundational)**:

- T004 before T005 (write tests, then verify they fail)
- T005 before T006-T008 (red phase before green phase)
- T006-T008 can run in parallel (different functions in same file)
- T009 after T006-T008 (verify tests pass)
- T010 after T009 (barrel export after implementation)

**Phase 3 (User Story 1)**:

- T011 before T012 (write tests, then verify they fail)
- T012 before T013-T017 (red phase before green phase)
- T013 before T014-T016 (debounce utility needed by hook)
- T014-T017 can be sequential (same file, same hook)
- T018 after T013-T017 (verify tests pass)
- T019 can run in parallel with T020-T021
- T020-T021 sequential (integration and tests)

**Phase 4 (User Story 2)**:

- T022-T024 verification tasks (ensure tests exist)
- T025-T027 verification tasks (ensure implementation exists)

**Phase 5 (User Story 3)**:

- T028-T030 verification tasks (ensure tests exist)
- T031-T033 verification tasks (ensure implementation exists)

**Phase 6 (Polish)**:

- T034-T037 can run in parallel
- T038 after T034-T037
- T039-T040 after T038

### Parallel Opportunities

**Setup Phase**:

- T002 and T003 can run in parallel (different files)

**Foundational Phase**:

- T006, T007, T008 can run in parallel (different functions, same file - use multi_edit)

**User Story 1 Phase**:

- T019 can run in parallel with T020

**Polish Phase**:

- T034, T035, T036, T037 can all run in parallel (different commands)

---

## Parallel Example: Foundational Phase

```bash
# After T005 (red phase validation), implement all encoder functions together:
Task T006: "Implement encodeMarkdown function in src/utils/urlEncoder.ts"
Task T007: "Implement decodeMarkdown function in src/utils/urlEncoder.ts"
Task T008: "Implement checkUrlLength function in src/utils/urlEncoder.ts"

# Use multi_edit to add all three functions in one operation
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (save to URL)
4. Complete Phase 4: User Story 2 (load from URL)
5. **STOP and VALIDATE**: Test save/load cycle independently
6. Deploy/demo if ready

### Full Feature (All User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP save functionality
3. Add User Story 2 → Test independently → MVP load functionality (completes save/load cycle)
4. Add User Story 3 → Test independently → Realtime sync enhancement
5. Polish → Final validation → Deploy

### Single Developer Strategy

1. Complete Setup (T001-T003)
2. Complete Foundational with TDD (T004-T010)
3. Complete User Story 1 with TDD (T011-T021)
4. Verify User Story 2 implementation (T022-T027)
5. Verify User Story 3 implementation (T028-T033)
6. Polish and validate (T034-T040)

---

## Notes

- **TDD Workflow**: Write tests first (red), verify they fail, implement (green), verify they pass
- **Coverage**: 100% required for all new code (except barrel exports like index.ts)
- **[P] tasks**: Different files or independent operations, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Shared Implementation**: US1, US2, US3 all use the same useUrlPersistence hook
- **Verification Tasks**: US2 and US3 have verification tasks since implementation is shared with US1
- **File Paths**: All paths are exact and absolute from repository root
- **Commit Strategy**: Commit after each phase or logical group of tasks
- **Stop Points**: Each checkpoint allows independent validation of user story functionality
