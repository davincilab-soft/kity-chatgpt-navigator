/**
 * Grok Adapter - Basic implementation for X.AI's Grok interface
 *
 * TODO: This is a stub implementation. Update with actual Grok-specific logic:
 * - Implement sidebar navigation
 * - Implement message navigation
 * - Implement text selection
 * - Implement copy functionality
 * - Update DOM selectors in selectors.ts
 */

import type { IAdapter } from '../../adapter.types';
import { showToast, setFocusRing } from '../../../common/dom';
import { GrokSelectors } from './selectors';

export class GrokAdapter implements IAdapter {
  id = 'grok';
  supports = {
    sidebar: false,      // TODO: Enable when sidebar navigation is implemented
    mainPane: true,
    input: false,        // TODO: Enable when input field navigation is implemented
    userInputsNav: false, // TODO: Enable when user message navigation is implemented
  };

  init(): void {
    console.log('[Kity] Grok adapter initialized (stub)');
    showToast('Grok support is under development');
  }

  dispose?(): void {
    console.log('[Kity] Grok adapter disposed');
  }

  // ==================== Pane Navigation ====================

  focusSidebar?(): void {
    // TODO: Implement sidebar focus for Grok
    showToast('Grok sidebar navigation coming soon');
  }

  focusMain?(): void {
    const main = GrokSelectors.getMain();
    if (main) {
      setFocusRing(main, { scroll: false });
    } else {
      showToast('No main pane found');
    }
  }

  // ==================== Sidebar Navigation ====================

  navigateUp?(): void {
    // TODO: Implement sidebar navigation
    showToast('Grok navigation coming soon');
  }

  navigateDown?(): void {
    // TODO: Implement sidebar navigation
    showToast('Grok navigation coming soon');
  }

  // ==================== User Message Navigation ====================

  prevUser?(): void {
    // TODO: Implement user message navigation
    showToast('Grok user navigation coming soon');
  }

  nextUser?(): void {
    // TODO: Implement user message navigation
    showToast('Grok user navigation coming soon');
  }

  // ==================== Jump Navigation ====================

  jumpToFirst?(): void {
    const messages = GrokSelectors.getAllMessages();
    if (messages.length > 0) {
      setFocusRing(messages[0]);
      showToast('First message');
    } else {
      showToast('No messages found');
    }
  }

  jumpToLast?(): void {
    const messages = GrokSelectors.getAllMessages();
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
    showToast('Grok text selection coming soon');
  }

  extendSelectionDown?(): void {
    // TODO: Implement text selection
    showToast('Grok text selection coming soon');
  }

  // ==================== Copy Functionality ====================

  copySelected?(): void {
    // TODO: Implement copy functionality
    showToast('Grok copy functionality coming soon');
  }

  // ==================== Scrolling ====================

  startScroll?(direction: 'up' | 'down'): void {
    const container = GrokSelectors.getScrollContainer();
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

    return GrokSelectors.isInSidebar(currentFocus);
  }
}
