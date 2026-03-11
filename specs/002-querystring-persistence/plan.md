# Implementation Plan: Querystring Persistence

**Branch**: `002-querystring-persistence` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-querystring-persistence/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement URL-based markdown persistence using querystring parameters. Users can share markdown content via URL without requiring server storage or file uploads. The system encodes markdown content using LZ-string compression into a URL-safe format stored in the `md` querystring parameter, automatically syncing URL state as users type (with 500ms debounce). On page load, markdown is decoded from the querystring and displayed in the editor. This enables seamless sharing and collaboration through simple URL copying.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5 (strict mode), React 19  
**Primary Dependencies**: LZ-string (compression), React hooks, Browser History API  
**Storage**: Browser URL querystring (client-side only, no server storage)  
**Testing**: Vitest 4 with Testing Library, user-event for interactions  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (static React SPA)  
**Performance Goals**: Encode/decode operations <100ms, URL updates debounced at 500ms  
**Constraints**: Browser URL length limits (~2048 chars for some browsers), URL-safe encoding required, no server-side persistence  
**Scale/Scope**: Single-user client-side application, markdown content limited by URL length after compression

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verify alignment with project principles:

- [x] **Test-First**: Unit tests for URL encoding/decoding, integration tests for save/load flows, E2E tests for browser navigation
- [x] **Type Safety**: Interfaces for URL parameter handling, type-safe encoding/decoding functions
- [x] **Component-Driven**: Custom hooks for URL state management, utility functions for querystring operations
- [x] **Accessibility**: Keyboard shortcuts for sharing, screen reader announcements for save/load actions, visible sharing UI controls
- [x] **Simplicity (YAGNI)**: Minimal feature - only URL persistence without server-side storage or complex state management

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── components/
│   ├── App/
│   ├── Editor/
│   ├── Preview/
│   └── [new components for URL sharing UI]
├── hooks/
│   └── useUrlPersistence.ts       # New: Custom hook for URL state sync
├── utils/
│   ├── urlEncoder.ts              # New: LZ-string encoding utilities
│   └── urlEncoder.test.ts         # New: Unit tests for encoding
├── types/
│   └── urlPersistence.types.ts    # New: TypeScript interfaces
└── constants/
    └── index.ts                    # Add URL parameter constants
```

**Structure Decision**: Single project structure (existing). This feature adds URL persistence utilities as a new hook (`useUrlPersistence`) and encoding utilities (`urlEncoder`). No new components required unless UI controls for sharing are added. All new code follows existing component-driven architecture with hooks and utilities in their respective directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution principles satisfied. No complexity justification required.

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 design completion:_

- [x] **Test-First**: Comprehensive test suite defined in quickstart.md with TDD workflow (red-green-refactor)
- [x] **Type Safety**: All types defined in `urlPersistence.types.ts` with strict TypeScript compliance
- [x] **Component-Driven**: Custom hook (`useUrlPersistence`) follows React patterns, utility functions properly separated
- [x] **Accessibility**: No UI components in this feature (utilities only), accessibility handled by consuming components
- [x] **Simplicity (YAGNI)**: Minimal implementation - no premature optimization, React Compiler handles memoization

**Status**: ✅ **PASSED** - All principles satisfied, ready for implementation

## Implementation Notes

### Phase 0 Artifacts (Research)

- ✅ `research.md` - All technical decisions documented with rationale
- ✅ LZ-string compression library selected
- ✅ Performance targets defined (<100ms encode/decode)
- ✅ Error handling strategy established (Result types, no exceptions)

### Phase 1 Artifacts (Design)

- ✅ `data-model.md` - Complete data structures and state management
- ✅ `contracts/` - Public API contracts for hook, utilities, and types
- ✅ `quickstart.md` - Step-by-step TDD implementation guide
- ✅ Agent context updated in `.windsurf/rules/specify-rules.md`

### Key Design Decisions

1. **Custom Hook Pattern**: `useUrlPersistence` encapsulates all URL sync logic
2. **Result Types**: Discriminated unions for type-safe error handling
3. **Debounce Strategy**: 500ms trailing edge for optimal UX/performance balance
4. **URL Safety**: LZ-string provides URL-safe compression out of the box
5. **Silent Fallback**: Corrupt data gracefully falls back to default markdown

### Dependencies Added

- `lz-string@1.5.0` - String compression library (includes TypeScript definitions)

### Files to Create

```
src/
├── types/
│   └── urlPersistence.types.ts    # Type definitions
├── utils/
│   ├── urlEncoder.ts              # Encoding utilities
│   └── urlEncoder.test.ts         # Unit tests
├── hooks/
│   ├── useUrlPersistence.ts       # Custom hook
│   └── useUrlPersistence.test.tsx # Hook tests
└── constants/
    └── index.ts                    # Add URL constants
```

### Files to Modify

```
src/
├── components/App/App.tsx         # Integrate useUrlPersistence hook
├── hooks/index.ts                 # Export new hook
└── utils/index.ts                 # Export encoder utilities (create if needed)
```

## Next Steps

This plan is now complete. To proceed with implementation:

1. Run `/speckit.tasks` to generate task breakdown
2. Follow TDD workflow in `quickstart.md`
3. Implement tests first, validate failures, then implement features
4. Verify 100% test coverage before PR

## Artifacts Summary

| Artifact            | Status      | Location                           |
| ------------------- | ----------- | ---------------------------------- |
| Implementation Plan | ✅ Complete | `plan.md` (this file)              |
| Research            | ✅ Complete | `research.md`                      |
| Data Model          | ✅ Complete | `data-model.md`                    |
| API Contracts       | ✅ Complete | `contracts/*.md`                   |
| Quickstart Guide    | ✅ Complete | `quickstart.md`                    |
| Agent Context       | ✅ Updated  | `.windsurf/rules/specify-rules.md` |
