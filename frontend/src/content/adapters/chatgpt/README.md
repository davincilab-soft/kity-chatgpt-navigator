# ChatGPT Adapter - Modular Structure

This directory contains the modular ChatGPT adapter implementation for Kity.

## Module Organization

### Core Files

- **`adapter.ts`** - Main adapter class that implements `IAdapter` interface and integrates all modules
- **`index.ts`** - Public exports for clean imports

### Modules

#### `selectors.ts`
DOM selectors and query helpers for ChatGPT interface
- Sidebar and main pane selectors
- User message queries
- Focusable element detection
- Parent element lookups (messages, code blocks)

#### `scroll-manager.ts`
Scroll management with acceleration and deceleration
- Start/stop scroll in up/down directions
- Smooth acceleration and deceleration
- Animation frame-based scrolling

#### `sidebar-navigator.ts`
Sidebar navigation logic
- Focus sidebar
- Navigate up/down through sidebar items
- Filter redundant folder elements
- Handle conversation links vs. folders

#### `user-message-navigator.ts`
User message navigation
- Enter/exit user navigation mode
- Navigate to previous/next user messages
- Maintain navigation state
- Auto-refresh message list
- Display message counter

#### `text-selector.ts`
Text selection logic for messages
- Select/deselect assistant messages
- Viewport-based message detection
- Extend selection up/down (line-based)
- Click-based message targeting

#### `code-copier.ts`
Code block copying with mouse tracking
- Mouse position-based block selection
- Distance threshold fallback to viewport center
- Multiple copy methods (clipboard API, execCommand)
- Green highlight animation on copy
- Multi-block handling

#### `trackers.ts`
Mouse and click tracking
- Click tracking for messages and code blocks
- Mouse position tracking
- Event delegation

## Usage

```typescript
import { ChatGPTAdapter } from './adapters/chatgpt';

const adapter = new ChatGPTAdapter();
adapter.init();
```

## Design Principles

1. **Single Responsibility** - Each module handles one specific aspect of functionality
2. **Loose Coupling** - Modules communicate through well-defined interfaces
3. **Testability** - Each module can be tested independently
4. **Maintainability** - Easy to locate and modify specific features
5. **Reusability** - Modules can be reused in other adapters if needed

## Adding New Features

1. Determine which module the feature belongs to
2. If it doesn't fit existing modules, create a new module file
3. Add the module to `adapter.ts` constructor and integrate
4. Export from `index.ts` if needed externally
5. Update this README

## Module Dependencies

```
adapter.ts (main)
├── selectors.ts (used by all modules)
├── scroll-manager.ts
│   └── selectors.ts
├── sidebar-navigator.ts
│   ├── selectors.ts
│   └── common/dom.ts
├── user-message-navigator.ts
│   ├── selectors.ts
│   └── common/dom.ts
├── text-selector.ts
│   ├── selectors.ts
│   └── common/dom.ts
├── code-copier.ts
│   ├── selectors.ts
│   └── common/dom.ts
└── trackers.ts
    └── selectors.ts
```
