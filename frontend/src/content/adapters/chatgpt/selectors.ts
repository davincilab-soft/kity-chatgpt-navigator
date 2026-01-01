/**
 * DOM selectors and query helpers for ChatGPT interface
 */

export class ChatGPTSelectors {
  private static readonly MESSAGE_SELECTOR = '[data-message-author-role], [data-message-id], article';
  /**
   * Get the sidebar navigation element
   */
  static getSidebar(): Element | null {
    return (
      document.querySelector('nav[aria-label="Chat history"]') ||
      document.querySelector('nav.flex-col.flex-1') ||
      document.querySelector('nav')
    );
  }

  /**
   * Get the main content pane
   */
  static getMain(): Element | null {
    return document.querySelector('main');
  }

  /**
   * Get the scroll container within main pane
   * Updated to support ChatGPT 5.2+ with multiple fallback strategies
   */
  static getScrollContainer(): Element | null {
    const main = this.getMain();
    if (!main) return null;

    // Strategy 1: ChatGPT 5.2+ uses [data-scroll-root="true"] as the primary scroll container
    let container = document.querySelector('[data-scroll-root="true"]');
    if (container) {
      return container;
    }

    // Also try searching within main
    container = main.querySelector('[data-scroll-root="true"]');
    if (container) {
      return container;
    }

    // Strategy 2: Try the old selector for backwards compatibility with older ChatGPT versions
    container = main.querySelector('.overflow-y-auto');
    if (container) {
      return container;
    }

    // Strategy 3: Find ALL elements with scrollable content (including overflow:hidden)
    // Fallback for cases where data-scroll-root is not present
    const allElements = main.querySelectorAll('*');
    for (const candidate of allElements) {
      // Skip tiny elements (like .sr-only) - must be at least 100px tall
      if (candidate.clientHeight < 100) {
        continue;
      }

      // Check if element has scrollable content (scrollHeight > clientHeight)
      if (candidate.scrollHeight > candidate.clientHeight) {
        // Test if scrollTop can be modified (element is actually scrollable)
        const oldScrollTop = candidate.scrollTop;
        candidate.scrollTop = oldScrollTop + 1;
        const canScroll = candidate.scrollTop !== oldScrollTop;
        candidate.scrollTop = oldScrollTop; // Restore original position

        if (canScroll) {
          return candidate;
        }
      }
    }

    // Strategy 4: Check if the page scrolls at the window level
    const currentScrollY = window.scrollY || window.pageYOffset;
    const canScrollWindow = document.documentElement.scrollHeight > window.innerHeight;

    if (canScrollWindow) {
      // Test if window can actually scroll
      window.scrollTo(0, currentScrollY + 1);
      const didScroll = window.scrollY !== currentScrollY;
      window.scrollTo(0, currentScrollY); // Restore

      if (didScroll) {
        return document.documentElement;
      }
    }

    // Strategy 5: Last resort - return main element itself
    return main;
  }

  /**
   * Get all user messages in the conversation
   */
  static getUserMessages(): Element[] {
    // Primary selector
    const messages = Array.from(
      document.querySelectorAll('[data-message-author-role="user"]')
    );

    // Fallback: try alternative selectors if primary fails
    if (messages.length === 0) {
      const fallback = Array.from(
        document.querySelectorAll('[data-message-id]')
      ).filter((msg) => {
        const role = msg.getAttribute('data-message-author-role');
        return role === 'user';
      });
      return fallback;
    }

    return messages;
  }

  /**
   * Get all messages (both user and assistant) in the main pane
   */
  static getAllMessages(excludeBottom = 0): Element[] {
    const main = this.getMain();
    const root: ParentNode = main ?? document;

    const messages = Array.from(root.querySelectorAll(this.MESSAGE_SELECTOR));

    if (excludeBottom > 0) {
      return messages.filter((msg) => {
        const rect = msg.getBoundingClientRect();
        return rect.bottom < window.innerHeight - excludeBottom && msg.textContent?.trim();
      });
    }

    return messages.filter(msg => msg.textContent?.trim());
  }

  /**
   * Get all focusable elements in the sidebar
   */
  static getSidebarFocusableElements(): Element[] {
    const sidebar = this.getSidebar();
    if (!sidebar) return [];

    const allElements = Array.from(
      sidebar.querySelectorAll('a, button, [role="button"], div')
    );

    return allElements.filter(el => {
      const text = el.textContent?.trim();

      if (!text) return false;

      // Simple navigation: only A, BUTTON, [role="button"]
      const isSimpleClickable =
        el.tagName === 'A' ||
        el.tagName === 'BUTTON' ||
        el.hasAttribute('role');

      // Special case: include the "Search chats" inner DIV (the one with "grow" class and text "Search chats")
      const isSearchChatsInner =
        el.tagName === 'DIV' &&
        text.toLowerCase() === 'search chats' &&
        el.classList.toString().includes('grow');

      return isSimpleClickable || isSearchChatsInner;
    });
  }

  /**
   * Find the copy button near a code block
   */
  static findCopyButton(codeBlock: Element): HTMLElement | null {
    // The copy button is usually a sibling or in the parent container
    const parent = codeBlock.parentElement;
    if (!parent) return null;

    // Look for button with copy-related attributes
    const button = parent.querySelector('button[class*="copy"], button[aria-label*="Copy"]');
    return button as HTMLElement | null;
  }

  /**
   * Check if element is inside the sidebar
   */
  static isInSidebar(element: Element): boolean {
    const sidebar = this.getSidebar();
    return !!(sidebar && sidebar.contains(element));
  }

  /**
   * Find parent message element for a given element
   */
  static findParentMessage(element: HTMLElement): Element | null {
    // Try closest first
    let messageElement = element.closest(this.MESSAGE_SELECTOR);

    // If not found, search up the DOM tree manually
    if (!messageElement) {
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        if (this.isMessageElement(parent)) {
          messageElement = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    return messageElement;
  }

  /**
   * Check if element represents a ChatGPT message
   */
  static isMessageElement(element: Element | null): element is Element {
    if (!element) {
      return false;
    }

    if (element.hasAttribute('data-message-author-role')) {
      return true;
    }

    if (element.hasAttribute('data-message-id')) {
      return true;
    }

    return element.tagName.toLowerCase() === 'article';
  }

  /**
   * Find parent code block element for a given element
   */
  static findParentCodeBlock(element: HTMLElement): Element | null {
    // Try closest first
    let codeBlock: Element | null = element.closest('pre');

    // If not found, search up the DOM tree manually
    if (!codeBlock) {
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        if (parent.tagName === 'PRE') {
          codeBlock = parent as Element;
          break;
        }
        parent = parent.parentElement;
      }
    }

    return codeBlock;
  }
}
