/**
 * DOM selectors for Google Drive adapter
 */

export class GoogleDriveSelectors {
  /**
   * Main scrollable container in Drive
   */
  static getScrollContainer(): Element | null {
    return document.querySelector('.a-s-T') || document.scrollingElement || document.documentElement;
  }

  /**
   * Main view area
   */
  static getMain(): Element | null {
    return document.querySelector('div[role="main"]') || document.querySelector('.drive-view');
  }
}
