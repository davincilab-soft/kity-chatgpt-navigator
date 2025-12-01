/**
 * DOM selectors for Google Search adapter
 */

export class GoogleSearchSelectors {
  /**
   * Main results container
   */
  static getMain(): Element | null {
    return document.querySelector('#search') || document.querySelector('main');
  }

  /**
   * Scroll container for smooth scrolling
   */
  static getScrollContainer(): Element | null {
    return document.scrollingElement || document.documentElement || document.body;
  }
}
