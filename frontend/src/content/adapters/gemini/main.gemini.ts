/**
 * Gemini Adapter - Basic implementation for Google Gemini interface
 *
 * TODO: This is a stub implementation. Update with actual Gemini-specific logic:
 * - Implement sidebar navigation
 * - Implement message navigation
 * - Implement text selection
 * - Implement copy functionality
 * - Update DOM selectors in selectors.ts
 */

import type { IAdapter } from '../../adapter.types';
import { showToast, setFocusRing } from '../../../common/dom';
import { GeminiSelectors } from './selectors';

export class GeminiAdapter implements IAdapter {
  id = 'gemini';
  supports = {
    sidebar: false,      // TODO: Enable when sidebar navigation is implemented
    mainPane: true,
    input: false,        // TODO: Enable when input field navigation is implemented
    userInputsNav: false, // TODO: Enable when user message navigation is implemented
  };

  init(): void {
    console.log('[Kity] Gemini adapter initialized (stub)');
    showToast('Gemini support is under development');
  }

  dispose?(): void {
    console.log('[Kity] Gemini adapter disposed');
  }

  // ==================== Pane Navigation ====================

  focusSidebar?(): void {
    // TODO: Implement sidebar focus for Gemini
    showToast('Gemini sidebar navigation coming soon');
  }

  focusMain?(): void {
    const main = GeminiSelectors.getMain();
    if (main) {
      setFocusRing(main, { scroll: false });
    } else {
      showToast('No main pane found');
    }
  }

  // ==================== Sidebar Navigation ====================

  navigateUp?(): void {
    // TODO: Implement sidebar navigation
    showToast('Gemini navigation coming soon');
  }

  navigateDown?(): void {
    // TODO: Implement sidebar navigation
    showToast('Gemini navigation coming soon');
  }

  // ==================== User Message Navigation ====================

  prevUser?(): void {
    // TODO: Implement user message navigation
    showToast('Gemini user navigation coming soon');
  }

  nextUser?(): void {
    // TODO: Implement user message navigation
    showToast('Gemini user navigation coming soon');
  }

  // ==================== Jump Navigation ====================

  jumpToFirst?(): void {
    const messages = GeminiSelectors.getAllMessages();
    if (messages.length > 0) {
      setFocusRing(messages[0]);
      showToast('First message');
    } else {
      showToast('No messages found');
    }
  }

  jumpToLast?(): void {
    const messages = GeminiSelectors.getAllMessages();
    if (messages.length > 0) {
      setFocusRing(messages[messages.length - 1]);
      showToast('Last message');
    } else {
      showToast('No messages found');
    }
  }

  // ==================== Text Selection ====================

  extendSelectionUp?(): void {
    // TODO: Implement text selection
    showToast('Gemini text selection coming soon');
  }

  extendSelectionDown?(): void {
    // TODO: Implement text selection
    showToast('Gemini text selection coming soon');
  }

  // ==================== Copy Functionality ====================

  copySelected?(): void {
    // TODO: Implement copy functionality
    showToast('Gemini copy functionality coming soon');
  }

  // ==================== Scrolling ====================

  startScroll?(direction: 'up' | 'down'): void {
    const container = GeminiSelectors.getScrollContainer();
    if (!container) return;

    const scrollAmount = direction === 'up' ? -50 : 50;
    container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  }

  stopScroll?(): void {
    // Scrolling stops automatically
  }

  // ==================== Sidebar Detection ====================

  isInSidebar?(): boolean {
    const currentFocus = document.querySelector('.kity-focus');
    if (!currentFocus) {
      return false;
    }

    return GeminiSelectors.isInSidebar(currentFocus);
  }
}
