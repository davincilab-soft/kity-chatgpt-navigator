# Changelog

All notable changes to the Kity extension will be documented in this file.

## [1.0.2] - 2026-01-05

### Improved
- **Enhanced Scrolling**: Further improvements to scrolling functionality with better scroll container detection across different ChatGPT versions
  - Improved compatibility with ChatGPT's dynamic DOM structure
  - Better handling of scroll containers in various page states

### Fixed
- **Copy Behavior**: Manual text selection is now fully respected
  - When you select text manually (with mouse or keyboard), Ctrl+C now copies exactly what you selected
  - Previously, Ctrl+C would sometimes copy the entire message instead of respecting user selection
  - Smart copy still works when no text is selected (copies code blocks or full messages based on context)

### Technical Changes
- Refactored codebase to prepare for multi-LLM support
- Improved adapter architecture for better maintainability
- Moved ChatGPT-specific code into dedicated adapter module

## [1.0.1] - 2026-01-01

### Changed
- **Extension Name**: Renamed from "Kity" to "Kity ChatGPT Navigator" for better discoverability in the Chrome Web Store (short name remains "Kity")

### Fixed
- **ChatGPT 5.2 Compatibility**: Fixed scrolling functionality (Ctrl+Up/Down) that stopped working after ChatGPT updated to version 5.2
  - Updated scroll container detection to support ChatGPT's new virtual scrolling implementation
  - Added detection for `[data-scroll-root="true"]` container
  - Changed scroll method from `scrollTop` modification to `scrollBy()` for compatibility with virtual scrolling
  - Maintained backward compatibility with older ChatGPT versions

### Technical Details
- ChatGPT 5.2 introduced a virtual scrolling mechanism that doesn't support direct `scrollTop` modification
- The extension now uses multiple fallback strategies to detect the correct scroll container
- Scroll animation now uses the `scrollBy()` method which is compatible with both traditional and virtual scrolling

## [1.0.0] - Initial Release

### Features
- Keyboard navigation for ChatGPT conversations
- Fast sidebar navigation with Ctrl+Left/Right
- Scroll through conversations with Ctrl+Up/Down
- Jump between user messages with Ctrl+Shift+Up/Down
- Copy message contents with Ctrl+C
- Jump to first/last message with Ctrl+A/Z
- Visual focus indicators
- Christmas theme decorations (optional)
