/**
 * DOM selectors for Wikipedia adapter
 */

export class WikipediaSelectors {
  static getScrollContainer(): Element | null {
    return document.scrollingElement || document.documentElement || document.body;
  }

  static getMain(): Element | null {
    return document.querySelector('#content') || document.querySelector('main') || document.body;
  }
}
