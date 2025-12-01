/**
 * Sidebar navigation logic for ChatGPT interface
 */

import { setFocusRing, showToast } from '../../../common/dom';
import { ChatGPTSelectors } from './selectors';

export class SidebarNavigator {
  /**
   * Focus the sidebar
   */
  focusSidebar(): void {
    const sidebar = ChatGPTSelectors.getSidebar();
    if (!sidebar) {
      showToast('No sidebar found');
      return;
    }

    const firstConversationLink = this.getFirstConversationLink(sidebar);
    // Get all focusable elements in the sidebar
    const focusableElements = ChatGPTSelectors.getSidebarFocusableElements();
    const filtered = this.filterRedundantFolderElements(focusableElements);

    const firstConversation = firstConversationLink ?? filtered.find((el) => this.isConversationLink(el));

    if (firstConversation) {
      setFocusRing(firstConversation);
    } else if (filtered.length > 0) {
      setFocusRing(filtered[0]);
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

  private isConversationLink(element: Element): boolean {
    if (element.tagName !== 'A') {
      return false;
    }
    const href = element.getAttribute('href');
    return !!(href && href.includes('/c/'));
  }

  /**
   * Check if element is a folder element (not a conversation link)
   */
  private isFolderElement(element: Element): boolean {
    const isButton = element.tagName === 'BUTTON';
    const isLink = element.tagName === 'A';

    if (!isButton && !isLink) {
      return false;
    }

    // Exclude specific buttons/labels that are NOT folders
    const text = element.textContent?.trim().toLowerCase();
    if (text === 'chats' || text === 'chat history') {
      return false;
    }

    // If it's a link, make sure it's NOT a conversation link
    if (isLink) {
      const href = element.getAttribute('href');
      if (href && href.includes('/c/')) {
        return false; // This is a conversation, not a folder
      }
    }

    return ChatGPTSelectors.isInSidebar(element);
  }

  /**
   * Filter out redundant folder elements (keep only every 3rd folder element)
   */
  private filterRedundantFolderElements(elements: Element[]): Element[] {
    const result: Element[] = [];
    let i = 0;
    let inConversations = false;

    while (i < elements.length) {
      const el = elements[i];
      const text = el.textContent?.trim().toLowerCase();

      // Once we hit "Chats" or a conversation link, everything after is conversation history
      if (!inConversations && (text === 'chats' || (el.tagName === 'A' && el.getAttribute('href')?.includes('/c/')))) {
        inConversations = true;
      }

      // If we're in conversation history, just add everything without checking
      if (inConversations) {
        result.push(el);
        i++;
        continue;
      }

      // Otherwise, check for folder triplets
      if (this.isFolderElement(el)) {
        const next1 = elements[i + 1];
        const next2 = elements[i + 2];

        // Check if next 2 elements are folders with same text (redundant siblings)
        if (next1 && next2 &&
            this.isFolderElement(next1) && this.isFolderElement(next2) &&
            next1.textContent?.trim() === text &&
            next2.textContent?.trim() === text) {
          // Skip the first 2, keep only the 3rd one
          result.push(next2);
          i += 3; // Skip all 3
        } else {
          // Not a triplet, just add this one
          result.push(el);
          i++;
        }
      } else {
        // Not a folder, just add it (includes "See more", etc.)
        result.push(el);
        i++;
      }
    }

    return result;
  }

  /**
   * Get the previous focusable element in the sidebar
   */
  private getPreviousFocusable(element: Element): Element | null {
    const allFocusable = ChatGPTSelectors.getSidebarFocusableElements();
    const filtered = this.filterRedundantFolderElements(allFocusable);

    const currentIndex = filtered.indexOf(element);
    if (currentIndex > 0) {
      return filtered[currentIndex - 1];
    }

    return null;
  }

  /**
   * Get the next focusable element in the sidebar
   */
  private getNextFocusable(element: Element): Element | null {
    const allFocusable = ChatGPTSelectors.getSidebarFocusableElements();
    const filtered = this.filterRedundantFolderElements(allFocusable);

    const currentIndex = filtered.indexOf(element);
    if (currentIndex >= 0 && currentIndex < filtered.length - 1) {
      return filtered[currentIndex + 1];
    }

    return null;
  }

  private getFirstConversationLink(sidebar: Element): Element | null {
    const links = Array.from(sidebar.querySelectorAll('a[href*="/c/"]'));
    if (links.length === 0) {
      return null;
    }

    // Prioritize visible links with text
    const visible = links.find((link) => {
      const rect = link.getBoundingClientRect();
      const hasText = link.textContent?.trim();
      return !!hasText && rect.height > 0 && rect.width > 0;
    });

    return visible ?? links[0];
  }
}
