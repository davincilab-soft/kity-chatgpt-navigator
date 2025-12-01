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
   */
  static getScrollContainer(): Element | null {
    const main = this.getMain();
    if (!main) return null;
    return main.querySelector('.overflow-y-auto');
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
