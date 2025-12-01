/**
 * Gmail DOM Explorer - Helper utilities for discovering Gmail's DOM structure
 * Use these functions in the browser console to explore Gmail's structure
 */

export class GmailDOMExplorer {
  /**
   * Log all elements with role attributes (helps identify key UI components)
   */
  static logRoleElements(): void {
    console.log('[Gmail DOM Explorer] === Elements with role attributes ===');
    const elements = document.querySelectorAll('[role]');
    elements.forEach((el, index) => {
      const role = el.getAttribute('role');
      const ariaLabel = el.getAttribute('aria-label');
      const classes = el.className;
      const id = el.id;
      console.log(`${index}: role="${role}" aria-label="${ariaLabel}" id="${id}" classes="${classes}"`);
    });
  }

  /**
   * Log the main navigation/sidebar structure
   */
  static logNavigation(): void {
    console.log('[Gmail DOM Explorer] === Navigation/Sidebar ===');
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav) {
      console.log('Found nav element:', nav);
      console.log('Nav classes:', nav.className);
      console.log('Nav children:', nav.children.length);
      Array.from(nav.children).forEach((child, i) => {
        console.log(`  Child ${i}:`, child.tagName, child.className, child.textContent?.trim().substring(0, 30));
      });
    } else {
      console.log('No nav element found');
    }
  }

  /**
   * Log the main content area structure
   */
  static logMainContent(): void {
    console.log('[Gmail DOM Explorer] === Main Content Area ===');
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      console.log('Found main element:', main);
      console.log('Main classes:', main.className);
      console.log('Main children:', main.children.length);
    } else {
      console.log('No main element found, checking for table rows...');
      const rows = document.querySelectorAll('tr[role="row"]');
      console.log('Found', rows.length, 'email rows');
      if (rows.length > 0) {
        console.log('First row:', rows[0]);
        console.log('First row classes:', rows[0].className);
      }
    }
  }

  /**
   * Log all email row elements
   */
  static logEmailRows(): void {
    console.log('[Gmail DOM Explorer] === Email Rows ===');

    // Try different selectors
    const selectors = [
      'tr[role="row"]',
      'tr.zA',
      'tr[data-legacy-message-id]',
      '.zA',
      '[data-message-id]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Selector "${selector}" found ${elements.length} elements`);
        const first = elements[0];
        console.log('  First element:', first);
        console.log('  Classes:', first.className);
        console.log('  Attributes:', Array.from(first.attributes).map(a => `${a.name}="${a.value}"`).join(', '));
      }
    });
  }

  /**
   * Log currently focused/selected element
   */
  static logFocusedElement(): void {
    console.log('[Gmail DOM Explorer] === Focused Element ===');
    const focused = document.activeElement;
    console.log('Active element:', focused);
    console.log('Tag:', focused?.tagName);
    console.log('Classes:', focused?.className);
    console.log('ID:', focused?.id);

    // Check for Gmail-specific focus indicators
    const selected = document.querySelector('[aria-selected="true"]') ||
                     document.querySelector('.x7') ||
                     document.querySelector('[class*="selected"]');
    if (selected) {
      console.log('Selected element:', selected);
      console.log('Selected classes:', selected.className);
    }
  }

  /**
   * Log sidebar buttons and links
   */
  static logSidebarButtons(): void {
    console.log('[Gmail DOM Explorer] === Sidebar Buttons ===');
    const sidebar = document.querySelector('nav') || document.querySelector('.aim');
    if (!sidebar) {
      console.log('Sidebar not found');
      return;
    }

    const buttons = sidebar.querySelectorAll('a, button, [role="button"]');
    console.log(`Found ${buttons.length} clickable elements in sidebar`);
    buttons.forEach((btn, i) => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      const href = (btn as HTMLAnchorElement).href;
      console.log(`${i}: "${text}" aria-label="${ariaLabel}" href="${href}"`);
    });
  }

  /**
   * Run all explorers
   */
  static exploreAll(): void {
    console.group('%c=== GMAIL DOM EXPLORATION ===', 'color: #FF6B6B; font-size: 16px; font-weight: bold;');

    console.group('%cNavigation/Sidebar', 'color: #4ECDC4; font-weight: bold;');
    this.logNavigation();
    console.groupEnd();

    console.group('%cMain Content Area', 'color: #4ECDC4; font-weight: bold;');
    this.logMainContent();
    console.groupEnd();

    console.group('%cEmail Rows', 'color: #4ECDC4; font-weight: bold;');
    this.logEmailRows();
    console.groupEnd();

    console.group('%cSidebar Buttons', 'color: #4ECDC4; font-weight: bold;');
    this.logSidebarButtons();
    console.groupEnd();

    console.group('%cFocused Element', 'color: #4ECDC4; font-weight: bold;');
    this.logFocusedElement();
    console.groupEnd();

    console.group('%cRole Elements', 'color: #4ECDC4; font-weight: bold;');
    this.logRoleElements();
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Make explorer available globally for console use
   */
  static expose(): void {
    (window as any).gmailExplorer = this;
  }
}
