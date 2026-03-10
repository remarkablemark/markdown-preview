# Feature Specification: Querystring Persistence

**Feature Branch**: `002-querystring-persistence`
**Created**: 2026-03-10
**Status**: Ready
**Input**: User description: "save/load markdown in querystring"

## Clarifications

### Session 2026-03-10

- Q: What querystring parameter name should be used for storing markdown content? → A: Use short semantic name `md`
- Q: What debounce delay duration should be used for URL updates? → A: 500ms delay balancing responsiveness and performance
- Q: What compression algorithm should be used for markdown content? → A: LZ-string library for JavaScript string compression with URL-safe output
- Q: What should happen when content exceeds URL length limits after compression? → A: Log console.warn and continue to update URL
- Q: What performance target should encode/decode operations meet? → A: Complete under 100ms for imperceptible delays
- Q: What content should be shown when querystring is empty or corrupt? → A: Show default markdown placeholder with example syntax
- Q: What happens when users manually edit the URL querystring? → A: Ignore manual edits and only load querystring on initial page load

## Constitution Alignment

Verify this feature adheres to project principles:

| Principle           | Application to This Feature                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Test-First          | Unit tests for URL encoding/decoding, integration tests for save/load flows, E2E tests for browser navigation  |
| Type Safety         | Interfaces for URL parameter handling, type-safe encoding/decoding functions                                   |
| Component-Driven    | Hooks for URL state management, utility functions for querystring operations                                   |
| Accessibility First | Keyboard shortcuts for sharing, screen reader announcements for save/load actions, visible sharing UI controls |
| Simplicity (YAGNI)  | Minimal feature - only URL persistence without server-side storage or complex state management                 |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Share Markdown via URL (Priority: P1)

A user writes markdown content in the editor and wants to share it with others by copying a URL that contains the markdown text.

**Why this priority**: This is the core value proposition - enabling users to share markdown content without requiring file uploads, accounts, or server storage. This is the MVP that delivers immediate value.

**Independent Test**: Can be fully tested by entering markdown text, triggering a save action, and verifying the URL contains encoded markdown that can be copied and shared.

**Acceptance Scenarios**:

1. **Given** user has entered markdown text in the editor, **When** user triggers save to URL action, **Then** the browser URL updates to include the markdown content as a query parameter
2. **Given** user has markdown content in the URL, **When** user copies the URL, **Then** the copied URL contains the complete markdown content in encoded form
3. **Given** user has a URL with markdown content, **When** user shares the URL with another person, **Then** the recipient can open the URL and see the same markdown content

---

### User Story 2 - Load Markdown from URL (Priority: P1)

A user receives a URL containing markdown content and wants to view and edit it in the markdown preview application.

**Why this priority**: This is the complementary half of the sharing feature - without loading, saving is useless. Both save and load together form the complete MVP.

**Independent Test**: Can be fully tested by navigating to a URL with encoded markdown in the querystring and verifying the editor loads with that content.

**Acceptance Scenarios**:

1. **Given** user opens a URL with markdown in the querystring, **When** the page loads, **Then** the editor displays the decoded markdown content
2. **Given** user has loaded markdown from URL, **When** user edits the content, **Then** the changes are reflected in both the editor and the URL automatically
3. **Given** user opens a URL without markdown in the querystring, **When** the page loads, **Then** the editor displays default markdown placeholder content

---

### User Story 3 - Realtime URL Synchronization (Priority: P2)

A user edits markdown content and the URL automatically updates in realtime to reflect the current state without requiring explicit save actions.

**Why this priority**: This enables seamless sharing and eliminates the need for manual save actions. Users can copy the URL at any time and it will contain their current work.

**Independent Test**: Can be fully tested by typing in the editor and observing the URL update automatically as content changes.

**Acceptance Scenarios**:

1. **Given** user is typing in the editor, **When** user pauses or continues typing, **Then** the URL updates automatically to reflect the current editor content
2. **Given** user has made edits, **When** user copies the URL at any time, **Then** the copied URL contains the most recent content
3. **Given** user has content in the editor, **When** user navigates away, **Then** navigation proceeds without warning (content is already persisted in URL)

---

### Edge Cases

- What happens when the markdown content exceeds URL length limits (typically 2048 characters for some browsers)? → Log console.warn and continue URL update
- How does the system handle special characters and Unicode in markdown content?
- What happens when the URL contains malformed or corrupted encoded data?
- How does the system handle empty querystring parameters?
- What happens when users manually edit the URL querystring? → Ignore manual edits and only load querystring on initial page load

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST encode markdown content into a URL-safe format and store it in the `md` querystring parameter
- **FR-002**: System MUST decode markdown content from the `md` querystring parameter when loading the page
- **FR-003**: System MUST update the browser URL using replaceState (not pushState) to avoid creating browser history entries for each edit
- **FR-004**: System MUST load markdown from querystring on initial page load
- **FR-004a**: System MUST NOT reload content from querystring after initial page load (manual URL edits are ignored)
- **FR-005**: System MUST handle empty or missing querystring parameters gracefully by showing default markdown placeholder content
- **FR-006**: System MUST preserve all markdown formatting, including special characters and Unicode, through encode/decode cycle
- **FR-007**: System MUST automatically update the URL in realtime as the user types or edits markdown content
- **FR-007a**: System MUST debounce URL updates with a 500ms delay to avoid excessive updates while user is actively typing
- **FR-008**: System MUST compress markdown content using LZ-string algorithm before encoding to URL to maximize capacity within browser URL length limits
- **FR-008a**: System MUST log a console warning when compressed content exceeds URL length limits but continue to update the URL
- **FR-009**: System MUST handle malformed querystring data by silently falling back to default markdown placeholder content without showing error messages

### Key Entities

- **Markdown Content**: The raw markdown text entered by the user, including all formatting, special characters, and Unicode
- **Default Markdown Placeholder**: Example markdown content showing supported syntax (headings, lists, links, code blocks, etc.) displayed when no querystring parameter is present or data is corrupt
- **Encoded URL Parameter**: The URL-safe encoded representation of markdown content stored in the querystring
- **Browser URL State**: The current browser location including the querystring parameter containing markdown

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can share markdown content via URL and recipients can view identical content in under 5 seconds
- **SC-002**: System successfully encodes and decodes markdown content with 100% fidelity (no data loss or corruption)
- **SC-003**: Users can save markdown to URL and reload the page to see the same content without any manual copy/paste actions
- **SC-004**: System handles markdown content up to the browser's URL length limit without errors or data loss
- **SC-005**: Encode and decode operations complete in under 100ms for imperceptible user experience delays
