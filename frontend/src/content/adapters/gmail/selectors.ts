/**
 * DOM selectors and query helpers for Gmail interface
 */

export class GmailSelectors {
  /**
   * Get the sidebar navigation element
   */
  static getSidebar(): Element | null {
    return (
      document.querySelector('[role="navigation"]') ||
      document.querySelector('nav') ||
      document.querySelector('.aim')
    );
  }

  /**
   * Get the main content pane
   */
  static getMain(): Element | null {
    return (
      document.querySelector('[role="main"]') ||
      document.querySelector('main')
    );
  }

  /**
   * Get all email rows in the inbox
   */
  static getEmailRows(): Element[] {
    // Use tr.zA as primary selector (most reliable)
    const rows = Array.from(document.querySelectorAll('tr.zA'));

    // Fallback to role-based selector if needed
    if (rows.length === 0) {
      return Array.from(document.querySelectorAll('tr[role="row"]'));
    }

    return rows;
  }

  /**
   * Get the currently selected/focused email row
   */
  static getCurrentEmailRow(): Element | null {
    // Gmail uses aria-selected or specific focus classes
    return (
      document.querySelector('[aria-selected="true"]') ||
      document.querySelector('.x7') ||
      document.querySelector('tr.zA.btb')
    );
  }

  /**
   * Get the scroll container
   */
  static getScrollContainer(): Element | null {
    const main = this.getMain();
    if (!main) return null;

    // Gmail's main scroll container
    return main.querySelector('.Tm.aeJ') || main;
  }

  /**
   * Get all focusable elements in the sidebar
   */
  static getSidebarFocusableElements(): Element[] {
    const sidebar = this.getSidebar();
    if (!sidebar) return [];

    // Get all links and buttons in sidebar
    const elements = Array.from(
      sidebar.querySelectorAll('a, button, [role="button"]')
    );

    return elements.filter(el => {
      const text = el.textContent?.trim();
      return text && text.length > 0;
    });
  }

  /**
   * Check if element is inside the sidebar
   */
  static isInSidebar(element: Element): boolean {
    const sidebar = this.getSidebar();
    return !!(sidebar && sidebar.contains(element));
  }

  /**
   * Check if element is inside the main pane
   */
  static isInMain(element: Element): boolean {
    const main = this.getMain();
    return !!(main && main.contains(element));
  }
}
