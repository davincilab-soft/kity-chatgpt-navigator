/**
 * DOM selectors and query helpers for Grok (X.AI) interface
 */

export class GrokSelectors {
  /**
   * Get the sidebar navigation element
   * TODO: Update with actual Grok DOM selectors
   */
  static getSidebar(): Element | null {
    // Placeholder - update with actual Grok sidebar selectors
    return document.querySelector('nav') || document.querySelector('aside');
  }

  /**
   * Get the main content pane
   * TODO: Update with actual Grok DOM selectors
   */
  static getMain(): Element | null {
    return document.querySelector('main');
  }

  /**
   * Get the scroll container within main pane
   * TODO: Update with actual Grok DOM selectors
   */
  static getScrollContainer(): Element | null {
    const main = this.getMain();
    if (!main) return null;

    // Look for scrollable container
    const container = main.querySelector('[class*="scroll"]');
    if (container) {
      return container;
    }

    return main;
  }

  /**
   * Get all messages in the conversation
   * TODO: Update with actual Grok message selectors
   */
  static getAllMessages(): Element[] {
    const main = this.getMain();
    const root: ParentNode = main ?? document;

    // Placeholder - update with actual Grok message selectors
    const messages = Array.from(root.querySelectorAll('[class*="message"], article'));

    return messages.filter(msg => msg.textContent?.trim());
  }

  /**
   * Get all focusable elements in the sidebar
   * TODO: Update with actual Grok sidebar navigation selectors
   */
  static getSidebarFocusableElements(): Element[] {
    const sidebar = this.getSidebar();
    if (!sidebar) return [];

    const allElements = Array.from(
      sidebar.querySelectorAll('a, button, [role="button"]')
    );

    return allElements.filter(el => {
      const text = el.textContent?.trim();
      return !!text;
    });
  }

  /**
   * Check if element is inside the sidebar
   */
  static isInSidebar(element: Element): boolean {
    const sidebar = this.getSidebar();
    return !!(sidebar && sidebar.contains(element));
  }
}
