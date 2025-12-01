/**
 * DOM selectors for Claude interface
 */

export class ClaudeSelectors {
  private static readonly SCROLL_CONTAINER_SELECTORS = [
    '[data-testid="conversation-view"]',
    '[data-testid="scroll-container"]',
    '[data-testid="chat-scroll-container"]',
    '[data-testid="conversation-list"]',
    '[data-scroll-container="true"]',
    '[data-testid="chat-history"]',
    '[data-testid="messages-scroll"]',
    '[data-testid="scrollable"]',
    '[data-testid*="Scroll"]',
    '[data-testid*="scroll"]',
    '.overflow-y-auto',
    '[class*="overflow-y-auto"]',
    '[class*="scroll"]',
    '[class*="Scroll"]',
  ];

  private static cachedScrollContainer: HTMLElement | null = null;

  /**
   * Main application surface
   */
  static getMain(): Element | null {
    return (
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('[data-testid="main-content"]')
    );
  }

  /**
   * Scrolling container for conversations
   */
  static getScrollContainer(): HTMLElement | null {
    if (
      this.cachedScrollContainer &&
      document.contains(this.cachedScrollContainer) &&
      this.isScrollableElement(this.cachedScrollContainer)
    ) {
      return this.cachedScrollContainer;
    }

    const container = this.findScrollContainer();
    if (container) {
      this.cachedScrollContainer = container;
      return container;
    }

    const fallback = document.scrollingElement as HTMLElement | null;
    if (fallback) {
      this.cachedScrollContainer = fallback;
      return fallback;
    }

    return document.body;
  }

  /**
   * Manually clear cached reference if DOM changes drastically
   */
  static resetScrollCache(): void {
    this.cachedScrollContainer = null;
  }

  private static findScrollContainer(): HTMLElement | null {
    const main = this.getMain();
    const searchRoots: (Element | Document | null)[] = [main, document];

    for (const root of searchRoots) {
      if (!root) {
        continue;
      }

      for (const selector of this.SCROLL_CONTAINER_SELECTORS) {
        const candidate = root.querySelector?.(selector);
        if (candidate instanceof HTMLElement && this.isScrollableElement(candidate)) {
          return candidate;
        }
      }
    }

    const scrollableWithinMain = this.findScrollableDescendant(main as HTMLElement | null);
    if (scrollableWithinMain) {
      return scrollableWithinMain;
    }

    const scrollableInDocument = this.findScrollableDescendant(document.body as HTMLElement | null);
    if (scrollableInDocument) {
      return scrollableInDocument;
    }

    return null;
  }

  private static findScrollableDescendant(root: HTMLElement | null): HTMLElement | null {
    if (!root) {
      return null;
    }

    const candidates: HTMLElement[] = [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let currentNode: Node | null = root;

    const visit = (node: Node | null): void => {
      if (!node) {
        return;
      }

      if (node instanceof HTMLElement && this.isScrollableElement(node)) {
        candidates.push(node);
      }
    };

    visit(currentNode);
    while ((currentNode = walker.nextNode())) {
      visit(currentNode);
    }

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => b.clientHeight - a.clientHeight);
    return candidates[0];
  }

  private static isScrollableElement(element: HTMLElement | null): element is HTMLElement {
    if (!element) {
      return false;
    }

    const style = window.getComputedStyle(element);
    const overflowAllowsScroll = style.overflowY === 'auto' || style.overflowY === 'scroll';
    const hasScrollableContent = element.scrollHeight - element.clientHeight > 32;

    return overflowAllowsScroll && hasScrollableContent;
  }
}
