# API Contracts: Querystring Persistence

**Feature**: Querystring Persistence  
**Branch**: `002-querystring-persistence`  
**Date**: 2026-03-10

## Overview

This directory contains the public API contracts for the querystring persistence feature. These contracts define the interfaces that application code will use to interact with URL-based markdown persistence.

## Contract Types

This feature exposes the following public contracts:

1. **React Hook Contract** (`useUrlPersistence.contract.md`) - Custom hook for URL state management
2. **Utility Functions Contract** (`urlEncoder.contract.md`) - Encoding/decoding utilities
3. **TypeScript Types Contract** (`types.contract.md`) - Public type definitions

## Contract Stability

All contracts in this directory are considered **stable** once the feature is merged to main. Breaking changes require:

- Major version bump (if versioned)
- Migration guide for consumers
- Deprecation period for removed APIs

## Testing

Each contract MUST have corresponding tests that verify:

- ✅ Type safety (TypeScript compilation)
- ✅ Functional correctness (unit tests)
- ✅ Performance targets (benchmark tests)
- ✅ Error handling (edge case tests)

## Usage

Contracts are intended for:

- **Application developers**: Using the hook and utilities in React components
- **Test authors**: Writing tests against the public API
- **Documentation**: Generating API reference documentation
- **Type checking**: Ensuring TypeScript type safety
