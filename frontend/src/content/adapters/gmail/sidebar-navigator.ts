/**
 * Sidebar navigation logic for Gmail interface
 */

import { setFocusRing, showToast } from '../../../common/dom';
import { GmailSelectors } from './selectors';

export class SidebarNavigator {
  /**
   * Focus the sidebar
   */
  focusSidebar(): void {
    const sidebar = GmailSelectors.getSidebar();
    if (!sidebar) {
      showToast('No sidebar found');
      return;
    }

    // Get all focusable elements in the sidebar
    const focusableElements = GmailSelectors.getSidebarFocusableElements();

    if (focusableElements.length > 0) {
      setFocusRing(focusableElements[0]);
    } else {
      setFocusRing(sidebar);
    }
  }

  /**
   * Navigate up in the sidebar
   */
  navigateUp(): void {
    const focused = document.querySelector('.kity-focus');
    if (!focused) return;

    const prev = this.getPreviousFocusable(focused);
    if (!prev) return;

    setFocusRing(prev);
  }

  /**
   * Navigate down in the sidebar
   */
  navigateDown(): void {
    const focused = document.querySelector('.kity-focus');
    if (!focused) return;

    const next = this.getNextFocusable(focused);
    if (!next) return;

    setFocusRing(next);
  }

  /**
   * Get the previous focusable element in the sidebar
   */
  private getPreviousFocusable(element: Element): Element | null {
    const allFocusable = GmailSelectors.getSidebarFocusableElements();

    const currentIndex = allFocusable.indexOf(element);
    if (currentIndex > 0) {
      return allFocusable[currentIndex - 1];
    }

    return null;
  }

  /**
   * Get the next focusable element in the sidebar
   */
  private getNextFocusable(element: Element): Element | null {
    const allFocusable = GmailSelectors.getSidebarFocusableElements();

    const currentIndex = allFocusable.indexOf(element);
    if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
      return allFocusable[currentIndex + 1];
    }

    return null;
  }
}
