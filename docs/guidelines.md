# LMS Engineering & Design Guidelines

This document serves as the source of truth for all development within the LMS project. The goal is to build a production-grade, scalable, and visually stunning "School Operating System".

## 1. Directory Structure & Modularization

To maintain scalability, we focus on modularity and separation of concerns rather than arbitrary limits.

*   **Modular Architecture**:
    *   **Single Responsibility**: Each file and component should ideally do *one* thing well. If a component handles API fetching, complex transformation, AND detailed rendering, split it up.
    *   **Complexity over Length**: Don't worry about line counts (e.g., long Tailwind strings or SVG paths are fine). Instead, worry about *cognitive load*. If a new developer has to read 500 lines of complex logic to understand a bug, it needs refactoring.
    *   **Co-location**: Keep related styles, tests, and sub-components close to where they are used (e.g., `Feature/components/SubComponent.tsx`).

## 2. File Documentation (Mandatory)

Every file must begin with a structured multi-line comment explaining its existence.

**Format:**

```typescript
/**
 * @file [Filename]
 * @description [Brief description of what this module does]
 * @module [Feature/Category Name]
 * @access [Public/Private/Protected]
 */
```

**Example:**

```typescript
/**
 * @file course-card.tsx
 * @description A card component used in the grid view to display course summaries.
 * Includes progress bars and enrollment status indicators.
 * @module Features/Courses
 */
```

## 3. Type Safety & TypeScript

We rely on the type system to catch errors at compile time.

*   **NO Explicit `any`**: Strictly forbidden. Use `unknown` if the type is truly uncertain, then narrow it.
*   **Strict Interfaces**: Define explicit interfaces for all component Props, API responses, and local state.
*   **Type Inference**: Let TS infer types where obvious (e.g., `const x = 5`), but be explicit for function returns and arguments.

## 4. Visual Design & User Experience

The application must feel "Premium" and "App-like", not like a basic website.

*   **Aesthetics**:
    *   Use sophisticated color palettes (e.g., slate/zinc neutrals with vibrant accent colors).
    *   Implement subtle border radii, deeply layered shadows, and glassmorphism effects where appropriate.
*   **Motion**:
    *   No sudden jumps. Use `framer-motion` for layout transitions, entry animations, and hover effects.
    *   Interactive elements must provide immediate visual feedback (scale-down on click, glow on hover).
*   **Whitespace**: Use generous padding and margins to let content breathe.
*   **Typography**: Use a modern sans-serif stack (Inter, Plus Jakarta Sans, or Geist).

## 5. Development Best Practices

*   **Functional Code**: Prefer pure functions. Avoid mutating objects; always spread/copy.
*   **State Management**:
    *   Use `React.useState` for simple local state.
    *   Use URL search params for bookmarkable state (filters, tabs).
    *   Use global stores (Zustand/Context) only when absolutely necessary (e.g., user session, theme).
*   **Validation**: Use **Zod** for all schema validation (forms, API responses).
*   **Error Handling**:
    *   Use Error Boundaries for preventing full-app crashes.
    *   Show "Toast" notifications for operation status (Success/Error).

## 6. Code Style

*   **Imports**: absolute imports (e.g., `~/components/ui` not `../../components/ui`).
*   **Exports**: Prefer named exports over default exports for effortless refactoring.
